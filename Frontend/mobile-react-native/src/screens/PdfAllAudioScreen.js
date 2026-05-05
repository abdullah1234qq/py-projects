import DocumentPicker from "react-native-document-picker";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { uploadAndSave } from "../api";
import { GlowButton } from "../components/GlowButton";
import { NeonCard } from "../components/NeonCard";
import { NeonMark } from "../components/NeonMark";
import { ScreenHeader } from "../components/ScreenHeader";
import { theme } from "../theme";

export function PdfAllAudioScreen() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function pickPdf() {
    const picked = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.pdf] });
    setFile(picked);
    setMessage("");
  }

  async function convertAll() {
    if (!file) {
      setMessage("Choose a PDF first.");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadAndSave("/pdf-to-all-audio", file, "voice2pdf-all-audio.zip");
      setMessage(`✓ Saved to ${path}`);
    } catch (error) {
      setMessage(`✗ ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <ScreenHeader title="PDF to All Audio" copy="Generate multi-language audio from a single PDF." />
      <View style={styles.center}>
        <NeonMark tone="pink" />
      </View>
      <NeonCard tone="pink">
        <GlowButton tone="pink" label={file ? file.name : "Choose PDF"} onPress={pickPdf} />
      </NeonCard>
      <GlowButton tone="pink" label={busy ? "Generating ZIP..." : "Generate Multi-Language Audio ZIP"} onPress={convertAll} disabled={busy} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = {
  center: {
    alignItems: "center"
  },
  message: {
    color: theme.colors.green,
    textAlign: "center",
    marginTop: theme.spacing.md
  }
};