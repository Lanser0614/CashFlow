import { connect } from 'nats.ws'
import type { NatsConnection, Subscription } from 'nats.ws'

let nc: NatsConnection | null = null

export async function getNatsConnection(): Promise<NatsConnection> {
  if (nc && !nc.isClosed()) return nc

  const wsPort = 9222
  const host = window.location.hostname || 'localhost'
  nc = await connect({
    servers: `ws://${host}:${wsPort}`,
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
