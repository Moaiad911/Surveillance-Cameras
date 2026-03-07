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
  duration?: number
  resolution?: string
  frameRate?: number
}

export interface RecordingStats {
  totalRecordings: number
  totalSize: number
  oldestRecording: string | null
  newestRecording: string | null
}

export const recordingService = {
  getByCamera: async (cameraId: string): Promise<Recording[]> => {
    const res = await api.get(`/recordings/${cameraId}`)
    return res.data
  },

  getAll: async (): Promise<Recording[]> => {
    const res = await api.get('/recordings')
    return res.data
  },

  getStats: async (): Promise<RecordingStats> => {
    const res = await api.get('/recordings/stats')
    return res.data
  },

  upload: async (cameraId: string, file: File, onProgress?: (progress: number) => void): Promise<Recording> => {
    const formData = new FormData()
    formData.append('video', file)

    const res = await api.post(`/recordings/${cameraId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
    return res.data.recording
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recordings/${id}`)
  },

  download: async (id: string, filename: string): Promise<void> => {
    const res = await api.get(`/recordings/${id}/download`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  getVideoUrl: (id: string): string => {
    return `${import.meta.env.VITE_API_URL || '/api'}/recordings/${id}/stream`
  },
}
