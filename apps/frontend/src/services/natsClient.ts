import { connect } from 'nats.ws'
import type { NatsConnection, Subscription } from 'nats.ws'

let nc: NatsConnection | null = null

function getNatsServerUrl(): string {
  const configuredUrl = import.meta.env.VITE_NATS_WS_URL?.trim()

  if (configuredUrl) {
    return configuredUrl
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'

  if (import.meta.env.DEV) {
    return `${protocol}://${window.location.hostname || 'localhost'}:9222`
  }

  return `${protocol}://${window.location.host}/nats`
}

export async function getNatsConnection(): Promise<NatsConnection> {
  if (nc && !nc.isClosed()) return nc

  nc = await connect({
    servers: getNatsServerUrl(),
  })
  return nc
}

export async function subscribeToRoom(
  roomCode: string,
  handler: (subject: string, data: Record<string, unknown>) => void,
): Promise<Subscription> {
  const conn = await getNatsConnection()
  const sub = conn.subscribe(`room.${roomCode}.stream.>`)

  ;(async () => {
    for await (const msg of sub) {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.data)) as Record<string, unknown>
        handler(msg.subject, data)
      } catch {
        // skip malformed messages
      }
    }
  })()

  return sub
}

export async function closeNatsConnection(): Promise<void> {
  if (nc && !nc.isClosed()) {
    await nc.drain()
    nc = null
  }
}
