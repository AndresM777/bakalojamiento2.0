import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Decodificador manual de JWT base64 seguro para React Native
const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const payload = parts[1];
    
    // Decodificar Base64URL en React Native
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let str = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    
    let binary = '';
    const len = str.length;
    for (let i = 0; i < len; i++) {
      const idx1 = chars.indexOf(str[i]);
      const idx2 = chars.indexOf(str[++i]);
      const idx3 = chars.indexOf(str[++i]);
      const idx4 = chars.indexOf(str[++i]);
      
      const byte1 = (idx1 << 2) | (idx2 >> 4);
      const byte2 = ((idx2 & 15) << 4) | (idx3 >> 2);
      const byte3 = ((idx3 & 3) << 6) | idx4;
      
      binary += String.fromCharCode(byte1);
      if (idx3 !== 64 && str[i - 1] !== '=') binary += String.fromCharCode(byte2);
      if (idx4 !== 64 && str[i] !== '=') binary += String.fromCharCode(byte3);
    }
    
    return JSON.parse(binary);
  } catch (err) {
    console.error('Error decodificando JWT en móvil:', err);
    return {};
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (loginResponse) => {
        const decoded = decodeJWT(loginResponse.token);
        const userId = decoded.sub || null;

        const user = {
          id: userId,
          clienteId: loginResponse.clienteId,
          colaboradorId: loginResponse.colaboradorId,
          nombreCompleto: loginResponse.nombreCompleto,
          email: loginResponse.email,
          roles: loginResponse.roles || [],
        };

        set({ token: loginResponse.token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      setClienteId: (clienteId) => {
        set((state) => ({
          user: state.user ? { ...state.user, clienteId } : null
        }));
      },

      isAdmin: () => {
        const { user } = get();
        if (!user?.roles) return false;
        const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
        return roles.some(
          (r) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'administrador'
        );
      },

      getClienteId: () => get().user?.clienteId ?? null,
    }),
    {
      name: 'booking_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
