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

export function PdfToAudioScreen() {
  const [file, setFile] = useState(null);
  const [audioPath, setAudioPath] = useState("");
  const [language, setLanguage] = useState("English");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function pickPdf() {
    const picked = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
    setFile(picked);
    setAudioPath("");
    setMessage("");
  }

  async function convert() {
    if (!file) {
      setMessage("Choose a PDF first.");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadAndSave("/pdf-to-audio", file, "voice2pdf-audio.mp3", { language });
      setAudioPath(path);
      setMessage(`✓ Saved to ${path}`);
    } catch (error) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <ScreenHeader title="PDF to Audio" copy="Convert a PDF document into natural-sounding audio." />
      <View style={styles.center}>
        <NeonMark tone="green" />
      </View>
      <NeonCard tone="green">
        <GlowButton tone="green" label={file ? file.name : "Choose PDF"} onPress={pickPdf} />
        <TextInput
          value={language}
          onChangeText={setLanguage}
          placeholder="Language"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
        />
        {audioPath ? <AudioPlayer name="Generated audio" detail={audioPath} /> : null}
      </NeonCard>
      <GlowButton tone="green" label={busy ? "Generating..." : "Generate Audio"} onPress={convert} disabled={busy} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = {
  center: {
    alignItems: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.panel,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.md
  },
  secondary: {
    marginTop: theme.spacing.sm
  },
  message: {
    color: theme.colors.green,
    textAlign: "center",
    marginTop: theme.spacing.md
  }
};
