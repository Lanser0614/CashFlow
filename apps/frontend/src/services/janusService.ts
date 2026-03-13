import Janus from 'janus-gateway'
import type { JanusJS } from 'janus-gateway'
import adapter from 'webrtc-adapter'

interface JanusConfig {
  server: string
  roomId: number
  displayName: string
  onLocalStream: (stream: MediaStream) => void
  onRemoteStream: (feedId: number, displayName: string, stream: MediaStream) => void
  onRemoteStreamRemoved: (feedId: number) => void
  onError: (error: string) => void
  onCleanup: () => void
}

interface Publisher {
  id: number
  display?: string
}

class JanusVideoRoom {
  private janus: InstanceType<typeof Janus> | null = null
  private publisherHandle: JanusJS.PluginHandle | null = null
  private subscriberHandles: Map<number, JanusJS.PluginHandle> = new Map()
  private config: JanusConfig | null = null
  private roomId: number = 0
  private localStream: MediaStream | null = null
  private remoteStreams: Map<number, MediaStream> = new Map()

  async connect(config: JanusConfig): Promise<void> {
    this.config = config
    this.roomId = config.roomId

    return new Promise((resolve, reject) => {
      Janus.init({
        debug: false,
        dependencies: Janus.useDefaultDependencies({ adapter }),
        callback: () => {
          this.janus = new Janus({
            server: config.server,
            success: () => {
              this.attachPublisher().then(resolve).catch(reject)
            },
            error: (error: string) => {
              config.onError(`Janus connection error: ${error}`)
              reject(new Error(error))
            },
            destroyed: () => {
              config.onCleanup()
            },
          })
        },
      })
    })
  }

  private async attachPublisher(): Promise<void> {
    if (!this.janus || !this.config) return

    return new Promise((resolve, reject) => {
      this.janus!.attach({
        plugin: 'janus.plugin.videoroom',
        success: (handle: JanusJS.PluginHandle) => {
          this.publisherHandle = handle
          // Create the room first (idempotent — error 486 means it already exists)
          handle.send({
            message: {
              request: 'create',
              room: this.roomId,
              publishers: 6,
              bitrate: 512000,
              videocodec: 'vp8',
              audiocodec: 'opus',
              record: false,
              description: `CashFlow Room ${this.roomId}`,
            },
            success: () => {
              // Room created or already exists, now join
              handle.send({
                message: {
                  request: 'join',
                  room: this.roomId,
                  ptype: 'publisher',
                  display: this.config!.displayName,
                },
              })
            },
            error: () => {
              // Room likely already exists (error 486), join anyway
              handle.send({
                message: {
                  request: 'join',
                  room: this.roomId,
                  ptype: 'publisher',
                  display: this.config!.displayName,
                },
              })
            },
          })
          resolve()
        },
        error: (error: string) => {
          this.config!.onError(`Attach error: ${error}`)
          reject(new Error(error))
        },
        onmessage: (msg: JanusJS.Message, jsep?: JanusJS.JSEP) => {
          if (msg.videoroom === 'joined') {
            if (msg.publishers) {
              for (const pub of msg.publishers as Publisher[]) {
                this.subscribeToFeed(pub.id, pub.display || 'Unknown')
              }
            }
          } else if (msg.videoroom === 'event') {
            if (msg.publishers) {
              for (const pub of msg.publishers as Publisher[]) {
                this.subscribeToFeed(pub.id, pub.display || 'Unknown')
              }
            }
            if (msg.leaving || msg.unpublished) {
              const feedId = (msg.leaving || msg.unpublished) as number
              this.config!.onRemoteStreamRemoved(feedId)
              this.remoteStreams.delete(feedId)
              const sub = this.subscriberHandles.get(feedId)
              if (sub) {
                sub.detach()
                this.subscriberHandles.delete(feedId)
              }
            }
          }

          if (jsep) {
            this.publisherHandle?.handleRemoteJsep({ jsep })
          }
        },
        onlocaltrack: (track: MediaStreamTrack, on: boolean) => {
          if (on) {
            if (!this.localStream) {
              this.localStream = new MediaStream()
            }
            this.localStream.addTrack(track)
            this.config!.onLocalStream(this.localStream)
          } else if (this.localStream) {
            this.localStream.removeTrack(track)
            if (this.localStream.getTracks().length === 0) {
              this.localStream = null
            }
          }
        },
        oncleanup: () => {
          this.localStream = null
          this.config!.onCleanup()
        },
      })
    })
  }

