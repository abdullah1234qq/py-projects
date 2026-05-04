import React from "react";
import { Text, View } from "react-native";

import { theme } from "../theme";

export function ScreenHeader({ title, copy }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {copy ? <Text style={styles.copy}>{copy}</Text> : null}
    </View>
  );
}

const styles = {
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.lg
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  copy: {
    color: theme.colors.muted,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    textAlign: "center"
  }
};
