import React from "react";
import { Pressable, Text } from "react-native";

import { theme } from "../theme";

export function GlowButton({ label, tone = "blue", round = false, onPress, disabled }) {
  const color = tone === "green" ? theme.colors.green : theme.colors.blue;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        round && styles.round,
        {
          backgroundColor: color,
          shadowColor: color,
          opacity: disabled ? 0.6 : pressed ? 0.82 : 1
        }
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = {
  button: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10
  },
  round: {
    width: 86,
    height: 86,
    alignSelf: "center"
  },
  label: {
    color: theme.colors.text,
    fontWeight: "900"
  }
};
