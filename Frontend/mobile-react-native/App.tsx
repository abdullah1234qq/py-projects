import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
} from "react-native";

const App = () => {
  const [result, setResult] = useState("");

  const testBackend = async () => {
    try {
      const res = await fetch("http://10.0.2.2:7860/");
      const text = await res.text();
      setResult(text);
    } catch (e) {
      setResult("Backend not reachable");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🎤 Voice2PDF Mobile</Text>

        <View style={styles.card}>
          <Text style={styles.section}>Audio → PDF</Text>
          <Button title="Test Backend" onPress={testBackend} />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>PDF → Audio</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Realtime Speech</Text>
        </View>

        <Text style={styles.result}>{result}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    margin: 20,
  },
  card: {
    backgroundColor: "#1e293b",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  section: {
    color: "#38bdf8",
    fontSize: 18,
    marginBottom: 10,
  },
  result: {
    color: "#fff",
    margin: 20,
  },
});