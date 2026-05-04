import React from "react";
import { View } from "react-native";

import { theme } from "../theme";

export function NeonCard({ children, tone = "blue", style }) {
  const borderColor = tone === "green" ? theme.colors.green : tone === "purple" ? theme.colors.purple : theme.colors.blue;
  return <View style={[styles.card, { borderColor }, style]}>{children}</View>;
}

const styles = {
  card: {
    borderWidth: 1,
    borderRadius: theme.radius,
    backgroundColor: "rgba(13, 25, 44, 0.86)",
    padding: theme.spacing.md,
    shadowColor: theme.colors.blue,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6
  }
};
