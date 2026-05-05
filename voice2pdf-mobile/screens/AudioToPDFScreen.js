import React, { useState } from "react";
import { ScrollView, View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { audioToPDF, BASE_URL, handleApiError } from "../services/api";

const LANGUAGE_OPTIONS = ["English", "Urdu", "Hindi", "French", "Spanish", "German", "Arabic"];

export default function AudioToPDFScreen() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("voice2pdf");
  const [language, setLanguage] = useState("English");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: [DocumentPicker.types.audio, DocumentPicker.types.video], copyToCacheDirectory: true });
      if (result.type === "success") {
        setFile(result);
        setOriginalText("");
        setTranslatedText("");
        setPdfUrl("");
      }
    } catch (error) {
      Alert.alert("File selection failed", error.message || "Unable to select file");
    }
  };

  const handleConvert = async () => {
    if (!file) {
      Alert.alert("Missing file", "Please select an audio or video file first.");
      return;
    }
    if (!filename.trim()) {
      Alert.alert("Missing filename", "Please enter a filename for the PDF.");
      return;
    }

    setLoading(true);
    try {
      const data = await audioToPDF(file, filename.trim(), language);
      setOriginalText(data.original_text || "");
      setTranslatedText(data.translated_text || "");
      setPdfUrl(data.pdf_url ? `${BASE_URL}${data.pdf_url}` : "");
      Alert.alert("PDF Created", "Your PDF is ready.");
    } catch (error) {
      Alert.alert("Conversion failed", handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const openPdf = async () => {
    if (!pdfUrl) return;
    try {
      await Linking.openURL(pdfUrl);
    } catch (error) {
      Alert.alert("Cannot open PDF", error.message || "Unable to open PDF file");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Audio → PDF</Text>
      <Button title={file ? `Selected: ${file.name}` : "Pick Audio or Video"} onPress={pickFile} color="#2563eb" />
      <TextInput
        style={styles.input}
        placeholder="PDF filename"
        placeholderTextColor="#94a3b8"
        value={filename}
        onChangeText={setFilename}
      />
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
        <Button title="Convert to PDF" onPress={handleConvert} disabled={loading} color="#10b981" />
      </View>
      {loading && <ActivityIndicator size="large" color="#38bdf8" style={styles.loader} />}
      {pdfUrl ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>PDF URL</Text>
          <Text style={styles.linkText} onPress={openPdf}>{pdfUrl}</Text>
        </View>
      ) : null}
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
  input: {
    backgroundColor: "#111827",
    color: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
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
    marginBottom: 10,
    fontWeight: "700",
  },
  resultText: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 22,
  },
  linkText: {
    color: "#7dd3fc",
    textDecorationLine: "underline",
  },
  note: {
    color: "#94a3b8",
    marginTop: 20,
    fontSize: 12,
  },
});
