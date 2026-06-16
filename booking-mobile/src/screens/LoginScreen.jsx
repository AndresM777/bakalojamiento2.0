import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { authApi } from '../api/auth.api';
import { clientesApi } from '../api/clientes.api';
import useAuthStore from '../stores/useAuthStore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loginStore = useAuthStore((state) => state.login);
  const setClienteIdStore = useAuthStore((state) => state.setClienteId);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos obligatorios', 'Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      
      let finalClienteId = data.clienteId;

      // Si no trae clienteId (típico en base real), resolvemos buscando por email
      if (!finalClienteId && (!data.roles || data.roles.includes('Cliente'))) {
        try {
          const { data: clientesData } = await clientesApi.getAll({ page: 1, size: 200 });
          const list = Array.isArray(clientesData) 
            ? clientesData 
            : (Array.isArray(clientesData?.items) ? clientesData.items : []);
          
          const matching = list.find((c) => c.email?.toLowerCase() === email.toLowerCase());
          if (matching) {
            finalClienteId = matching.clienteId;
          }
        } catch (errSearch) {
          console.error('Error buscando clienteId por email:', errSearch);
        }
      }

      // Estructuramos la sesión
      loginStore({
        token: data.token,
        clienteId: finalClienteId,
        colaboradorId: data.colaboradorId,
        nombreCompleto: data.nombreCompleto || 'Usuario',
        email: email,
        roles: data.roles || ['Cliente'],
      });

      Alert.alert('¡Bienvenido!', `Hola de nuevo, ${data.nombreCompleto || 'Usuario'}`);
    } catch (err) {
      const msg = err.backendMessage || 'Credenciales incorrectas o problemas de conexión';
      Alert.alert('Error de acceso', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Rodrigo's</Text>
        <Text style={styles.subtitle}>Encuentra tu alojamiento perfecto</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.demoHint}>
          Demos:{'\n'}
          Cliente: cliente@demo.com / Demo12345!{'\n'}
          Admin: admin@demo.com / Admin12345!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2e2e38',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#121214',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoHint: {
    color: '#71717a',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
  },
});
