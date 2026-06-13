import { ref, type Ref } from 'vue'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
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
  image?: string
}

const API_URL = import.meta.env.VITE_API_URL

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

  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/auth/profile/image`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this._token.value}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Fehler beim Hochladen des Profilbildes');
    }

    const data = await response.json();
    return data.image;
  }

  updateUserImage(image: string): void {
    if (!this._user.value) return
    const updatedUser = { ...this._user.value, image }
    this._user.value = updatedUser
    localStorage.setItem('user', JSON.stringify(updatedUser))
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

  handleUnauthorized(): never {
    this.logout()
    window.location.href = '/login'
    throw new Error('Session abgelaufen. Bitte erneut anmelden.')
  }
}

export const authService = new AuthService()
