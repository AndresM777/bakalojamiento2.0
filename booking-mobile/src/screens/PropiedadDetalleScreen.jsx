import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { alojamientosApi } from '../api/alojamientos.api';
import { habitacionesApi } from '../api/habitaciones.api';
import { fotosApi } from '../api/fotos.api';

export default function PropiedadDetalleScreen({ route, navigation }) {
  const { alojamientoId } = route.params;
  const [alojamiento, setAlojamiento] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alojRes, habRes, fotRes] = await Promise.all([
          alojamientosApi.getById(alojamientoId),
          habitacionesApi.getByAlojamientoId(alojamientoId),
          fotosApi.getByAlojamientoId(alojamientoId),
        ]);
        setAlojamiento(alojRes.data);
        setHabitaciones(Array.isArray(habRes.data) ? habRes.data : []);
        setFotos(Array.isArray(fotRes.data) ? fotRes.data : []);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los detalles de la propiedad');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [alojamientoId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const principalFoto = fotos[0]?.url || null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {principalFoto ? (
          <Image source={{ uri: principalFoto }} style={styles.headerImage} />
        ) : (
          <View style={styles.placeholderHeader}>
            <Text style={styles.placeholderText}>Rodrigo's Booking</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{alojamiento.nombre}</Text>
          <Text style={styles.location}>📍 {alojamiento.ciudad} — {alojamiento.direccion}</Text>
          <Text style={styles.description}>{alojamiento.descripcion}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Habitaciones Disponibles</Text>
          {habitaciones.length === 0 ? (
            <Text style={styles.noRooms}>No hay habitaciones registradas en este alojamiento.</Text>
          ) : (
            habitaciones.map((hab) => (
              <View key={hab.habitacionId} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>Habitación #{hab.numeroHabitacion}</Text>
                  <Text style={styles.roomType}>{hab.tipoHabitacion}</Text>
                </View>
                <Text style={styles.roomDetails}>Capacidad: {hab.capacidad} personas</Text>
                <Text style={styles.roomPrice}>${hab.precioPorNoche} / noche</Text>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    navigation.navigate('Checkout', {
                      alojamiento,
                      habitacion: hab,
                    })
                  }
                >
                  <Text style={styles.bookButtonText}>Reservar Habitación</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
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
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  placeholderHeader: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e1e24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6366f1',
    fontSize: 22,
    fontWeight: 'bold',
  },
  body: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#d4d4d8',
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#2e2e38',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    marginTop: 8,
  },
  noRooms: {
    color: '#71717a',
    fontSize: 14,
    fontStyle: 'italic',
  },
  roomCard: {
    backgroundColor: '#1e1e24',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2e2e38',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roomType: {
    fontSize: 12,
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roomDetails: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginVertical: 8,
  },
  bookButton: {
    backgroundColor: '#6366f1',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
