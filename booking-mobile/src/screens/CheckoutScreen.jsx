import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { reservasApi } from '../api/reservas.api';
import { facturasApi } from '../api/facturas.api';
import { metodosPagoApi } from '../api/metodosPago.api';
import useAuthStore from '../stores/useAuthStore';

// Generador manual de UUID v4 compatible con JS Core de Android
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CheckoutScreen({ route, navigation }) {
  const { alojamiento, habitacion } = route.params;
  const { getClienteId, isAuthenticated } = useAuthStore();
  const [metodos, setMetodos] = useState([]);
  const [selectedMetodo, setSelectedMetodo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  
  // Datos simulados de estancia (en un flujo real se seleccionan mediante un DatePicker)
  const fechaCheckIn = '2026-06-20';
  const fechaCheckOut = '2026-06-25';
  const numNoches = 5;
  const totalReserva = habitacion.precioPorNoche * numNoches;

  useEffect(() => {
    const fetchMetodos = async () => {
      try {
        const { data } = await metodosPagoApi.getAll();
        setMetodos(Array.isArray(data) ? data : []);
        if (data.length > 0) setSelectedMetodo(data[0].metodoPagoId);
      } catch (err) {
        console.error('Error cargando métodos de pago:', err);
      }
    };
    fetchMetodos();
  }, []);

  const handlePagar = async () => {
    if (!isAuthenticated) {
      Alert.alert('Acceso Requerido', 'Inicia sesión para poder realizar una reserva');
      navigation.navigate('Login');
      return;
    }

    const clienteId = getClienteId();
    if (!clienteId) {
      Alert.alert('Error', 'No se ha podido resolver tu identificador de cliente. Vuelve a iniciar sesión.');
      return;
    }

    if (!selectedMetodo) {
      Alert.alert('Falta Información', 'Por favor selecciona un método de pago');
      return;
    }

    setProcesando(true);
    try {
      // 1. Generar la Clave de Idempotencia única (X-Idempotency-Key)
      const idempotencyKey = generateUUID();

      // 2. Construir el payload simplificado de la versión V2 de Reservas
      const payloadReserva = {
        clienteId: Number(clienteId),
        alojamientoId: alojamiento.alojamientoId,
        fechaCheckIn: fechaCheckIn,
        fechaCheckOut: fechaCheckOut,
        numAdultos: 2,
        numNinos: 0,
        llevaMascotas: false,
        habitaciones: [
          {
            habitacionId: habitacion.habitacionId
          }
        ]
      };

      // 3. Crear Reserva llamando a la API V2 con la cabecera de idempotencia
      const { data: reservaCreada } = await reservasApi.crearV2(payloadReserva, idempotencyKey);
      
      const rId = reservaCreada.reservaId;

      // 4. Crear la Factura asociada de forma asíncrona/secuencial
      const payloadFactura = {
        reservaId: rId,
        metodoPagoId: Number(selectedMetodo),
        monto: totalReserva,
        detalles: [
          {
            descripcion: `Pago reserva hospedaje en ${alojamiento.nombre}`,
            cantidad: 1,
            precioUnitario: totalReserva
          }
        ]
      };

      await facturasApi.crear(payloadFactura);

      // 5. Actualizar el estado de la reserva a Confirmada
      try {
        await reservasApi.actualizarEstado(rId, { estado: 'Confirmada' });
      } catch (errState) {
        console.error('Error actualizando estado de la reserva a Confirmada:', errState);
      }

      Alert.alert('¡Pago Exitoso!', 'Tu reserva y pago se han procesado correctamente.', [
        { text: 'Ver Factura', onPress: () => navigation.replace('Factura', { reservaId: rId }) }
      ]);

    } catch (err) {
      const msg = err.backendMessage || 'Error al procesar el pago de tu reserva';
      Alert.alert('Error en Transacción', msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Confirmar Reserva</Text>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Detalles del Alojamiento</Text>
          <Text style={styles.hotelName}>{alojamiento.nombre}</Text>
          <Text style={styles.roomNum}>Habitación #{habitacion.numeroHabitacion} ({habitacion.tipoHabitacion})</Text>
          <Text style={styles.dates}>📅 Check-in: {fechaCheckIn} | Check-out: {fechaCheckOut}</Text>
          <Text style={styles.nights}>Estancia de {numNoches} noches</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Resumen de Cargos</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio por noche</Text>
            <Text style={styles.priceVal}>${habitacion.precioPorNoche}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceVal}>${totalReserva}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Monto Total</Text>
            <Text style={styles.totalVal}>${totalReserva}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Selecciona un Método de Pago</Text>
          {metodos.length === 0 ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            metodos.map((m) => (
              <TouchableOpacity
                key={m.metodoPagoId}
                style={[
                  styles.metodoItem,
                  selectedMetodo === m.metodoPagoId && styles.selectedMetodoItem
                ]}
                onPress={() => setSelectedMetodo(m.metodoPagoId)}
              >
                <Text style={[
                  styles.metodoText,
                  selectedMetodo === m.metodoPagoId && styles.selectedMetodoText
                ]}>
                  💳 {m.tipo}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.payButton} onPress={handlePagar} disabled={procesando}>
          {procesando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>Pagar ${totalReserva}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2e2e38',
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roomNum: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 4,
  },
  dates: {
    fontSize: 14,
    color: '#d4d4d8',
    marginTop: 8,
  },
  nights: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  priceLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  priceVal: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#2e2e38',
    paddingTop: 12,
    marginTop: 6,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalVal: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
  },
  metodoItem: {
    backgroundColor: '#121214',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  selectedMetodoItem: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  metodoText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedMetodoText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
