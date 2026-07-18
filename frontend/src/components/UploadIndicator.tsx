import { useUploadStore } from '../store/uploadStore'
import { Upload, CheckCircle, XCircle } from 'lucide-react'

const UploadIndicator = () => {
  const { uploads, removeUpload } = useUploadStore()
  if (uploads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {uploads.map(upload => (
        <div key={upload.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 w-80 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {upload.status === 'uploading' && <Upload className="w-4 h-4 text-blue-400 animate-pulse" />}
              {upload.status === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {upload.status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
              <span className="text-sm text-white truncate max-w-[200px]">{upload.fileName}</span>
            </div>
            {upload.status !== 'uploading' && (
              <button onClick={() => removeUpload(upload.id)} className="text-slate-400 hover:text-white text-xs">✕</button>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full">
            <div
              className={`h-full rounded-full transition-all ${
                upload.status === 'done' ? 'bg-green-500' :
                upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {upload.status === 'uploading' ? `${upload.progress}%` :
             upload.status === 'done' ? 'Done!' : 'Failed'}
          </p>
        </div>
      ))}
    </div>
  )
}

export default UploadIndicator
