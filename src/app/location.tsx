import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";

import { useRideStore } from "@/store/ride.store";
import { goBackSafely } from "@/utils/navigation";

type SearchResult = {
  address: string;
  latitude: number;
  longitude: number;
};

export default function LocationScreen() {
  const { type } = useLocalSearchParams<{
    type?: string;
  }>();

  const { setPickup, setDestination } = useRideStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<SearchResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] =
    useState(true);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const loadCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        return;
      }

      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } = position.coords;

      let address = `${latitude.toFixed(
        6
      )}, ${longitude.toFixed(6)}`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent":
                "ShareRide-Mobile/1.0",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          address =
            data.display_name || address;
        }
      } catch (error) {
        console.log(
          "REVERSE LOCATION ERROR:",
          error
        );
      }

      setCurrentLocation({
        address,
        latitude,
        longitude,
      });
    } catch (error) {
      console.log(
        "CURRENT LOCATION ERROR:",
        error
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const searchLocation = async (
    text: string
  ) => {
    setQuery(text);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      /*
       * Prioritize Nagpur because ShareRide
       * is currently being developed/tested
       * around the campus.
       */
      const searchQuery =
        `${text.trim()}, Nagpur, Maharashtra, India`;

      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=jsonv2` +
        `&q=${encodeURIComponent(searchQuery)}` +
        `&limit=10` +
        `&addressdetails=1` +
        `&countrycodes=in`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "ShareRide-Mobile/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Search failed: ${response.status}`
        );
      }

      const data = await response.json();

      let formatted: SearchResult[] =
        data.map((item: any) => ({
          address:
            item.display_name ||
            text.trim(),
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        }));

      /*
       * If Nagpur-specific search gives no result,
       * retry globally in India.
       */
      if (formatted.length === 0) {
        const fallbackUrl =
          `https://nominatim.openstreetmap.org/search` +
          `?format=jsonv2` +
          `&q=${encodeURIComponent(text.trim())}` +
          `&limit=10` +
          `&addressdetails=1` +
          `&countrycodes=in`;

        const fallbackResponse =
          await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
              "User-Agent":
                "ShareRide-Mobile/1.0",
            },
          });

        if (fallbackResponse.ok) {
          const fallbackData =
            await fallbackResponse.json();

          formatted = fallbackData.map(
            (item: any) => ({
              address:
                item.display_name ||
                text.trim(),
              latitude: Number(item.lat),
              longitude: Number(item.lon),
            })
          );
        }
      }

      setResults(formatted);
    } catch (error) {
      console.log(
        "LOCATION SEARCH ERROR:",
        error
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectLocation = (
    location: SearchResult
  ) => {
    console.log(
      "SELECTED LOCATION:",
      location
    );

    Keyboard.dismiss();

    if (type === "destination") {
      setDestination(location);
    } else {
      setPickup(location);
    }

    goBackSafely();
  };

  const title =
    type === "destination"
      ? "Choose destination"
      : "Choose pickup";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            goBackSafely()
          }
        >
          <Text style={styles.back}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>
          ⌕
        </Text>

        <TextInput
          value={query}
          onChangeText={searchLocation}
          placeholder={
            type === "destination"
              ? "Search destination"
              : "Search pickup location"
          }
          placeholderTextColor="#94A3B8"
          style={styles.input}
          autoFocus
        />

        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
            }}
          >
            <Text style={styles.clear}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.currentCard}
        disabled={
          locationLoading ||
          !currentLocation
        }
        onPress={() => {
          if (currentLocation) {
            selectLocation(
              currentLocation
            );
          }
        }}
      >
        <View style={styles.currentIcon}>
          {locationLoading ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          ) : (
            <Text
              style={styles.locationIcon}
            >
              ◎
            </Text>
          )}
        </View>

        <View style={styles.currentText}>
          <Text style={styles.currentTitle}>
            Use current location
          </Text>

          <Text
            numberOfLines={2}
            style={styles.currentAddress}
          >
            {locationLoading
              ? "Detecting location..."
              : currentLocation?.address ||
                "Location unavailable"}
          </Text>
        </View>

        <Text style={styles.arrow}>
          ›
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator
            color="#2563EB"
          />
          <Text style={styles.loadingText}>
            Searching locations...
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item, index) =>
          `${item.latitude}-${item.longitude}-${index}`
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.results
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultCard}
            onPress={() =>
              selectLocation(item)
            }
          >
            <View style={styles.resultIcon}>
              <Text>⌖</Text>
            </View>

            <View style={styles.resultText}>
              <Text
                numberOfLines={1}
                style={styles.resultTitle}
              >
                {item.address.split(",")[0]}
              </Text>

              <Text
                numberOfLines={2}
                style={styles.resultAddress}
              >
                {item.address}
              </Text>

              <Text
                style={styles.coordinates}
              >
                {item.latitude.toFixed(6)},{" "}
                {item.longitude.toFixed(6)}
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading &&
          query.trim().length >= 2 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                ⌕
              </Text>

              <Text
                style={styles.emptyTitle}
              >
                No locations found
              </Text>

              <Text
                style={styles.emptyText}
              >
                Try a college, landmark,
                street or area.
              </Text>
            </View>
          ) : null
        }
      />
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
    paddingTop: 8,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  back: {
    fontSize: 28,
    color: "#0F172A",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  searchBox: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchIcon: {
    fontSize: 24,
    color: "#64748B",
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },

  clear: {
    fontSize: 26,
    color: "#94A3B8",
  },

  currentCard: {
    marginTop: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  currentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  locationIcon: {
    fontSize: 24,
    color: "#2563EB",
  },

  currentText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  currentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },

  currentAddress: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  arrow: {
    fontSize: 28,
    color: "#CBD5E1",
  },

  loading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  loadingText: {
    marginLeft: 8,
    color: "#64748B",
  },

  results: {
    paddingTop: 14,
    paddingBottom: 30,
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  resultText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  resultAddress: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  coordinates: {
    marginTop: 4,
    fontSize: 10,
    color: "#94A3B8",
  },

  empty: {
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 40,
    color: "#CBD5E1",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#64748B",
  },
});