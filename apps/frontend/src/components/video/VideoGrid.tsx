import { VideoTile } from './VideoTile'
import { useStreamStore } from '../../store/streamStore'

interface VideoGridProps {
  isCompact?: boolean
  roomCode?: string
}

export function VideoGrid({ isCompact, roomCode }: VideoGridProps) {
  const {
    localStream,
    remoteStreams,
    isStreaming,
    isMuted,
    isVideoOff,
    liveKitConnected,
    initializeLiveKit,
    startStreaming,
    error,
  } = useStreamStore()

  const totalStreams = (isStreaming ? 1 : 0) + remoteStreams.length

  if (totalStreams === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-3">
        <span className="text-slate-500 text-sm">Нет активных видеопотоков</span>
        {roomCode && (
          liveKitConnected ? (
            <button
              onClick={() => {
                void startStreaming(roomCode)
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
              }}
            >
              📹 Начать стрим
            </button>
          ) : (
            <button
              onClick={() => {
                void initializeLiveKit(roomCode)
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: 'rgba(99,102,241,0.2)',
                color: '#6366f1',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              Подключить видео
            </button>
          )
        )}
        {!liveKitConnected && roomCode && (
          <span className="text-slate-600 text-xs">
            {error ? `Ошибка: ${error}` : 'Подключение будет выполнено после клика'}
          </span>
        )}
      </div>
    )
  }

  const gridCols = totalStreams <= 1 ? 'grid-cols-1' :
    totalStreams <= 4 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`grid ${gridCols} gap-1 ${isCompact ? 'p-1' : 'p-2'}`}>
      {isStreaming && localStream && (
        <VideoTile
          stream={localStream}
          playerName="Вы"
          isLocal
          isMuted={isMuted}
          isVideoOff={isVideoOff}
        />
      )}
      {remoteStreams.map((remote) => (
        <VideoTile
          key={remote.participantIdentity}
          stream={remote.stream}
          playerName={remote.displayName}
        />
      ))}
    </div>
  )
}
