import api from '../lib/api'

export interface Camera {
  _id: string
  name: string
  model: string
  ipAddress: string
  streamURL: string
  location: string
  resolution: string
  frameRate: number
  recording: boolean
  status: 'Active' | 'Inactive'
  createdBy: string
  createdAt: string
}

export interface CameraInput {
  name: string
  model: string
  ipAddress: string
  streamURL: string
  location: string
  resolution: string
  frameRate: number
  recording: boolean
  status: 'Active' | 'Inactive'
}

export const cameraService = {
  getAll: async (): Promise<Camera[]> => {
    const res = await api.get('/cameras')
    return res.data
  },

  getById: async (id: string): Promise<Camera> => {
    const res = await api.get(`/cameras/${id}`)
    return res.data
  },

  create: async (data: CameraInput): Promise<Camera> => {
    const res = await api.post('/cameras', data)
    return res.data.camera
  },

  update: async (id: string, data: Partial<CameraInput>): Promise<Camera> => {
    const res = await api.put(`/cameras/${id}`, data)
    return res.data.camera
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cameras/${id}`)
  }
}
