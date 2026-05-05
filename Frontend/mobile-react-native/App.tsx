import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AudioToPdfScreen } from "./src/screens/AudioToPdfScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PdfToAudioScreen } from "./src/screens/PdfToAudioScreen";
import { PdfAllAudioScreen } from "./src/screens/PdfAllAudioScreen";
import { RealtimeScreen } from "./src/screens/RealtimeScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#0f172a",
            borderTopColor: "#1e293b",
          },
          tabBarActiveTintColor: "#38bdf8",
          tabBarInactiveTintColor: "#64748b",
          headerStyle: {
            backgroundColor: "#0f172a",
          },
          headerTintColor: "#fff",
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="AudioToPdf"
          component={AudioToPdfScreen}
          options={{
            tabBarLabel: "Audio → PDF",
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="PdfToAudio"
          component={PdfToAudioScreen}
          options={{
            tabBarLabel: "PDF → Audio",
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="PdfAllAudio"
          component={PdfAllAudioScreen}
          options={{
            tabBarLabel: "All Audio",
            tabBarIcon: () => null,
          }}
        />
        <Tab.Screen
          name="Realtime"
          component={RealtimeScreen}
          options={{
            tabBarLabel: "Realtime",
            tabBarIcon: () => null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}