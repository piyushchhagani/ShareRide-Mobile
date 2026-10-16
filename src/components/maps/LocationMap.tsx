
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import MapView, {
  Marker,
  Polyline,
  type Region,
} from "react-native-maps";

import { colors, radius, spacing } from "@/theme/tokens";
import { calculateRoute } from "@/services/routes/route.service";

type LocationPoint = {
  address?: string;
  latitude: number;
  longitude: number;
};

type Props = {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  showCurrentLocation?: boolean;
};

const NAGPUR_REGION: Region = {
  latitude: 21.1458,
  longitude: 79.0882,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function LocationMap({
  pickup,
  destination,
  showCurrentLocation = true,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] =
    useState<LocationPoint | null>(null);
  const [routeCoordinates, setRouteCoordinates] =
    useState<{ latitude: number; longitude: number }[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [locationError, setLocationError] = useState("");

  const points = useMemo(
    () =>
      [
        pickup,
        destination,
        showCurrentLocation ? currentLocation : null,
      ].filter(
        (point): point is LocationPoint =>
          !!point &&
          Number.isFinite(point.latitude) &&
          Number.isFinite(point.longitude) &&
          Math.abs(point.latitude) <= 90 &&
          Math.abs(point.longitude) <= 180
      ),
    [pickup, destination, currentLocation, showCurrentLocation]
  );

  const region = useMemo<Region>(() => {
    if (!points.length) return NAGPUR_REGION;

    const latitudes = points.map((point) => point.latitude);
    const longitudes = points.map((point) => point.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + 0.025, 0.025),
      longitudeDelta: Math.max(maxLng - minLng + 0.025, 0.025),
    };
  }, [points]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMapError((current) =>
        current || "The map could not load. Check Google Maps and network access."
      );
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let active = true;

    async function locate() {
      if (!showCurrentLocation) return;

      setLocationLoading(true);
      setLocationError("");

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") {
          if (active) {
            setLocationError("Enable location permission to show your position.");
          }
          return;
        }

        const result = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (active) {
          setCurrentLocation({
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
          });
        }
      } catch {
        if (active) {
          setLocationError("Current location is unavailable. You can still select places.");
        }
      } finally {
        if (active) setLocationLoading(false);
      }
    }

    void locate();

    return () => {
      active = false;
    };
  }, [showCurrentLocation]);

  useEffect(() => {
    let active = true;

    async function route() {
      if (!pickup || !destination) {
        setRouteCoordinates([]);
        setRouteError("");
        return;
      }

      setRouteLoading(true);
      setRouteError("");

      try {
        const result = await calculateRoute({
          pickupLatitude: pickup.latitude,
          pickupLongitude: pickup.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
        });

        const coordinates = (result.coordinates ?? [])
          .filter(
            (item) =>
              Array.isArray(item) &&
              item.length >= 2 &&
              Number.isFinite(Number(item[0])) &&
              Number.isFinite(Number(item[1]))
          )
          .map(([longitude, latitude]) => ({
            latitude: Number(latitude),
            longitude: Number(longitude),
          }));

        if (!coordinates.length) {
          throw new Error("Route response did not contain coordinates.");
        }

        if (active) setRouteCoordinates(coordinates);
      } catch {
        if (active) {
          setRouteCoordinates([]);
          setRouteError(
            "Unable to draw the route. Check the connection and try again."
          );
        }
      } finally {
        if (active) setRouteLoading(false);
      }
    }

    void route();

    return () => {
      active = false;
    };
  }, [
    pickup?.latitude,
    pickup?.longitude,
    destination?.latitude,
    destination?.longitude,
  ]);

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: points[0].latitude,
          longitude: points[0].longitude,
          latitudeDelta: 0.025,
          longitudeDelta: 0.025,
        },
        350
      );
      return;
    }

    mapRef.current?.fitToCoordinates(
      points.map(({ latitude, longitude }) => ({
        latitude,
        longitude,
      })),
      {
        edgePadding: { top: 70, right: 50, bottom: 70, left: 50 },
        animated: true,
      }
    );
  }, [points]);

  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Map preview</Text>
        <Text style={styles.fallbackText}>
          Interactive maps are available in the mobile app.
        </Text>
        <Text style={styles.coordinates}>
          {pickup
            ? `Pickup: ${pickup.latitude.toFixed(5)}, ${pickup.longitude.toFixed(5)}`
            : "Choose a pickup location"}
        </Text>
        <Text style={styles.coordinates}>
          {destination
            ? `Destination: ${destination.latitude.toFixed(5)}, ${destination.longitude.toFixed(5)}`
            : "Choose a destination"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={showCurrentLocation && !!currentLocation}
        showsMyLocationButton={showCurrentLocation}
        loadingEnabled
        toolbarEnabled
        onMapReady={() => {
          setMapReady(true);
          setMapError("");
        }}
      >
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            title="Pickup"
            description={pickup.address}
            pinColor="#2457E6"
          />
        )}

        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={destination.address}
            pinColor="#16845B"
          />
        )}

        {currentLocation && showCurrentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your location"
          />
        )}

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={colors.brand}
          />
        )}
      </MapView>

      {!mapReady && (
        <View style={styles.badge}>
          <ActivityIndicator color={colors.brand} size="small" />
          <Text style={styles.badgeText}>
            {mapError || "Loading map…"}
          </Text>
        </View>
      )}

      {mapReady && (locationLoading || routeLoading) && (
        <View style={styles.badge}>
          <ActivityIndicator color={colors.brand} size="small" />
          <Text style={styles.badgeText}>
            {routeLoading ? "Calculating route…" : "Finding your location…"}
          </Text>
        </View>
      )}

      {!!locationError && !locationLoading && (
        <View style={styles.message}>
          <Text style={styles.messageText}>{locationError}</Text>
        </View>
      )}

      {!!routeError && !routeLoading && (
        <View style={styles.routeMessage}>
          <Text style={styles.messageText}>{routeError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: "100%",
    overflow: "hidden",
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSecondary,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  message: {
    position: "absolute",
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  messageText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  routeMessage: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  fallback: {
    height: 250,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSecondary,
  },
  fallbackTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  fallbackText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  coordinates: {
    color: colors.text,
    fontSize: 12,
  },
});
