import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

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

const DEFAULT_POINT = { latitude: 21.1458, longitude: 79.0882 };

export default function LocationMap({
  pickup,
  destination,
  showCurrentLocation = true,
}: Props) {
  const [currentLocation, setCurrentLocation] =
    useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeSummary, setRouteSummary] = useState("");
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    let active = true;

    async function locate() {
      if (!showCurrentLocation) {
        setLoading(false);
        return;
      }

      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();

        if (permission.status !== "granted") return;

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
        // Map remains usable when location permission is unavailable.
      } finally {
        if (active) setLoading(false);
      }
    }

    void locate();
    return () => {
      active = false;
    };
  }, [showCurrentLocation]);

  const html = useMemo(() => {
    const center = pickup ?? destination ?? currentLocation ?? DEFAULT_POINT;
    const points = {
      pickup: pickup
        ? { lat: pickup.latitude, lon: pickup.longitude }
        : null,
      destination: destination
        ? { lat: destination.latitude, lon: destination.longitude }
        : null,
      current: showCurrentLocation && currentLocation
        ? { lat: currentLocation.latitude, lon: currentLocation.longitude }
        : null,
      center: { lat: center.latitude, lon: center.longitude },
    };

    return `
<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
html,body,#map{height:100%;width:100%;margin:0}
.leaflet-control-attribution{font-size:10px}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const p = ${JSON.stringify(points)};
const map = L.map('map').setView([p.center.lat,p.center.lon],13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
 maxZoom:19,
 attribution:'&copy; OpenStreetMap contributors'
}).addTo(map);

const bounds=[];

function addPoint(point,label,color){
 if(!point)return;
 const marker=L.circleMarker([point.lat,point.lon],{
  radius:8,color:color,fillColor:color,fillOpacity:1,weight:2
 }).addTo(map).bindPopup(label);
 bounds.push([point.lat,point.lon]);
}

addPoint(p.pickup,'Pickup','#2563eb');
addPoint(p.destination,'Drop-off','#16845b');
addPoint(p.current,'Your location','#f59e0b');

if(p.pickup && p.destination){
 const url='https://router.project-osrm.org/route/v1/driving/'
  +p.pickup.lon+','+p.pickup.lat+';'
  +p.destination.lon+','+p.destination.lat
  +'?overview=full&geometries=geojson';

 fetch(url)
 .then(r=>{if(!r.ok)throw Error('Routing unavailable');return r.json()})
 .then(data=>{
  if(!data.routes || !data.routes.length)throw Error('No route found');
  const r=data.routes[0];
  const line=L.geoJSON(r.geometry,{
   style:{color:'#2563eb',weight:5,opacity:0.85}
  }).addTo(map);
  map.fitBounds(line.getBounds(),{padding:[30,30]});
  window.ReactNativeWebView.postMessage(JSON.stringify({
   type:'route',
   distanceKm:(r.distance/1000).toFixed(1),
   durationMinutes:Math.round(r.duration/60)
  }));
 })
 .catch(e=>window.ReactNativeWebView.postMessage(JSON.stringify({
  type:'error',message:e.message
 })));
}

if(bounds.length===1)map.setView(bounds[0],15);
else if(bounds.length>1)map.fitBounds(bounds,{padding:[30,30]});
</script>
</body>
</html>`;
  }, [pickup, destination, currentLocation, showCurrentLocation]);

  return (
    <View style={styles.container}>
      <WebView
        key={html}
        source={{ html }}
        style={styles.map}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === "route") {
              setRouteSummary(
                `${message.distanceKm} km · about ${message.durationMinutes} min`
              );
              setRouteError("");
            } else if (message.type === "error") {
              setRouteError("Driving route unavailable. Check your connection.");
            }
          } catch {
            setRouteError("Unable to read map information.");
          }
        }}
      />

      {loading && (
        <View style={styles.badge}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.message}>Finding your location…</Text>
        </View>
      )}

      {!!routeSummary && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{routeSummary}</Text>
        </View>
      )}

      {!!routeError && (
        <View style={styles.summary}>
          <Text style={styles.message}>{routeError}</Text>
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
    borderRadius: 16,
  },
  map: { flex: 1 },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
  },
  summary: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    padding: 9,
    backgroundColor: "white",
    borderRadius: 8,
  },
  summaryText: { color: "#16845b", fontWeight: "700" },
  message: { color: "#333", fontSize: 12 },
});
