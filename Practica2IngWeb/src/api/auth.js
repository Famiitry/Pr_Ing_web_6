import api from './axios.js'

export function register(payload) {
  return api.post('/auth/register', payload)
}

export function login(email, password) {
  return api.post('/auth/login', { email, password })
}