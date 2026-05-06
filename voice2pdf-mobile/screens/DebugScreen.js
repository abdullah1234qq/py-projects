import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, clearLogs, getLogsSize } from '../utils/logger';

export default function DebugScreen() {
  const [logs, setLogs] = useState('Loading logs...');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logsSize, setLogsSize] = useState(0);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const content = await getLogs();
      const size = await getLogsSize();
      setLogs(content);
      setLogsSize(size);
    } catch (error) {
      setLogs('Error reading logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [loadLogs])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  }, [loadLogs]);

  const handleClearLogs = () => {
    Alert.alert('Clear Logs?', 'Are you sure you want to delete all logs?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Clear',
        onPress: async () => {
          try {
            const success = await clearLogs();
            if (success) {
              Alert.alert('Success', 'Logs cleared successfully');
              await loadLogs();
            } else {
              Alert.alert('Error', 'Failed to clear logs');
            }
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📋 Debug Logs</Text>
          <Text style={styles.headerSubtitle}>
            Size: {formatFileSize(logsSize)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Logs Display */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.logsContainer}
          contentContainerStyle={styles.logsContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38bdf8" />
          }
        >
          <Text style={styles.logsText}>{logs}</Text>
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonDanger]}
          onPress={handleClearLogs}
        >
          <Text style={styles.buttonText}>🗑️ Clear All Logs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  logsContainer: {
    flex: 1,
  },
  logsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logsText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontFamily: 'Courier New',
    lineHeight: 16,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
