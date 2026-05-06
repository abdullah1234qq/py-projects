import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AudioToPDFScreen from "./screens/AudioToPDFScreen";
import PDFToAudioScreen from "./screens/PDFToAudioScreen";
import AllAudioScreen from "./screens/AllAudioScreen";
import RealtimeScreen from "./screens/RealtimeScreen";
import DebugScreen from "./screens/DebugScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AudioToPDF"
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#ffffff",
          contentStyle: { backgroundColor: "#020617" },
        }}
      >
        <Stack.Screen name="AudioToPDF" component={AudioToPDFScreen} options={{ title: "Audio → PDF" }} />
        <Stack.Screen name="PDFToAudio" component={PDFToAudioScreen} options={{ title: "PDF → Audio" }} />
        <Stack.Screen name="AllAudio" component={AllAudioScreen} options={{ title: "All Audio" }} />
        <Stack.Screen name="Realtime" component={RealtimeScreen} options={{ title: "Realtime" }} />
        <Stack.Screen name="Debug" component={DebugScreen} options={{ title: "🐛 Debug Logs", headerTintColor: "#ff6b6b" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
