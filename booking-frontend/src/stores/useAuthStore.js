import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'booking_token';
const USER_KEY = 'booking_user';

const loadPersistedUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user: loadPersistedUser(),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  login: (loginResponse) => {
    const decoded = jwtDecode(loginResponse.token);
    const userId = decoded.sub;

    const user = {
      id: userId,
      clienteId: loginResponse.clienteId,
      colaboradorId: loginResponse.colaboradorId,
      nombreCompleto: loginResponse.nombreCompleto,
      email: loginResponse.email,
      roles: loginResponse.roles || [],
    };

    localStorage.setItem(TOKEN_KEY, loginResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({ token: loginResponse.token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  // Helpers derivados
  isAdmin: () => {
    const { user } = get();
    if (!user?.roles) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.some(
      (r) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'administrador'
    );
  },

  getClienteId: () => get().user?.clienteId ?? null,
}));

export default useAuthStore;
