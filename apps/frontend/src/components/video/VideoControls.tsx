import { useStreamStore } from '../../store/streamStore'

interface VideoControlsProps {
  roomCode: string
}

export function VideoControls({ roomCode }: VideoControlsProps) {
  const {
    isStreaming,
    isMuted,
    isVideoOff,
    liveKitConnected,
    error,
    startStreaming,
    stopStreaming,
    toggleMute,
    toggleVideo,
  } = useStreamStore()

  if (!liveKitConnected) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-2">
      {error && (
        <span className="text-red-400 text-xs truncate flex-1">{error}</span>
      )}

      {isStreaming ? (
        <>
          <button
            onClick={() => { void toggleMute() }}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isMuted ? '🔇 Вкл. микро' : '🎤 Микрофон'}
          </button>

          <button
            onClick={() => { void toggleVideo() }}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isVideoOff ? '📷 Вкл. камеру' : '📹 Камера'}
          </button>

          <button
            onClick={() => stopStreaming(roomCode)}
            className="px-3 py-1.5 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Стоп
          </button>
        </>
      ) : (
        <button
          onClick={() => startStreaming(roomCode)}
          className="px-3 py-1.5 rounded text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          📹 Включить камеру
        </button>
      )}
    </div>
  )
}
