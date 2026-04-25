import client from './client'
import type {
  AuthLoginResponse,
  AuthLogoutResponse,
  AuthStatusResponse,
  AuthUserResponse
} from './types'

export const authApi = {
  async status(): Promise<AuthStatusResponse> {
    const { data } = await client.get<AuthStatusResponse>('/api/auth/status')
    return data
  },

  async login(state?: string): Promise<AuthLoginResponse> {
    const { data } = await client.get<AuthLoginResponse>('/api/auth/login', {
      params: state ? { state } : undefined
    })
    return data
  },

  async me(): Promise<AuthUserResponse> {
    const { data } = await client.get<AuthUserResponse>('/api/auth/me')
    return data
  },

  async logout(): Promise<AuthLogoutResponse> {
    const { data } = await client.post<AuthLogoutResponse>('/api/auth/logout')
    return data
  }
}
