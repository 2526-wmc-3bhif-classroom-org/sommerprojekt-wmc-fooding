import { ref, type Ref } from 'vue'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    email: string
    id: number
    role: string
  }
  accessToken: string
  message: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface User {
  email: string
  id: number
  role: string
}

const API_URL = 'http://127.0.0.1:8080'

class AuthService {
  private _token: Ref<string | null> = ref(null)
  private _user: Ref<User | null> = ref(null)

  constructor() {
    this._token.value = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try {
        this._user.value = JSON.parse(userData)
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }


  get user() { return this._user.value }
  get isAuthenticated() { return !!this._token.value }


  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login fehlgeschlagen')
    }

    const data: LoginResponse = await response.json()
    this.setSession(data.accessToken, data.user)
    return data
  }


  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registrierung fehlgeschlagen')
    }

    const data: LoginResponse = await response.json()
    this.setSession(data.accessToken, data.user)
    return data
  }

  logout(): void {
    this._token.value = null
    this._user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  private setSession(token: string, user: User): void {
    this._token.value = token
    this._user.value = user
    localStorage.setItem('accessToken', token)
    localStorage.setItem('user', JSON.stringify(user))
  }

  getToken(): string | null {
    return this._token.value
  }
}

export const authService = new AuthService()
