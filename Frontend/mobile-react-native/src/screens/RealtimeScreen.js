import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { AudioBars } from "../components/AudioBars";
import { GlowButton } from "../components/GlowButton";
import { NeonMark } from "../components/NeonMark";
import { ScreenHeader } from "../components/ScreenHeader";
import { TranscriptCard } from "../components/TranscriptCard";
import { useRealtimeStream } from "../hooks/useRealtimeStream";
import { theme } from "../theme";

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function RealtimeScreen() {
  const [language, setLanguage] = useState("en");
  const realtime = useRealtimeStream(language);

  return (
    <View>
      <ScreenHeader title="Stream Audio to PDF" copy="Speak in real time and convert your voice into a PDF." />
      <View style={styles.center}>
        <NeonMark mode="mic" tone="green" />
      </View>
      <Text style={styles.headline}><Text style={styles.green}>Speak.</Text> We&apos;ll write.</Text>
      <View style={styles.status}>
        <View style={[styles.dot, realtime.listening && styles.dotLive]} />
        <Text style={styles.statusText}>{realtime.listening ? "Listening..." : "Ready"}</Text>
        <Text style={styles.time}>{formatTime(realtime.elapsed)}</Text>
      </View>
      <AudioBars tone="green" count={44} />
      <View style={styles.controls}>
        <TextInput
          value={language}
          onChangeText={setLanguage}
          placeholder="en"
          placeholderTextColor={theme.colors.muted}
          style={styles.language}
        />
        <GlowButton tone="green" round label={realtime.listening ? "Pause" : "Start"} onPress={realtime.listening ? realtime.stop : realtime.start} />
        <GlowButton label="Save PDF" onPress={realtime.savePdf} />
      </View>
      <TranscriptCard text={realtime.transcript} />
      {realtime.message ? <Text style={styles.message}>{realtime.message}</Text> : null}
    </View>
  );
}

const styles = {
  center: {
    alignItems: "center"
  },
  headline: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: theme.spacing.md
  },
  green: {
    color: theme.colors.green
  },
  status: {
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panelStrong,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.muted
  },
  dotLive: {
    backgroundColor: theme.colors.green
  },
  statusText: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: "800"
  },
  time: {
    color: theme.colors.text
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg
  },
  language: {
    color: theme.colors.text,
    backgroundColor: theme.colors.panelStrong,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontWeight: "900",
    minWidth: 72
  },
  message: {
    color: theme.colors.green,
    textAlign: "center",
    marginTop: theme.spacing.md
  }
};
