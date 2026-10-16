import axios from 'axios'
import type { CsrfToken } from '@/type/auth'

const baseURL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
export const baseApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    const method = (config.method ?? 'get').toUpperCase()
    const safeMethods = ['GET', 'HEAD', 'OPTIONS']
    if (!safeMethods.includes(method)) {
      const { data } = await baseApi.get<CsrfToken>('/auth/csrf')
      config.headers['X-CSRF-Token'] = data.token
    }

    return config
  },
  (error) => Promise.reject(error),
)