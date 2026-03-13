import { useEffect, useRef } from 'react'

interface VideoTileProps {
  stream: MediaStream | null
  playerName: string
  playerColor?: string
  isLocal?: boolean
  isMuted?: boolean
  isVideoOff?: boolean
}

export function VideoTile({ stream, playerName, playerColor = '#6366f1', isLocal, isMuted, isVideoOff }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div
      className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video"
      style={{ borderColor: playerColor, borderWidth: 2, borderStyle: 'solid' }}
    >
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: playerColor }}
          >
            {playerName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 flex items-center gap-1">
        <span className="text-white text-xs truncate flex-1">
          {playerName}{isLocal ? ' (Вы)' : ''}
        </span>
        {isMuted && (
          <span className="text-red-400 text-xs">🔇</span>
        )}
        {isVideoOff && (
          <span className="text-red-400 text-xs">📷</span>
        )}
      </div>
    </div>
  )
}
