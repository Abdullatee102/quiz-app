import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function SettingsScreen() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const toggleNotifications = async (value) => {
    if (value) {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please enable notifications in your phone settings to receive updates.');
          setNotificationsEnabled(false);
          return;
        }
        setNotificationsEnabled(true);
      } else {
        Alert.alert('Emulator Detected', 'Push notifications require a physical device.');
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
          await logout();
          router.replace('/(auth)/sign-in');
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sectionTitle}>Account & Security</Text>
      
      <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/privacy')}>
        <View style={styles.rowLeft}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#555" />
          <Text style={styles.rowText}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/terms')}>
        <View style={styles.rowLeft}>
          <Ionicons name="document-text-outline" size={24} color="#555" />
          <Text style={styles.rowText}>Terms of Service</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Preferences</Text>

      <View style={styles.settingRow}>
        <View style={styles.rowLeft}>
          <Ionicons name="notifications-outline" size={24} color="#555" />
          <Text style={styles.rowText}>Push Notifications</Text>
        </View>
        <Switch 
          value={notificationsEnabled} 
          onValueChange={toggleNotifications}
          trackColor={{ false: "#767577", true: Colors.primary + '80' }}
          thumbColor={notificationsEnabled ? Colors.primary : "#f4f3f4"}
        />
      </View>

      <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} onPress={handleLogout}>
        <View style={styles.rowLeft}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          <Text style={[styles.rowText, { color: Colors.error }]}>Log Out</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.version}>Version 1.0.0 (Brain Buzz Beta)</Text>
        <Text style={styles.copyright}>© 2026 Popoola Abdullateef</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  sectionTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 13, color: '#999', marginBottom: 10, textTransform: 'uppercase' },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f5f5f5' 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  rowText: { fontFamily: 'Ubuntu-Medium', fontSize: 16, color: '#333' },
  footer: { marginTop: 60, alignItems: 'center', paddingBottom: 40 },
  version: { color: '#ccc', fontSize: 12, fontFamily: 'Ubuntu-Regular' },
  copyright: { color: '#ddd', fontSize: 10, marginTop: 5, fontFamily: 'Ubuntu-Regular' }
});