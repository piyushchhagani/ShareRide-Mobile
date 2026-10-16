/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import type { Region } from "react-native-maps";

import { useRideStore } from "@/store/ride.store";
import {
  LocationPoint,
  useLocationStore,
} from "@/store/location.store";
import { goBackSafely } from "@/utils/navigation";

const nativeMaps =
  Platform.OS === "web" ? null : require("react-native-maps");
const NativeMapView = nativeMaps?.default;
const NativeMarker = nativeMaps?.Marker;

type SearchResult = LocationPoint;

export default function LocationScreen() {
  const { type, query: initialQuery } = useLocalSearchParams<{
    type?: string;
    query?: string | string[];
  }>();

  const { pickup, destination, setPickup, setDestination } =
    useRideStore();
  const { currentLocation, setCurrentLocation } = useLocationStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapSelection, setMapSelection] = useState<LocationPoint | null>(null);
  const selectedLocation =
    type === "destination" ? destination : pickup;

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    loadCurrentLocation();

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    const value = Array.isArray(initialQuery)
      ? initialQuery[0]
      : initialQuery;

    if (value?.trim()) {
      searchLocation(value.trim());
    }
  }, [initialQuery]);

  const applySelection = (location: SearchResult) => {
    const safeLocation = {
      ...location,
      address: location.address?.trim() || "Selected location",
    };

    if (type === "destination") {
      setDestination(safeLocation);
    } else {
      setPickup(safeLocation);
    }
  };

  const loadCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationError(
          "Location permission is off. Enable it to use your current location."
        );
        setCurrentLocation(null);
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setLocationError(
          "Location services are unavailable on this device right now."
        );
        setCurrentLocation(null);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "ShareRide-Mobile/1.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          address = data.display_name || address;
        }
      } catch {
        // Keep coordinates as fallback.
      }

      const location: LocationPoint = {
        address,
        latitude,
        longitude,
      };

      setCurrentLocation(location);
    } catch {
      setLocationError(
        "Current location is unavailable right now. You can still search for a place manually."
      );
      setCurrentLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const searchLocation = (text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchRequest.current?.abort();

    const trimmed = text.trim();

    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(trimmed);
    }, 700);
  };

  const performSearch = async (text: string) => {
    try {
      setLoading(true);

      const controller = new AbortController();
      searchRequest.current = controller;

      const queryText = `${text}, Nagpur, Maharashtra, India`;
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=jsonv2` +
        `&q=${encodeURIComponent(queryText)}` +
        `&limit=8` +
        `&addressdetails=1` +
        `&countrycodes=in`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "ShareRide-Mobile/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const formatted: SearchResult[] = data
        .map((item: any) => ({
          address: item.display_name || text,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        }))
        .filter(
          (item: SearchResult) =>
            Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
        );

      setResults(formatted);
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return;
      }

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectMapLocation = async ({
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  }) => {
    Keyboard.dismiss();

    const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    const nextSelection: SearchResult = {
      address: fallbackAddress,
      latitude,
      longitude,
    };

    setMapSelection(nextSelection);

    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addresses[0];
      const formattedAddress = [
        address?.name,
        address?.street,
        address?.district,
        address?.city,
        address?.region,
      ]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(", ");

      if (formattedAddress) {
        const resolved = {
          address: formattedAddress,
          latitude,
          longitude,
        };

        setMapSelection(resolved);
        applySelection(resolved);
      }
    } catch {
      // Keep the fallback address from the map tap.
      applySelection(nextSelection);
    }
  };

  const mapRegion: Region = {
    latitude: mapSelection?.latitude ?? currentLocation?.latitude ?? 21.1458,
    longitude: mapSelection?.longitude ?? currentLocation?.longitude ?? 79.0882,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  const clearSearch = () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchRequest.current?.abort();
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  const canContinue =
    !!selectedLocation &&
    !!selectedLocation.address &&
    Number.isFinite(selectedLocation.latitude) &&
    Number.isFinite(selectedLocation.longitude);

  const title =
    type === "destination" ? "Choose destination" : "Choose pickup";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackSafely()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>Search</Text>
        <TextInput
          value={query}
          onChangeText={searchLocation}
          placeholder={
            type === "destination" ? "Search destination" : "Search pickup location"
          }
          placeholderTextColor="#94A3B8"
          style={styles.input}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {Platform.OS === "web" ? (
        <View style={styles.webMapNotice}>
          <Text style={styles.webMapNoticeText}>
            Use search to find a location quickly. Native maps are available on Android and iOS.
          </Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <NativeMapView
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation={!!currentLocation}
            showsMyLocationButton={!!currentLocation}
            onPress={(event: any) =>
              selectMapLocation(event.nativeEvent.coordinate)
            }
          >
            {currentLocation && !mapSelection && (
              <NativeMarker coordinate={currentLocation} title="Current location" />
            )}

            {mapSelection && (
              <NativeMarker
                coordinate={mapSelection}
                title={type === "destination" ? "Destination" : "Pickup"}
                description={mapSelection.address}
              />
            )}
          </NativeMapView>

          <View pointerEvents="none" style={styles.mapHint}>
            <Text style={styles.mapHintText}>Tap the map to choose a location</Text>
          </View>

          {mapSelection && (
            <TouchableOpacity
              style={styles.confirmMapButton}
              onPress={() => applySelection(mapSelection)}
            >
              <Text style={styles.confirmMapText}>Use this location</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.currentCard,
          !currentLocation && !locationLoading && styles.currentCardWarning,
        ]}
        disabled={locationLoading || !currentLocation}
        onPress={() => {
          if (currentLocation) {
            applySelection(currentLocation);
          }
        }}
      >
        <View style={styles.currentIconWrap}>
          {locationLoading ? (
            <ActivityIndicator size="small" color="#2563EB" />
          ) : (
            <Text style={styles.locationBadge}>Location</Text>
          )}
        </View>

        <View style={styles.currentText}>
          <Text style={styles.currentTitle}>Use current location</Text>
          <Text numberOfLines={2} style={styles.currentAddress}>
            {locationLoading
              ? "Detecting location..."
              : locationError || currentLocation?.address || "Location unavailable"}
          </Text>
        </View>

        <Text style={styles.navArrow}>›</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Searching locations...</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.resultCard}
            onPress={() => applySelection(item)}
          >
            <View style={styles.resultIconWrap}>
              <Text style={styles.pinIcon}>Pin</Text>
            </View>

            <View style={styles.resultText}>
              <Text numberOfLines={1} style={styles.resultTitle}>
                {item.address.split(",")[0] || "Selected location"}
              </Text>
              <Text numberOfLines={2} style={styles.resultAddress}>
                {item.address}
              </Text>
            </View>

            <Text style={styles.navArrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && query.trim().length >= 3 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>Search</Text>
              <Text style={styles.emptyTitle}>No locations found</Text>
              <Text style={styles.emptyText}>
                Try a college, landmark, street or area.
              </Text>
            </View>
          ) : null
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          disabled={!canContinue}
          onPress={() => {
            if (!canContinue) {
              return;
            }

            goBackSafely();
          }}
        >
          <Text style={[styles.nextText, !canContinue && styles.nextTextDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 14,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 18,
    color: "#64748B",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    paddingVertical: 2,
  },
  clearText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    paddingLeft: 8,
  },
  webMapNotice: {
    minHeight: 78,
    backgroundColor: "#E0ECFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14,
    justifyContent: "center",
  },
  webMapNoticeText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  mapContainer: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#E2E8F0",
  },
  map: {
    flex: 1,
  },
  mapHint: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapHintText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
  },
  confirmMapButton: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmMapText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  currentCardWarning: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
  },
  currentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: 0.6,
  },
  currentText: {
    flex: 1,
    minWidth: 0,
  },
  currentTitle: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 15,
  },
  currentAddress: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  navArrow: {
    fontSize: 24,
    color: "#CBD5E1",
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 13,
  },
  results: {
    paddingBottom: 24,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  resultIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pinIcon: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  resultText: {
    flex: 1,
    minWidth: 0,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  resultAddress: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 30,
    color: "#CBD5E1",
  },
  emptyTitle: {
    marginTop: 10,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  nextButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  nextTextDisabled: {
    color: "#F8FAFC",
  },
});
