import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://apigatway-0wjx.onrender.com/api/v2';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Interceptor para inyectar token JWT
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('booking_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Error al recuperar token de AsyncStorage', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para capturar errores y manejar desautenticación
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401) {
      try {
        await AsyncStorage.removeItem('booking_token');
        await AsyncStorage.removeItem('booking_user');
      } catch (err) {
        console.error('Error al remover datos de autenticación', err);
      }
    }

    // Extraer mensaje de error del backend
    const backendMessage =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      error.response?.data?.title ||
      (typeof error.response?.data === 'string' ? error.response.data : null);

    if (backendMessage) {
      error.backendMessage = backendMessage;
    }

    return Promise.reject(error);
  }
);

export default client;
export { BASE_URL };
