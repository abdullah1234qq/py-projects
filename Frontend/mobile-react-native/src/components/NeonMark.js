import React from "react";
import { Text, View } from "react-native";

import { theme } from "../theme";

export function NeonMark({ mode = "doc", tone = "blue" }) {
  const color = tone === "green" ? theme.colors.green : theme.colors.cyan;
  return (
    <View style={[styles.outer, { borderColor: color, shadowColor: color }]}>
      <View style={[styles.middle, { borderColor: color }]}>
        <View style={[styles.inner, { borderColor: color }]}>
          <Text style={[styles.icon, { color }]}>{mode === "mic" ? "MIC" : "PDF"}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = {
  outer: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    marginBottom: theme.spacing.lg
  },
  middle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  inner: {
    width: 92,
    height: 92,
    borderRadius: theme.radius,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    fontSize: 22,
    fontWeight: "900"
  }
};
