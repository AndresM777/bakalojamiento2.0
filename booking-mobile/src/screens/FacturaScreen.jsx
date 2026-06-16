import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { facturasApi } from '../api/facturas.api';
import { reservasApi } from '../api/reservas.api';

export default function FacturaScreen({ route, navigation }) {
  const { reservaId } = route.params;
  const [factura, setFactura] = useState(null);
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservaRes, facturaRes] = await Promise.all([
          reservasApi.getById(reservaId),
          facturasApi.getByReservaId(reservaId).catch(() => ({ data: null })),
        ]);
        setReserva(reservaRes.data);
        setFactura(facturaRes.data);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los datos de la factura');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reservaId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Fallback si la factura física es nula o el monto es 0
  const total = factura?.monto || reserva?.total || 0;
  const codigo = reserva?.codigoReserva || `RES-${reservaId}`;
  const fecha = factura?.fechaPago ? new Date(factura.fechaPago).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.receipt}>
          <Text style={styles.logo}>Rodrigo's</Text>
          <Text style={styles.receiptTitle}>Comprobante de Pago</Text>
          <Text style={styles.receiptSubtitle}>Factura electrónica simplificada</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nº de Factura:</Text>
            <Text style={styles.val}>{factura?.facturaId || 'PENDIENTE'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nº de Reserva:</Text>
            <Text style={styles.val}>{codigo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.val}>{fecha}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.val, styles.statusVal]}>PAGADA</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionHeader}>Concepto</Text>
          <View style={styles.conceptRow}>
            <Text style={styles.conceptText}>Hospedaje en AlojamientoId: {reserva?.alojamientoId}</Text>
            <Text style={styles.conceptPrice}>${total}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Monto Pagado</Text>
            <Text style={styles.totalVal}>${total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.doneButtonText}>Volver al Inicio</Text>
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  receipt: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6366f1',
    textAlign: 'center',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginTop: 4,
  },
  receiptSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    color: '#4b5563',
    fontSize: 14,
  },
  val: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  statusVal: {
    color: '#10b981',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  conceptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conceptText: {
    color: '#1f2937',
    fontSize: 14,
    flex: 1,
  },
  conceptPrice: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10b981',
  },
  doneButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
