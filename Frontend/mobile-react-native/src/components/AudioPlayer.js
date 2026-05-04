import React from "react";
import { Text, View } from "react-native";

import { theme } from "../theme";
import { AudioBars } from "./AudioBars";

export function AudioPlayer({ name = "Generated audio", detail = "Ready" }) {
  return (
    <View style={styles.player}>
      <View style={styles.play}>
        <Text style={styles.playText}>Play</Text>
      </View>
      <AudioBars />
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = {
  player: {
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panelStrong,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md
  },
  play: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: theme.colors.cyan,
    borderRadius: 999,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  playText: {
    color: theme.colors.cyan,
    fontWeight: "800"
  },
  meta: {
    alignItems: "center"
  },
  name: {
    color: theme.colors.text,
    fontWeight: "800"
  },
  detail: {
    color: theme.colors.muted,
    marginTop: 4
  }
};
