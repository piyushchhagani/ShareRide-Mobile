/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import type { Region } from "react-native-maps";

import { calculateRoute } from "@/services/routes/route.service";


const nativeMaps =
  Platform.OS === "web"
    ? null
    : require("react-native-maps");
const NativeMapView = nativeMaps?.default;
const NativeMarker = nativeMaps?.Marker;
const NativePolyline = nativeMaps?.Polyline;

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
  const mapRef = useRef<any>(null);
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

      const coordinates = response.coordinates
        .filter(
          (coordinate) =>
            Array.isArray(coordinate) &&
            coordinate.length >= 2 &&
            Number.isFinite(Number(coordinate[0])) &&
            Number.isFinite(Number(coordinate[1]))
        )
        .map((coordinate) => [
          Number(coordinate[0]),
          Number(coordinate[1]),
        ]);

      if (coordinates.length < 2) {
        throw new Error("Route response contained no usable coordinates");
      }

      setRouteCoordinates(coordinates);
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

  useEffect(() => {
    const points = [
      pickup,
      destination,
      showCurrentLocation ? currentLocation : null,
    ].filter(
      (point): point is LocationPoint =>
        !!point &&
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude)
    );

    if (points.length === 0) {
      return;
    }

    mapRef.current?.fitToCoordinates(
      points.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })),
      {
        edgePadding: {
          top: 70,
          right: 45,
          bottom: 70,
          left: 45,
        },
        animated: true,
      }
    );
  }, [pickup, destination, currentLocation, showCurrentLocation]);

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

  if (Platform.OS === "web") {
    return (
      <View style={styles.webFallback}>
        <Text style={styles.error}>
          Interactive maps are available in the Android and iOS app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NativeMapView
        ref={mapRef}
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
          <NativeMarker
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
          </NativeMarker>
        )}

        {destination && (
          <NativeMarker
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
          </NativeMarker>
        )}

        {currentLocation &&
          showCurrentLocation && (
            <NativeMarker
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
          <NativePolyline
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
      </NativeMapView>

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

  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0ECFF",
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
