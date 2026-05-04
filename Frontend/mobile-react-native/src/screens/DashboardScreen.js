import React from "react";
import { Pressable, Text, View } from "react-native";

import { NeonCard } from "../components/NeonCard";
import { NeonMark } from "../components/NeonMark";
import { theme } from "../theme";

const actions = [
  { id: "audio", title: "Audio to PDF", copy: "Convert audio files into PDF documents.", tone: "blue", badge: "PDF" },
  { id: "pdf", title: "PDF to Audio", copy: "Convert documents into natural audio.", tone: "green", badge: "TTS" },
  { id: "stream", title: "Stream Audio to PDF", copy: "Speak in real time and save a PDF.", tone: "purple", badge: "MIC" }
];

export function DashboardScreen({ username, setScreen }) {
  return (
    <View>
      <View style={styles.hero}>
        <NeonMark />
        <Text style={styles.logo}>Voice<Text style={styles.logoGreen}>2</Text>PDF</Text>
        <Text style={styles.tagline}>Your Voice. Your PDF. Your Way.</Text>
      </View>
      <Text style={styles.heading}>Hello, {username || "Student"}</Text>
      <Text style={styles.subheading}>Choose an Action</Text>
      <View style={styles.list}>
        {actions.map((action) => (
          <NeonCard key={action.id} tone={action.tone}>
            <Pressable style={styles.action} onPress={() => setScreen(action.id)}>
              <View style={[styles.badge, styles[action.tone]]}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionCopy}>{action.copy}</Text>
              </View>
              <Text style={styles.chevron}>Next</Text>
            </Pressable>
          </NeonCard>
        ))}
      </View>
    </View>
  );
}

const styles = {
  hero: {
    alignItems: "center",
    marginBottom: theme.spacing.lg
  },
  logo: {
    color: theme.colors.text,
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
