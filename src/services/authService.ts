import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/user';


const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? '/api'
    : 'http://localhost:3001/api');

const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' || !import.meta.env.VITE_API_URL;

// Mock users for local development
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date('2024-01-01'),
  },
];

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_LOCAL_STORAGE) {
      // Mock login for local development
      const user = MOCK_USERS.find(u => u.email === credentials.email);
      if (!user || credentials.password !== 'demo123') {
        throw new Error('Invalid email or password');
      }
      
      const token = `mock_token_${user.id}_${Date.now()}`;
      this.token = token;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      
      return { user, token };
    }

    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));

    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    if (USE_LOCAL_STORAGE) {
      // Mock registration for local development
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (MOCK_USERS.find(u => u.email === credentials.email)) {
        throw new Error('Email already exists');
      }

      const user: User = {
        id: `mock_${Date.now()}`,
        email: credentials.email,
        name: credentials.name,
        createdAt: new Date(),
      };

      MOCK_USERS.push(user);
      
      const token = `mock_token_${user.id}_${Date.now()}`;
      this.token = token;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      
      return { user, token };
    }

    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));

    return response;
  }



  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    if (USE_LOCAL_STORAGE) {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    }

    try {
      return await this.request<User>('/auth/me');
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();