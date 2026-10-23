import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";

const createMapHtml = (pickup, dropoff) => {
  const points = JSON.stringify({ pickup, dropoff });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const points = ${points};

  const map = L.map('map');
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const pickup = [points.pickup.lat, points.pickup.lon];
  const dropoff = [points.dropoff.lat, points.dropoff.lon];

  L.marker(pickup).addTo(map).bindPopup('Pickup location');
  L.marker(dropoff).addTo(map).bindPopup('Drop-off location');

  map.fitBounds(L.latLngBounds([pickup, dropoff]), { padding: [35, 35] });

  fetch(
    'https://router.project-osrm.org/route/v1/driving/' +
    points.pickup.lon + ',' + points.pickup.lat + ';' +
    points.dropoff.lon + ',' + points.dropoff.lat +
    '?overview=full&geometries=geojson'
  )
  .then(response => {
    if (!response.ok) throw new Error('Route request failed');
    return response.json();
  })
  .then(data => {
    if (!data.routes || !data.routes.length) {
      throw new Error('No driving route found');
    }

    const routeData = data.routes[0];

    const route = L.geoJSON(routeData.geometry, {
      style: { color: '#2563eb', weight: 5, opacity: 0.85 }
    }).addTo(map);

    map.fitBounds(route.getBounds(), { padding: [35, 35] });

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'route',
      distanceKm: Number((routeData.distance / 1000).toFixed(1)),
      durationMinutes: Math.round(routeData.duration / 60)
    }));
  })
  .catch(error => {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'error',
      message: error.message
    }));
  });
</script>
</body>
</html>`;
};

export default function ShareRideMap({ pickup, dropoff, onRouteInfo }) {
  const html = useMemo(
    () => createMapHtml(pickup, dropoff),
    [pickup.lat, pickup.lon, dropoff.lat, dropoff.lon]
  );

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
            if (message.type === "route") onRouteInfo?.(message);
            if (message.type === "error") console.warn("Map route:", message.message);
          } catch {
            console.warn("Invalid map message");
          }
        }}
      />
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 350, overflow: "hidden", borderRadius: 12 },
  map: { flex: 1 },
  attribution: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "white",
    color: "#333",
    fontSize: 10,
    paddingHorizontal: 5,
    paddingVertical: 2
  }
});
