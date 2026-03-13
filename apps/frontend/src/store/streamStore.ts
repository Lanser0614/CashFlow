import { create } from 'zustand'
import { janusVideoRoom } from '../services/janusService'
import { subscribeToRoom, closeNatsConnection } from '../services/natsClient'
import { roomApi } from '../services/api'
import type { Subscription } from 'nats.ws'

interface RemoteStream {
  feedId: number
  displayName: string
  stream: MediaStream
}

interface StreamState {
  isStreaming: boolean
  isMuted: boolean
  isVideoOff: boolean
  localStream: MediaStream | null
  remoteStreams: RemoteStream[]
  janusRoomId: number | null
  janusConnected: boolean
  error: string | null
  natsSubscription: Subscription | null

  initializeJanus: (roomCode: string, displayName: string) => Promise<void>
  startStreaming: (roomCode: string) => Promise<void>
  stopStreaming: (roomCode: string) => Promise<void>
  toggleMute: () => void
  toggleVideo: () => void
  cleanup: () => void
}

export const useStreamStore = create<StreamState>((set, get) => ({
  isStreaming: false,
  isMuted: false,
  isVideoOff: false,
  localStream: null,
  remoteStreams: [],
  janusRoomId: null,
  janusConnected: false,
  error: null,
  natsSubscription: null,

  initializeJanus: async (roomCode: string, displayName: string) => {
    try {
      console.log('[Stream] Fetching video room info for', roomCode)
      const info = await roomApi.getVideoRoom(roomCode)
      if (!info?.janus_room_id) {
        console.error('[Stream] No janus_room_id in response', info)
        set({ error: 'No video room available' })
        return
      }

      set({ janusRoomId: info.janus_room_id })
      console.log('[Stream] Got janus_room_id:', info.janus_room_id)

      const wsHost = window.location.hostname || 'localhost'
      const server = `ws://${wsHost}:8188`

      console.log('[Stream] Connecting to Janus at', server)
      await janusVideoRoom.connect({
        server,
        roomId: info.janus_room_id,
        displayName,
        onLocalStream: (stream) => {
          set({ localStream: stream })
        },
        onRemoteStream: (feedId, feedDisplayName, stream) => {
          set((state) => ({
            remoteStreams: [
              ...state.remoteStreams.filter((r) => r.feedId !== feedId),
              { feedId, displayName: feedDisplayName, stream },
            ],
          }))
        },
        onRemoteStreamRemoved: (feedId) => {
          set((state) => ({
            remoteStreams: state.remoteStreams.filter((r) => r.feedId !== feedId),
          }))
        },
        onError: (error) => {
          console.error('[Stream] Janus error:', error)
          set({ error })
        },
        onCleanup: () => {
          set({ localStream: null })
        },
      })

      console.log('[Stream] Janus connected successfully')
      set({ janusConnected: true })

      // Subscribe to NATS room events (non-blocking)
      subscribeToRoom(roomCode, (_subject, _data) => {
        // Streaming events are reflected in Janus callbacks already
      }).then((sub) => {
        set({ natsSubscription: sub })
        console.log('[Stream] NATS subscribed')
      }).catch((e) => {
        console.warn('[Stream] NATS subscription failed (non-critical):', e)
      })
    } catch (e) {
      console.error('[Stream] Initialize failed:', e)
      set({ error: e instanceof Error ? e.message : 'Failed to initialize video' })
    }
  },

  startStreaming: async (roomCode: string) => {
    try {
      await janusVideoRoom.publish()
      set({ isStreaming: true, error: null })

      // Notify backend
      await roomApi.updateStreaming(roomCode, true).catch(() => {})
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to start streaming' })
    }
  },

  stopStreaming: async (roomCode: string) => {
    try {
      await janusVideoRoom.unpublish()
      set({ isStreaming: false })

      // Stop local media tracks
      const { localStream } = get()
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop())
        set({ localStream: null })
      }

      await roomApi.updateStreaming(roomCode, false).catch(() => {})
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to stop streaming' })
    }
  },

  toggleMute: () => {
    const isMuted = janusVideoRoom.toggleMute()
    set({ isMuted })
  },

  toggleVideo: () => {
    const isVideoOff = janusVideoRoom.toggleVideo()
    set({ isVideoOff })
  },

  cleanup: () => {
    const { localStream, natsSubscription } = get()

    // Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop())
    }

    // Unsubscribe from NATS
    if (natsSubscription) {
      natsSubscription.unsubscribe()
    }

    // Destroy Janus session
    janusVideoRoom.destroy()

    // Close NATS
    closeNatsConnection().catch(() => {})

    set({
      isStreaming: false,
      isMuted: false,
      isVideoOff: false,
      localStream: null,
      remoteStreams: [],
      janusRoomId: null,
      janusConnected: false,
      error: null,
      natsSubscription: null,
    })
  },
}))
