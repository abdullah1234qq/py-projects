import React, { useState, useEffect, useRef } from "react";
import { ScrollView, View, Text, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { realtimeAPI, BASE_URL, handleApiError } from "../services/api";

const LANGUAGE_OPTIONS = ["English", "Urdu", "Hindi", "French", "Spanish", "German", "Arabic"];

export default function RealtimeScreen() {
  const [recording, setRecording] = useState(null);
  const [statusText, setStatusText] = useState("Ready to record");
  const [audioUrl, setAudioUrl] = useState("");
  const [language, setLanguage] = useState("English");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "Audio recording permission is required.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingObject.startAsync();
      setRecording(recordingObject);
      setStatusText("Recording...");
    } catch (error) {
      Alert.alert("Recording failed", error.message || "Unable to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setStatusText("Recording stopped");
      if (!uri) {
        Alert.alert("Recording failed", "No recording URI returned.");
        return;
      }
      const file = {
        uri,
        name: `realtime-${Date.now()}.m4a`,
        type: "audio/x-m4a",
      };
      await sendRecording(file);
    } catch (error) {
      Alert.alert("Stop failed", error.message || "Unable to stop recording");
    }
  };

  const sendRecording = async (file) => {
    setLoading(true);
    setOriginalText("");
    setTranslatedText("");
    setAudioUrl("");
    try {
      const data = await realtimeAPI(file, language);
      setOriginalText(data.original_text || "");
      setTranslatedText(data.translated_text || "");
      setAudioUrl(data.audio_url ? `${BASE_URL}${data.audio_url}` : "");
      Alert.alert("Realtime result", "Transcription and audio are ready.");
    } catch (error) {
      Alert.alert("Realtime failed", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!audioUrl) {
      Alert.alert("No audio", "Generate realtime audio first.");
      return;
    }
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      Alert.alert("Playback failed", error.message || "Unable to play audio");
    }
  };

  const pickRecordedFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: [DocumentPicker.types.audio], copyToCacheDirectory: true });
      if (result.type === "success") {
        setStatusText("File selected for realtime");
        await sendRecording(result);
      }
    } catch (error) {
      Alert.alert("File selection failed", error.message || "Unable to select file");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Realtime Speech</Text>
      <Text style={styles.status}>{statusText}</Text>
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
      <View style={styles.controlRow}>
        <Button title="Start Recording" onPress={startRecording} color="#0ea5e9" disabled={!!recording || loading} />
      </View>
      <View style={styles.controlRow}>
        <Button title="Stop Recording" onPress={stopRecording} color="#ef4444" disabled={!recording || loading} />
      </View>
      <View style={styles.controlRow}>
        <Button title="Use Existing Audio" onPress={pickRecordedFile} color="#f59e0b" disabled={loading} />
      </View>
      {loading && <ActivityIndicator size="large" color="#38bdf8" style={styles.loader} />}
      {originalText ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Original Text</Text>
          <Text style={styles.resultText}>{originalText}</Text>
        </View>
      ) : null}
      {translatedText ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Translated Text</Text>
          <Text style={styles.resultText}>{translatedText}</Text>
        </View>
      ) : null}
      {audioUrl ? (
        <View style={styles.playButton}>
          <Button title="Play Result Audio" onPress={playAudio} color="#22c55e" />
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
    marginBottom: 12,
  },
  status: {
    color: "#94a3b8",
    marginBottom: 20,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
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
    backgroundColor: "#10b981",
  },
  languageText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  languageTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  controlRow: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 16,
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
    fontSize: 14,
    lineHeight: 22,
  },
  playButton: {
    marginTop: 20,
  },
  note: {
    color: "#94a3b8",
    marginTop: 20,
    fontSize: 12,
  },
});
