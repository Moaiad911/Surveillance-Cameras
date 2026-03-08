import { X, Download } from 'lucide-react'
import { Recording, recordingService } from '../services/recordingService'
import { useEffect, useRef } from 'react'

interface VideoPlayerModalProps {
  recording: Recording | null
  isOpen: boolean
  onClose: () => void
}

const VideoPlayerModal = ({ recording, isOpen, onClose }: VideoPlayerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
    }
  }, [isOpen])

  if (!isOpen || !recording) return null

  const videoUrl = recordingService.getVideoUrl(recording)

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div
        className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold truncate">{recording.originalName}</h3>
            <p className="text-slate-400 text-sm">
              {new Date(recording.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })} · {formatSize(recording.size)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => recordingService.download(recording)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-black rounded-b-xl p-2">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            className="w-full rounded-lg max-h-[70vh]"
            onError={(e) => console.error('Video load error:', videoUrl, e)}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerModal
