import { create } from 'zustand'

interface UploadTask {
  id: string
  fileName: string
  cameraId: string
  progress: number
  status: 'uploading' | 'done' | 'error'
}

interface UploadStore {
  uploads: UploadTask[]
  addUpload: (task: UploadTask) => void
  updateProgress: (id: string, progress: number) => void
  setStatus: (id: string, status: UploadTask['status']) => void
  removeUpload: (id: string) => void
}

export const useUploadStore = create<UploadStore>((set) => ({
  uploads: [],
  addUpload: (task) => set((s) => ({ uploads: [...s.uploads, task] })),
  updateProgress: (id, progress) => set((s) => ({
    uploads: s.uploads.map(u => u.id === id ? { ...u, progress } : u)
  })),
  setStatus: (id, status) => set((s) => ({
    uploads: s.uploads.map(u => u.id === id ? { ...u, status } : u)
  })),
  removeUpload: (id) => set((s) => ({ uploads: s.uploads.filter(u => u.id !== id) })),
}))
