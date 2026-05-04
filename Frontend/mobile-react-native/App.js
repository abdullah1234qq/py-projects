import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from "react-native";

import { useDeviceType } from "./src/hooks/useDeviceType";
import { useStoredName } from "./src/hooks/useStoredName";
import { AudioToPdfScreen } from "./src/screens/AudioToPdfScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PdfToAudioScreen } from "./src/screens/PdfToAudioScreen";
import { RealtimeScreen } from "./src/screens/RealtimeScreen";
import { theme } from "./src/theme";

const tabs = [
  { id: "home", label: "Home" },
  { id: "audio", label: "Audio" },
  { id: "pdf", label: "PDF" },
  { id: "stream", label: "Stream" }
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [username, setUsername] = useStoredName();
  const deviceType = useDeviceType();

  const content = useMemo(() => {
    if (screen === "audio") {
      return <AudioToPdfScreen />;
    }
    if (screen === "pdf") {
      return <PdfToAudioScreen />;
    }
    if (screen === "stream") {
      return <RealtimeScreen />;
    }
    return <DashboardScreen username={username} setScreen={setScreen} />;
  }, [screen, username]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bgDeep} />
      <View style={[styles.shell, deviceType === "desktop" && styles.desktopShell]}>
        <View style={styles.topbar}>
          <View>
            <Text style={styles.greeting}>Hello, {username || "Student"}</Text>
            <Text style={styles.copy}>Let your voice do the work.</Text>
          </View>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Name"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Text key={tab.id} onPress={() => setScreen(tab.id)} style={[styles.tab, screen === tab.id && styles.activeTab]}>
              {tab.label}
            </Text>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bgDeep
  },
  shell: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.spacing.md
  },
  desktopShell: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%"
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm
  },
  greeting: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  copy: {
    color: theme.colors.muted,
    marginTop: 4
  },
  input: {
    minWidth: 118,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panel,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  content: {
    paddingVertical: theme.spacing.lg,
    paddingBottom: 112
  },
  tabs: {
    position: "absolute",
    left: theme.spacing.md,
    right: theme.spacing.md,
    bottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panelStrong,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing.xs
  },
  tab: {
    flex: 1,
    color: theme.colors.muted,
    textAlign: "center",
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius,
    fontWeight: "800"
  },
  activeTab: {
    color: theme.colors.text,
    backgroundColor: "rgba(22, 135, 255, 0.18)"
  }
};
