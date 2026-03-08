import { Play, Download, Trash2, MoreVertical, FileVideo, Clock } from 'lucide-react'
import { Recording } from '../services/recordingService'
import { useState } from 'react'
import { format } from 'date-fns'

interface RecordingCardProps {
  recording: Recording
  isAdmin: boolean
  onPlay: (recording: Recording) => void
  onDownload: (recording: Recording) => void
  onDelete: (recording: Recording) => void
}

const RecordingCard = ({ recording, isAdmin, onPlay, onDownload, onDelete }: RecordingCardProps) => {
  const [showMenu, setShowMenu] = useState(false)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-32 h-20 bg-slate-700 rounded-lg overflow-hidden cursor-pointer group/thumbnail"
             onClick={() => onPlay(recording)}>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
            <FileVideo className="w-8 h-8 text-slate-500" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {/* Duration badge */}
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
            {formatDuration(recording.duration || 0)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover/thumbnail:text-primary-400 transition-colors">
            {recording.originalName}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <FileVideo className="w-4 h-4" />
              {formatSize(recording.size)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(recording.createdAt), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
              {recording.resolution || '1080p'}
            </span>
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
              {recording.frameRate || 30} FPS
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPlay(recording)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Play"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDownload(recording)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-20">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onDelete(recording)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecordingCard

