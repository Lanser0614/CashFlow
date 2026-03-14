import { create } from 'zustand'
import { Room, RoomEvent } from 'livekit-client'
import { roomApi } from '../services/api'

interface RemoteStream {
  participantIdentity: string
  displayName: string
  stream: MediaStream
}

interface StreamState {
  isStreaming: boolean
  isMuted: boolean
  isVideoOff: boolean
  localStream: MediaStream | null
  remoteStreams: RemoteStream[]
  liveKitRoomName: string | null
  connectedRoomCode: string | null
  liveKitConnected: boolean
  error: string | null

  initializeLiveKit: (roomCode: string) => Promise<void>
  startStreaming: (roomCode: string) => Promise<void>
  stopStreaming: (roomCode: string) => Promise<void>
  toggleMute: () => Promise<void>
  toggleVideo: () => Promise<void>
  cleanup: () => void
}

type ParticipantWithTracks = {
  identity: string
  name?: string
  trackPublications: Map<string, { track?: { mediaStreamTrack?: MediaStreamTrack | null } | null }>
}

let liveKitRoom: Room | null = null
const remoteStreamsByIdentity = new Map<string, RemoteStream>()
let connectGeneration = 0

function canUseMediaDevices(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function'
}

function getMediaDevicesErrorMessage(): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'Камера и микрофон работают только по HTTPS или на localhost. Для сервера по IP используйте HTTPS.'
  }

  return 'Браузер не поддерживает доступ к камере и микрофону в текущем окружении.'
}

function formatLiveKitError(error: unknown, wsUrl?: string): string {
  const fallbackMessage = 'Не удалось подключить видео'

  if (!(error instanceof Error)) {
    return fallbackMessage
  }

  const message = error.message.trim()

  if (
    message.includes('Could not establish signal connection') ||
    message.includes('Connection refused') ||
    message.includes('Failed to fetch') ||
    message.includes('LiveKit connection is not available')
  ) {
    const target = wsUrl || 'серверу LiveKit'
    return `LiveKit недоступен по адресу ${target}. Запустите сервис livekit и проверьте порт 7880.`
  }

  if (
    message.includes('getUserMedia') ||
    message.includes("Cannot read properties of undefined (reading 'getUserMedia')")
  ) {
    return getMediaDevicesErrorMessage()
  }

  return message || fallbackMessage
}

function collectTracks(participant: ParticipantWithTracks): MediaStreamTrack[] {
  return Array.from(participant.trackPublications.values())
    .map((publication) => publication.track?.mediaStreamTrack ?? null)
    .filter((track): track is MediaStreamTrack => track !== null)
}

function syncRemoteParticipant(
  participant: ParticipantWithTracks,
  set: (partial: Partial<StreamState> | ((state: StreamState) => Partial<StreamState>)) => void,
): void {
  const tracks = collectTracks(participant)

  if (tracks.length === 0) {
    remoteStreamsByIdentity.delete(participant.identity)
  } else {
    remoteStreamsByIdentity.set(participant.identity, {
      participantIdentity: participant.identity,
      displayName: participant.name || participant.identity,
      stream: new MediaStream(tracks),
    })
  }

  set({ remoteStreams: Array.from(remoteStreamsByIdentity.values()) })
}

function syncLocalStream(
  set: (partial: Partial<StreamState> | ((state: StreamState) => Partial<StreamState>)) => void,
): void {
  if (!liveKitRoom) {
    set({ localStream: null })
    return
  }

  const localParticipant = liveKitRoom.localParticipant as ParticipantWithTracks
  const tracks = collectTracks(localParticipant)
  set({ localStream: tracks.length > 0 ? new MediaStream(tracks) : null })
}

