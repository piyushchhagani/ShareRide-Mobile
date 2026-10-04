import { Text } from "react-native";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
          backgroundColor: "#FFFFFF",
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⌂</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="find-ride"
        options={{
          title: "Find Ride",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⌖</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="offer-ride"
        options={{
          title: "Offer Ride",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>＋</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>▣</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>●</Text>
          ),
        }}
      />
    </Tabs>
  );
}