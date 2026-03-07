import { useState, useRef, useEffect } from 'react'
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Download } from 'lucide-react'
import { recordingService, Recording } from '../services/recordingService'

interface VideoPlayerModalProps {
  recording: Recording | null
  isOpen: boolean
  onClose: () => void
}

const VideoPlayerModal = ({ recording, isOpen, onClose }: VideoPlayerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setLoading(true)
      setError('')
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [isOpen, recording?._id])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.parentElement?.parentElement?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      setLoading(false)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    if (recording) {
      recordingService.download(recording._id, recording.originalName)
    }
  }

  if (!isOpen || !recording) return null

  const videoUrl = recordingService.getVideoUrl(recording._id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-5xl mx-4 overflow-hidden shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-semibold text-white">{recording.originalName}</h3>
            <p className="text-sm text-slate-400">
              {new Date(recording.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black aspect-video">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Loading video...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <button
                  onClick={() => {
                    setError('')
                    setLoading(true)
                    if (videoRef.current) {
                      videoRef.current.load()
                    }
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => {
              setLoading(false)
              setError('Failed to load video')
            }}
            onClick={togglePlay}
          />

          {/* Play overlay */}
          {!isPlaying && !loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <button
                onClick={togglePlay}
                className="w-20 h-20 bg-primary-600/90 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
              >
                <Play className="w-10 h-10 text-white ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-slate-700/50">
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerModal

