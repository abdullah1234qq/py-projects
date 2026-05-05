import DocumentPicker from "react-native-document-picker";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { uploadAndSave } from "../api";
import { AudioPlayer } from "../components/AudioPlayer";
import { GlowButton } from "../components/GlowButton";
import { NeonCard } from "../components/NeonCard";
import { NeonMark } from "../components/NeonMark";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../theme";

export function AudioToPdfScreen() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("English");
  const [filename, setFilename] = useState("voice2pdf");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function pickAudio() {
    const picked = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.audio] });
    setFile(picked);
    setMessage("");
  }

  async function convert() {
    if (!file) {
      setMessage("Choose an audio file first.");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadAndSave("/audio-to-pdf", file, "voice2pdf-transcript.pdf", {
        language,
        filename: filename || "voice2pdf"
      });
      setMessage(`✓ Saved to ${path}`);
    } catch (error) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <ScreenHeader title="Audio to PDF" copy="Upload your audio file and convert it into a clean PDF." />
      <View style={styles.center}>
        <NeonMark />
      </View>
      <NeonCard>
        <GlowButton label={file ? file.name : "Choose Audio"} onPress={pickAudio} />
        <View style={styles.fields}>
          <TextInput
            value={language}
            onChangeText={setLanguage}
            placeholder="Language"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
          <TextInput
            value={filename}
            onChangeText={setFilename}
            placeholder="Filename"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
        </View>
        {file ? <AudioPlayer name={file.name} detail="Ready to convert" /> : null}
      </NeonCard>
      <GlowButton label={busy ? "Converting..." : "Convert to PDF"} onPress={convert} disabled={busy} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = {
  center: {
    alignItems: "center"
  },
  fields: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panel,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  message: {
    color: theme.colors.green,
    textAlign: "center",
    marginTop: theme.spacing.md
  }
};
