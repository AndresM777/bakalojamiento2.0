import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { reservasApi } from '../api/reservas.api';
import useAuthStore from '../stores/useAuthStore';

export default function MisReservasScreen({ navigation }) {
  const { getClienteId, isAuthenticated } = useAuthStore();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  const fetchReservas = async () => {
    const clienteId = getClienteId();
    if (!clienteId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await reservasApi.getByClienteId(clienteId);
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando reservas del cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservas();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancelar = (reservaId) => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelando(reservaId);
            try {
              await reservasApi.actualizarEstado(reservaId, { estado: 'Cancelada' });
              setReservas((prev) =>
                prev.map((r) => (r.reservaId === reservaId ? { ...r, estado: 'Cancelada' } : r))
              );
              Alert.alert('Cancelado', 'Tu reserva se canceló correctamente.');
            } catch (err) {
              const msg = err.backendMessage || 'No se pudo procesar la cancelación.';
              Alert.alert('Error', msg);
            } finally {
              setCancelando(null);
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmada':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'cancelada':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  const renderItem = ({ item }) => {
    const status = getStatusStyle(item.estado);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.reservaCode}>Código: {item.codigoReserva || `RES-${item.reservaId}`}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{item.estado}</Text>
          </View>
        </View>

        <Text style={styles.dates}>📅 {item.fechaCheckIn} al {item.fechaCheckOut}</Text>
        <Text style={styles.total}>Total: ${item.total}</Text>

        <View style={styles.actionsRow}>
          {item.estado?.toLowerCase() === 'confirmada' && (
            <TouchableOpacity
              style={styles.facturaButton}
              onPress={() => navigation.navigate('Factura', { reservaId: item.reservaId })}
            >
              <Text style={styles.facturaButtonText}>Ver Factura</Text>
            </TouchableOpacity>
          )}

          {item.estado?.toLowerCase() === 'pendiente' && (
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelar(item.reservaId)}
                disabled={cancelando === item.reservaId}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelando === item.reservaId ? 'Cancelando...' : 'Cancelar'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Debes iniciar sesión para ver tus reservas</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
      </View>

      <FlatList
        data={reservas}
        renderItem={renderItem}
        keyExtractor={(item) => item.reservaId.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes reservas registradas aún.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservaCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dates: {
    fontSize: 14,
    color: '#a1a1aa',
    marginVertical: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 4,
  },
  actionsRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#2e2e38',
    paddingTop: 12,
  },
  facturaButton: {
    backgroundColor: '#2e2e38',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  facturaButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
