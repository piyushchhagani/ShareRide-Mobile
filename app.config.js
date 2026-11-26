const appJson = require("./app.json");

module.exports = ({ config }) => {
  const base = config || appJson.expo;
  const mapsApiKey = (process.env.GOOGLE_MAPS_API_KEY || "").trim();
  const plugins = (base.plugins || []).filter(
    (plugin) => !(Array.isArray(plugin) && plugin[0] === "react-native-maps")
  );

  if (mapsApiKey) {
    plugins.push([
      "react-native-maps",
      {
        androidGoogleMapsApiKey: mapsApiKey,
      },
    ]);
  }

  return {
    ...base,
    plugins,
    android: {
      ...base.android,
      ...(mapsApiKey
        ? {
            config: {
              ...base.android?.config,
              googleMaps: {
                ...base.android?.config?.googleMaps,
                apiKey: mapsApiKey,
              },
            },
          }
        : {}),
    },
    extra: {
      ...base.extra,
      mapsConfigured: Boolean(mapsApiKey),
    },
  };
};
