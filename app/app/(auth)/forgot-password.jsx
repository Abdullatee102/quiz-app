import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { GlobalStyles } from '../../constants/styles';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { forgotPassword, loading } = useAuthStore();
  const router = useRouter();

  const handleReset = async () => {
    if (!email) return Alert.alert("Required", "Please enter your email address.");
    
    const res = await forgotPassword(email);
    if (res.success) {
      Alert.alert("Success", "Reset link sent to your email.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={GlobalStyles.headerTitle}>Reset Password</Text>
      <Text style={GlobalStyles.subtitle}>
        Enter your email address and we'll send you a link to get back into your account.
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#666"
          style={GlobalStyles.inputField}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity 
          style={GlobalStyles.primaryBtn} 
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={GlobalStyles.btnText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25 },
  backBtn: { marginBottom: 30, marginTop: 20 },
  form: { marginTop: 40 },
});