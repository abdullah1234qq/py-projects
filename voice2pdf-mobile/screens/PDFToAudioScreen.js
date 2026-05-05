import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { pdfToAudio, BASE_URL, handleApiError } from "../services/api";

const LANGUAGE_OPTIONS = ["English", "Urdu", "Hindi", "French", "Spanish", "German", "Arabic"];

export default function PDFToAudioScreen() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: [DocumentPicker.types.pdf], copyToCacheDirectory: true });
      if (result.type === "success") {
        setFile(result);
        setAudioUrl("");
      }
    } catch (error) {
      Alert.alert("File selection failed", error.message || "Unable to select file");
    }
  };

  const handleConvert = async () => {
    if (!file) {
      Alert.alert("Missing file", "Please choose a PDF file first.");
      return;
    }
    setLoading(true);
    try {
      const data = await pdfToAudio(file, language);
      const url = data.audio_url ? `${BASE_URL}${data.audio_url}` : "";
      setAudioUrl(url);
      Alert.alert("Audio generated", "Your audio is ready to play.");
    } catch (error) {
      Alert.alert("Conversion failed", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!audioUrl) {
      Alert.alert("No audio", "Generate audio first.");
      return;
    }
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert("Playback error", error.message || "Unable to play audio");
    }
  };

  const openAudio = async () => {
    if (!audioUrl) return;
    try {
      await Linking.openURL(audioUrl);
    } catch (error) {
      Alert.alert("Cannot open audio", error.message || "Unable to open audio URL");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>PDF → Audio</Text>
      <Button title={file ? `Selected: ${file.name}` : "Pick PDF File"} onPress={pickFile} color="#2563eb" />
      <View style={styles.languageRow}>
        {LANGUAGE_OPTIONS.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.languageButton, language === item && styles.languageButtonActive]}
            onPress={() => setLanguage(item)}
          >
            <Text style={[styles.languageText, language === item && styles.languageTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.buttonWrapper}>
        <Button title="Generate Audio" onPress={handleConvert} disabled={loading} color="#8b5cf6" />
      </View>
      {loading && <ActivityIndicator size="large" color="#38bdf8" style={styles.loader} />}
      {audioUrl ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Audio URL</Text>
          <Text style={styles.linkText} onPress={openAudio}>{audioUrl}</Text>
          <View style={styles.playButton}>
            <Button title="Play Audio" onPress={playAudio} color="#22c55e" />
          </View>
        </View>
      ) : null}
      <Text style={styles.note}>Backend: {BASE_URL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#020617",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#1f2937",
    marginRight: 8,
    marginBottom: 8,
  },
  languageButtonActive: {
    backgroundColor: "#8b5cf6",
  },
  languageText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  languageTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  buttonWrapper: {
    marginTop: 20,
  },
  loader: {
    marginVertical: 20,
  },
  resultBox: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  resultLabel: {
    color: "#38bdf8",
    marginBottom: 8,
    fontWeight: "700",
  },
  resultText: {
    color: "#e2e8f0",
    marginBottom: 16,
  },
  linkText: {
    color: "#7dd3fc",
    textDecorationLine: "underline",
  },
  playButton: {
    alignSelf: "flex-start",
    marginTop: 16,
  },
  note: {
    color: "#94a3b8",
    marginTop: 20,
    fontSize: 12,
  },
});
