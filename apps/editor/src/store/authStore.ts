import { create } from 'zustand';
import { apiClient } from '../lib/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if we have API token (no login required)
  const apiToken = import.meta.env.VITE_API_TOKEN;
  if (apiToken) {
    return {
      user: { id: 0, username: 'API User', email: 'api@capibara.it' },
      token: apiToken,
      isAuthenticated: true,
      isLoading: false,
      login: async () => {
        // No-op for API token auth
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        // Always authenticated with API token
        set({ isAuthenticated: true, isLoading: false });
      },
    };
  }

  // JWT-based auth
  return {
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: true,
    login: async (identifier: string, password: string) => {
      try {
        const { jwt, user } = await apiClient.login(identifier, password);
        set({
          user: user as User,
          token: jwt,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },
    logout: () => {
      apiClient.clearToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    },
    checkAuth: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        const user = await apiClient.me();
        set({
          user: user as User,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        apiClient.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
  };
});

// Check auth on store initialization
useAuthStore.getState().checkAuth();