  async publish(): Promise<void> {
    if (!this.publisherHandle) return

    return new Promise((resolve, reject) => {
      this.publisherHandle!.createOffer({
        tracks: [
          { type: 'audio', capture: true, recv: false },
          { type: 'video', capture: true, recv: false },
        ],
        success: (jsep: JanusJS.JSEP) => {
          this.publisherHandle!.send({
            message: { request: 'configure', audio: true, video: true },
            jsep,
          })
          resolve()
        },
        error: (error: Error) => {
          this.config?.onError(`Publish error: ${error.message}`)
          reject(error)
        },
      })
    })
  }

  async unpublish(): Promise<void> {
    if (!this.publisherHandle) return
    this.publisherHandle.send({
      message: { request: 'unpublish' },
    })
  }

  private subscribeToFeed(feedId: number, displayName: string): void {
    if (!this.janus || !this.config) return

    this.janus.attach({
      plugin: 'janus.plugin.videoroom',
      success: (handle: JanusJS.PluginHandle) => {
        this.subscriberHandles.set(feedId, handle)
        handle.send({
          message: {
            request: 'join',
            room: this.roomId,
            ptype: 'subscriber',
            feed: feedId,
          },
        })
      },
      error: (error: string) => {
        this.config!.onError(`Subscribe error: ${error}`)
      },
      onmessage: (_msg: JanusJS.Message, jsep?: JanusJS.JSEP) => {
        if (jsep) {
          const handle = this.subscriberHandles.get(feedId)
          if (!handle) return
          handle.createAnswer({
            jsep,
            tracks: [
              { type: 'audio', capture: false, recv: true },
              { type: 'video', capture: false, recv: true },
            ],
            success: (answerJsep: JanusJS.JSEP) => {
              handle.send({
                message: { request: 'start', room: this.roomId },
                jsep: answerJsep,
              })
            },
            error: (error: string) => {
              this.config!.onError(`Answer error: ${error}`)
            },
          })
        }
      },
      onremotetrack: (track: MediaStreamTrack, _mid: string, on: boolean) => {
        let stream = this.remoteStreams.get(feedId)
        if (on) {
          if (!stream) {
            stream = new MediaStream()
            this.remoteStreams.set(feedId, stream)
          }
          stream.addTrack(track)
          this.config!.onRemoteStream(feedId, displayName, stream)
        } else if (stream) {
          stream.removeTrack(track)
          if (stream.getTracks().length === 0) {
            this.remoteStreams.delete(feedId)
            this.config!.onRemoteStreamRemoved(feedId)
          }
        }
      },
    })
  }

  toggleMute(): boolean {
    if (!this.publisherHandle) return false
    if (this.publisherHandle.isAudioMuted()) {
      this.publisherHandle.unmuteAudio()
      return false
    } else {
      this.publisherHandle.muteAudio()
      return true
    }
  }

  toggleVideo(): boolean {
    if (!this.publisherHandle) return false
    if (this.publisherHandle.isVideoMuted()) {
      this.publisherHandle.unmuteVideo()
      return false
    } else {
      this.publisherHandle.muteVideo()
      return true
    }
  }

  destroy(): void {
    for (const [, handle] of this.subscriberHandles) {
      handle.detach()
    }
    this.subscriberHandles.clear()

    if (this.publisherHandle) {
      this.publisherHandle.detach()
      this.publisherHandle = null
    }

    this.localStream = null
    this.remoteStreams.clear()

    if (this.janus) {
      this.janus.destroy({})
      this.janus = null
    }

    this.config = null
  }
}

export const janusVideoRoom = new JanusVideoRoom()
