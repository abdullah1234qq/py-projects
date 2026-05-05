import React from "react";
import { Text, View } from "react-native";

import { NeonMark } from "../components/NeonMark";
import { theme } from "../theme";

export function DashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <NeonMark />
        <Text style={styles.logo}>Voice<Text style={styles.logoGreen}>2</Text>PDF</Text>
        <Text style={styles.tagline}>Your Voice. Your PDF. Your Way.</Text>
      </View>
      <Text style={styles.welcome}>Welcome to Voice2PDF Mobile</Text>
      <Text style={styles.description}>
        Use the tabs below to convert audio to PDF, PDF to audio, generate multi-language audio, or use real-time speech translation.
      </Text>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  hero: {
    alignItems: "center",
    marginBottom: theme.spacing.xl
  },
  logo: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "bold"
  },
  logoGreen: {
    color: theme.colors.green
  },
  tagline: {
    color: theme.colors.muted,
    fontSize: 16,
    marginTop: theme.spacing.sm
  },
  welcome: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing.md
  },
  description: {
    color: theme.colors.muted,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24
  }
};
    fontSize: 38,
    fontWeight: "900"
  },
  logoGreen: {
    color: theme.colors.green
  },
  tagline: {
    color: theme.colors.cyan,
    marginTop: theme.spacing.xs
  },
  heading: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  subheading: {
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md
  },
  list: {
    gap: theme.spacing.md
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: theme.radius,
    alignItems: "center",
    justifyContent: "center"
  },
  blue: {
    backgroundColor: theme.colors.blue
  },
  green: {
    backgroundColor: theme.colors.green
  },
  purple: {
    backgroundColor: theme.colors.purple
  },
  badgeText: {
    color: theme.colors.text,
    fontWeight: "900"
  },
  actionText: {
    flex: 1
  },
  actionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 17
  },
  actionCopy: {
    color: theme.colors.muted,
    lineHeight: 20,
    marginTop: 4
  },
  chevron: {
    color: theme.colors.text,
    fontWeight: "800"
  }
};