export const useStreamStore = create<StreamState>((set, get) => ({
  isStreaming: false,
  isMuted: false,
  isVideoOff: false,
  localStream: null,
  remoteStreams: [],
  liveKitRoomName: null,
  connectedRoomCode: null,
  liveKitConnected: false,
  error: null,

  initializeLiveKit: async (roomCode: string) => {
    if (get().liveKitConnected && get().connectedRoomCode === roomCode && liveKitRoom) {
      return
    }

    let liveKitUrl: string | undefined

    try {
      get().cleanup()
      const generation = connectGeneration

      const access = await roomApi.getLiveKitToken(roomCode)
      liveKitUrl = access.ws_url
      const room = new Room()

      room.on(RoomEvent.TrackSubscribed, (_track, _publication, participant) => {
        if (liveKitRoom !== room) {
          return
        }
        syncRemoteParticipant(participant as unknown as ParticipantWithTracks, set)
      })

      room.on(RoomEvent.TrackUnsubscribed, (_track, _publication, participant) => {
        if (liveKitRoom !== room) {
          return
        }
        syncRemoteParticipant(participant as unknown as ParticipantWithTracks, set)
      })

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        if (liveKitRoom !== room) {
          return
        }
        remoteStreamsByIdentity.delete(participant.identity)
        set({ remoteStreams: Array.from(remoteStreamsByIdentity.values()) })
      })

      room.on(RoomEvent.LocalTrackPublished, () => {
        if (liveKitRoom !== room) {
          return
        }
        syncLocalStream(set)
      })

      room.on(RoomEvent.LocalTrackUnpublished, () => {
        if (liveKitRoom !== room) {
          return
        }
        syncLocalStream(set)
      })

      room.on(RoomEvent.MediaDevicesError, (error) => {
        if (liveKitRoom !== room) {
          return
        }
        set({ error: error.message })
      })

      room.on(RoomEvent.Disconnected, () => {
        if (liveKitRoom === room) {
          liveKitRoom = null
          remoteStreamsByIdentity.clear()
          set({
            isStreaming: false,
            isMuted: false,
            isVideoOff: false,
            localStream: null,
            remoteStreams: [],
            liveKitRoomName: null,
            connectedRoomCode: null,
            liveKitConnected: false,
          })
        }
      })

      await room.connect(access.ws_url, access.token)

      if (generation !== connectGeneration) {
        room.disconnect()
        return
      }

      liveKitRoom = room

      room.remoteParticipants.forEach((participant) => {
        syncRemoteParticipant(participant as unknown as ParticipantWithTracks, set)
      })

      set({
        liveKitRoomName: access.room_name,
        connectedRoomCode: roomCode,
        liveKitConnected: true,
        error: null,
      })
    } catch (e) {
      set({ error: formatLiveKitError(e, liveKitUrl) })
    }
  },

  startStreaming: async (roomCode: string) => {
    try {
      if (!liveKitRoom || get().connectedRoomCode !== roomCode) {
        await get().initializeLiveKit(roomCode)
      }

      if (!liveKitRoom) {
        throw new Error('LiveKit connection is not available')
      }

      if (!canUseMediaDevices()) {
        throw new Error(getMediaDevicesErrorMessage())
      }

      await liveKitRoom.localParticipant.setCameraEnabled(true)
      await liveKitRoom.localParticipant.setMicrophoneEnabled(true)
      syncLocalStream(set)
      set({ isStreaming: true, isMuted: false, isVideoOff: false, error: null })

      await roomApi.updateStreaming(roomCode, true).catch(() => {})
    } catch (e) {
      set({ error: formatLiveKitError(e) })
    }
  },

  stopStreaming: async (roomCode: string) => {
    try {
      if (!liveKitRoom) {
        return
      }

      await liveKitRoom.localParticipant.setCameraEnabled(false)
      await liveKitRoom.localParticipant.setMicrophoneEnabled(false)
      syncLocalStream(set)
      set({ isStreaming: false, isMuted: false, isVideoOff: false })

      await roomApi.updateStreaming(roomCode, false).catch(() => {})
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to stop streaming' })
    }
  },

  toggleMute: async () => {
    if (!liveKitRoom || !get().isStreaming) {
      return
    }

    try {
      if (!canUseMediaDevices()) {
        throw new Error(getMediaDevicesErrorMessage())
      }

      const nextMuted = !get().isMuted
      await liveKitRoom.localParticipant.setMicrophoneEnabled(!nextMuted)
      syncLocalStream(set)
      set({ isMuted: nextMuted, error: null })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to toggle microphone' })
    }
  },

  toggleVideo: async () => {
    if (!liveKitRoom || !get().isStreaming) {
      return
    }

    try {
      if (!canUseMediaDevices()) {
        throw new Error(getMediaDevicesErrorMessage())
      }

      const nextVideoOff = !get().isVideoOff
      await liveKitRoom.localParticipant.setCameraEnabled(!nextVideoOff)
      syncLocalStream(set)
      set({ isVideoOff: nextVideoOff, error: null })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to toggle camera' })
    }
  },

  cleanup: () => {
    connectGeneration += 1
    const { connectedRoomCode, isStreaming } = get()

    if (connectedRoomCode && isStreaming) {
      void roomApi.updateStreaming(connectedRoomCode, false).catch(() => {})
    }

    if (liveKitRoom) {
      liveKitRoom.disconnect()
      liveKitRoom = null
    }

    remoteStreamsByIdentity.clear()

    set({
      isStreaming: false,
      isMuted: false,
      isVideoOff: false,
      localStream: null,
      remoteStreams: [],
      liveKitRoomName: null,
      connectedRoomCode: null,
      liveKitConnected: false,
      error: null,
    })
  },
}))
