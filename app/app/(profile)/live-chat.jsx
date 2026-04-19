import React from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function LiveChatScreen() {
  const router = useRouter();
  
  const TAWK_TO_URL = 'https://tawk.to/chat/69e402356936c61c3874666d/1jmhah8ud';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <WebView 
        source={{ uri: TAWK_TO_URL }}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 18, color: Colors.text },
  loading: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20 }
});