import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Region } from "react-native-maps";

export default function LocationMap() {
  const [region, setRegion] = useState<Region | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocation() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission was denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }

    loadLocation();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loading}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <MapView style={styles.map} initialRegion={region} showsUserLocation>
      <Marker coordinate={region} title="You are here" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  loading: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },

  error: {
    textAlign: "center",
    fontSize: 15,
    color: "#DC2626",
  },
});