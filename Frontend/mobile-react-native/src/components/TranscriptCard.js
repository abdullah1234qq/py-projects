import React from "react";
import { Text, View } from "react-native";

import { theme } from "../theme";

export function TranscriptCard({ text }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Live Preview</Text>
      <Text style={styles.text}>{text || "Your real-time transcript will appear here as audio chunks are processed."}</Text>
    </View>
  );
}

const styles = {
  card: {
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panelStrong,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg
  },
  label: {
    color: theme.colors.green,
    fontWeight: "900",
    marginBottom: theme.spacing.sm
  },
  text: {
    minHeight: 76,
    color: theme.colors.text,
    lineHeight: 21
  }
};
