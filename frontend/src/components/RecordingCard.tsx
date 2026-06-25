import { Play, Download, Trash2, MoreVertical, FileVideo, Clock, Shield, AlertTriangle, Loader } from 'lucide-react'
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
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getAIBadge = () => {
    if (!recording.aiAnalyzed) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
          <Loader className="w-3 h-3 animate-spin" />
          Analyzing...
        </span>
      )
    }
    if (recording.aiResult?.isAnomaly) {
      const score = recording.aiResult.anomalyScore
      const color = score > 0.8 ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      return (
        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${color}`}>
          <AlertTriangle className="w-3 h-3" />
          {recording.aiResult.predictedClass} {(score * 100).toFixed(0)}%
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/50 text-xs rounded-full">
        <Shield className="w-3 h-3" />
        Normal
      </span>
    )
  }

  return (
    <div className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-32 h-20 bg-slate-700 rounded-lg overflow-hidden cursor-pointer group/thumbnail"
             onClick={() => onPlay(recording)}>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
            <FileVideo className="w-8 h-8 text-slate-500" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs text-white font-medium">
            {formatDuration(recording.duration || 0)}
          </div>
          {/* AI anomaly overlay on thumbnail */}
          {recording.aiResult?.isAnomaly && (
            <div className="absolute top-1 left-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">
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
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              {recording.resolution || '1080p'}
            </span>
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
              {recording.frameRate || 30} FPS
            </span>
            {/* AI Badge */}
            {getAIBadge()}
          </div>

          {/* AI Result Details */}
          {recording.aiAnalyzed && recording.aiResult && (
            <div className="mt-2 p-2 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>AI Analysis</span>
                <span>Confidence: {((recording.aiResult.confidence || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    recording.aiResult.anomalyScore > 0.8 ? 'bg-red-500' :
                    recording.aiResult.anomalyScore > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(recording.aiResult.anomalyScore || 0) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button onClick={() => onPlay(recording)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Play">
            <Play className="w-5 h-5" />
          </button>
          <button onClick={() => onDownload(recording)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Download">
            <Download className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-20">
                  {isAdmin && (
                    <button onClick={() => { onDelete(recording); setShowMenu(false) }}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 flex items-center gap-2 transition-colors">
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
