import api from '../lib/api'

export interface Recording {
  _id: string
  filename: string
  originalName: string
  path: string
  size: number
  cameraId: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
  duration?: number
  resolution?: string
  frameRate?: number
}

const getUrl = (path: string): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `https://surveillance-cameras-production.up.railway.app/${path.replace(/\\/g, '/')}`
}

export const recordingService = {
  getByCamera: async (cameraId: string): Promise<Recording[]> => {
    const res = await api.get(`/recordings/${cameraId}`)
    return res.data
  },
  upload: async (cameraId: string, file: File, onProgress?: (progress: number) => void): Promise<Recording> => {
    const formData = new FormData()
    formData.append('video', file)
    const res = await api.post(`/recordings/${cameraId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }
      },
    })
    return res.data.recording
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/recordings/${id}`)
  },
  download: (recording: Recording): void => {
    const url = getUrl(recording.path)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', recording.originalName)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
  getVideoUrl: (recording: Recording): string => {
    return getUrl(recording.path)
  },
}
