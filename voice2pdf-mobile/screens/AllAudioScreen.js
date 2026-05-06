import React, { useState } from "react";
import { ScrollView, View, Text, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { pdfToAllAudio, BASE_URL, handleApiError } from "../services/api";
import { logError } from "../utils/logger";

export default function AllAudioScreen({ navigation }) {
  const [file, setFile] = useState(null);
  const [zipUrl, setZipUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: [DocumentPicker.types.pdf], copyToCacheDirectory: true });
      if (result.type === "success") {
        setFile(result);
        setZipUrl("");
      }
    } catch (error) {
      await logError(error, "AllAudio - File Selection");
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
      const data = await pdfToAllAudio(file);
      const url = data.zip_url ? `${BASE_URL}${data.zip_url}` : "";
      setZipUrl(url);
      Alert.alert("ZIP ready", "Your multi-language audio ZIP is available.");
    } catch (error) {
      await logError(error, "AllAudio - Conversion");
      Alert.alert("Conversion failed", error.message || "Unable to convert PDF to all audio");
    } finally {
      setLoading(false);
    }
  };

  const openZip = async () => {
    if (!zipUrl) return;
    try {
      await Linking.openURL(zipUrl);
    } catch (error) {
      await logError(error, "AllAudio - Open ZIP");
      Alert.alert("Open failed", error.message || "Unable to open ZIP URL");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>PDF → All Audio</Text>
      <Button title={file ? `Selected: ${file.name}` : "Pick PDF File"} onPress={pickFile} color="#2563eb" />
      <View style={styles.buttonWrapper}>
        <Button title="Generate ZIP" onPress={handleConvert} disabled={loading} color="#f59e0b" />
      </View>
      {loading && <ActivityIndicator size="large" color="#38bdf8" style={styles.loader} />}
      {zipUrl ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>ZIP URL</Text>
          <TouchableOpacity onPress={openZip}>
            <Text style={styles.linkText}>{zipUrl}</Text>
          </TouchableOpacity>
          <View style={styles.openButton}>
            <Button title="Open ZIP" onPress={openZip} color="#22c55e" />
          </View>
        </View>
      ) : null}
      <View style={styles.debugButtonWrapper}>
        <TouchableOpacity style={styles.debugButton} onPress={() => navigation.navigate("Debug")}>
          <Text style={styles.debugButtonText}>🐛 View Logs</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
  },
  openButton: {
    alignSelf: "flex-start",
  },
  debugButtonWrapper: {
    marginTop: 20,
  },
  debugButton: {
    backgroundColor: "#6f42c1",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  debugButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  note: {
    color: "#94a3b8",
    marginTop: 20,
    fontSize: 12,
  },
});
