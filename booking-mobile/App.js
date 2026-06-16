import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import PropiedadDetalleScreen from './src/screens/PropiedadDetalleScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import MisReservasScreen from './src/screens/MisReservasScreen';
import FacturaScreen from './src/screens/FacturaScreen';
import LoginScreen from './src/screens/LoginScreen';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import useAuthStore from './src/stores/useAuthStore';

const Stack = createStackNavigator();

export default function App() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e1e24',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: '#121214' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: "Rodrigo's",
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MisReservas')}
                  style={styles.headerBtn}
                >
                  <Text style={styles.headerBtnText}>Reservas</Text>
                </TouchableOpacity>
                {isAuthenticated ? (
                  <TouchableOpacity onPress={logout} style={styles.headerBtn}>
                    <Text style={[styles.headerBtnText, styles.logoutText]}>Salir</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.headerBtn}
                  >
                    <Text style={styles.headerBtnText}>Entrar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="PropiedadDetalle"
          component={PropiedadDetalleScreen}
          options={{ title: 'Detalle de Alojamiento' }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ title: 'Procesar Pago' }}
        />
        <Stack.Screen
          name="MisReservas"
          component={MisReservasScreen}
          options={{ title: 'Mis Reservas' }}
        />
        <Stack.Screen
          name="Factura"
          component={FacturaScreen}
          options={{ title: 'Factura Electrónica', headerLeft: null }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerBtn: {
    marginLeft: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2e2e38',
    borderRadius: 6,
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#ef4444',
  },
});
