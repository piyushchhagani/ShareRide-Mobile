import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";

import { calculateRoute } from "@/services/routes/route.service";

type LocationPoint = {
  address?: string;
  latitude: number;
  longitude: number;
};

type LocationMapProps = {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  showCurrentLocation?: boolean;
};

export default function LocationMap({
  pickup,
  destination,
  showCurrentLocation = true,
}: LocationMapProps) {
  const [currentLocation, setCurrentLocation] =
    useState<LocationPoint | null>(null);

  const [routeCoordinates, setRouteCoordinates] =
    useState<number[][]>([]);

  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  useEffect(() => {
    if (!pickup || !destination) {
      setRouteCoordinates([]);
      return;
    }

    loadRoute();
  }, [
    pickup?.latitude,
    pickup?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);

  const loadCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setError(
          "Location permission was denied."
        );
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch {
      setError(
        "Unable to determine your location."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRoute = async () => {
    if (!pickup || !destination) {
      return;
    }

    try {
      setRouteLoading(true);
      setError(null);

      const response = await calculateRoute({
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        destinationLatitude: destination.latitude,
        destinationLongitude: destination.longitude,
      });

      setRouteCoordinates(response.coordinates);
    } catch (routeError) {
      console.error(
        "ROUTE CALCULATION ERROR:",
        routeError
      );

      setRouteCoordinates([]);
      setError(
        "Unable to calculate route."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  const region = useMemo<Region | null>(() => {
    const points = [
      pickup,
      destination,
      showCurrentLocation
        ? currentLocation
        : null,
    ].filter(Boolean) as LocationPoint[];

    if (points.length === 0) {
      return null;
    }

    const latitudes = points.map(
      (point) => point.latitude
    );

    const longitudes = points.map(
      (point) => point.longitude
    );

    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);

    return {
      latitude:
        (minLatitude + maxLatitude) / 2,
      longitude:
        (minLongitude + maxLongitude) / 2,
      latitudeDelta: Math.max(
        maxLatitude - minLatitude + 0.02,
        0.015
      ),
      longitudeDelta: Math.max(
        maxLongitude - minLongitude + 0.02,
        0.015
      ),
    };
  }, [
    pickup,
    destination,
    currentLocation,
    showCurrentLocation,
  ]);

  if (loading && !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loading}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || "Map location unavailable."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={
          showCurrentLocation
        }
        showsMyLocationButton={
          showCurrentLocation
        }
      >
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            title="Pickup"
            description={pickup.address}
          >
            <View style={styles.pickupMarker}>
              <View style={styles.pickupDot} />
            </View>
          </Marker>
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={
              destination.address
            }
          >
            <View
              style={styles.destinationMarker}
            >
              <View
                style={styles.destinationDot}
              />
            </View>
          </Marker>
        )}

        {currentLocation &&
          showCurrentLocation && (
            <Marker
              coordinate={{
                latitude:
                  currentLocation.latitude,
                longitude:
                  currentLocation.longitude,
              }}
              title="Current location"
            />
          )}

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates.map(
              ([longitude, latitude]) => ({
                latitude,
                longitude,
              })
            )}
            strokeWidth={5}
            strokeColor="#2563EB"
          />
        )}
      </MapView>

      {routeLoading && (
        <View style={styles.routeBadge}>
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <Text style={styles.routeText}>
            Calculating route...
          </Text>
        </View>
      )}

      {error && !routeLoading && (
        <View style={styles.errorBadge}>
          <Text style={styles.errorBadgeText}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20,
  },

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

  pickupMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2563EB",
  },

  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  destinationMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  routeBadge: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    elevation: 3,
  },

  routeText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  errorBadge: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    elevation: 3,
  },

  errorBadgeText: {
    textAlign: "center",
    fontSize: 12,
    color: "#DC2626",
  },
});