import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions, SafeAreaView } from 'react-native';
import { alojamientosApi } from '../api/alojamientos.api';
import { fotosApi } from '../api/fotos.api';

export default function HomeScreen({ navigation }) {
  const [propiedades, setPropiedades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  // Número dinámico de columnas responsivo: 1 en móviles normales, 2 en tablets/pantallas anchas
  const numColumns = width > 600 ? 2 : 1;

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const { data } = await alojamientosApi.getAll();
        const lista = Array.isArray(data) ? data : [];
        
        // Cargar primera foto de cada alojamiento
        const conFotos = await Promise.all(
          lista.map(async (prop) => {
            try {
              const fotosRes = await fotosApi.getByAlojamientoId(prop.alojamientoId);
              const fotos = Array.isArray(fotosRes.data) ? fotosRes.data : [];
              return { ...prop, fotoUrl: fotos[0]?.url || null };
            } catch {
              return { ...prop, fotoUrl: null };
            }
          })
        );

        setPropiedades(conFotos);
        setFiltered(conFotos);
      } catch (err) {
        console.error('Error cargando propiedades en móvil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(propiedades);
      return;
    }
    const query = text.toLowerCase();
    const matches = propiedades.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(query) ||
        p.ciudad?.toLowerCase().includes(query) ||
        p.direccion?.toLowerCase().includes(query)
    );
    setFiltered(matches);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { width: numColumns === 2 ? '48%' : '100%' }]}
        onPress={() => navigation.navigate('PropiedadDetalle', { alojamientoId: item.alojamientoId })}
      >
        {item.fotoUrl ? (
          <Image source={{ uri: item.fotoUrl }} style={styles.cardImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sin Foto</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
          <Text style={styles.cardLocation} numberOfLines={1}>📍 {item.ciudad || item.direccion}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
          
          {item.estrellas > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.starText}>⭐ {item.estrellas} estrellas</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Cargando alojamientos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rodrigo's Booking</Text>
        <Text style={styles.headerSubtitle}>Las mejores estancias a tu alcance</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="¿A dónde vas? Ciudad, alojamiento..."
          placeholderTextColor="#71717a"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        key={numColumns} // Forzar re-render de columnas si rota la pantalla
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.alojamientoId.toString()}
        numColumns={numColumns}
        columnWrapperStyle={numColumns === 2 ? styles.columnWrapper : null}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron alojamientos disponibles.</Text>
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
  },
  loadingText: {
    color: '#a1a1aa',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#1e1e24',
    color: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2e2e38',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1e1e24',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e2e38',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#2e2e38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#71717a',
    fontSize: 15,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#d4d4d8',
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 15,
    textAlign: 'center',
  },
});
