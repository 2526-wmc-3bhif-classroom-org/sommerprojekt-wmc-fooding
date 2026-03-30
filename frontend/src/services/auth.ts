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

const API_URL = 'http://localhost:3000'

class AuthService {
  private token: string | null = null

  constructor() {
    // Token aus localStorage laden falls vorhanden
    this.token = localStorage.getItem('accessToken')
  }

  /**
   * Login mit E-Mail und Passwort
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login fehlgeschlagen')
    }

    const data: LoginResponse = await response.json()
    this.setToken(data.accessToken)
    this.setUser(data.user)
    return data
  }

  /**
   * Registrierung neuer Benutzer
   */
  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registrierung fehlgeschlagen')
    }

    const data: LoginResponse = await response.json()
    this.setToken(data.accessToken)
    this.setUser(data.user)
    return data
  }

  /**
   * Logout & Token löschen
   */
  logout(): void {
    this.token = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  /**
   * Token speichern
   */
  private setToken(token: string): void {
    this.token = token
    localStorage.setItem('accessToken', token)
  }

  /**
   * Benutzerdaten speichern
   */
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  /**
   * Token abrufen
   */
  getToken(): string | null {
    return this.token
  }

  /**
   * Benutzer abrufen
   */
  getUser(): User | null {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  }

  /**
   * Prüft ob Benutzer eingeloggt ist
   */
  isAuthenticated(): boolean {
    return !!this.token && !!this.getUser()
  }
}

export const authService = new AuthService()
