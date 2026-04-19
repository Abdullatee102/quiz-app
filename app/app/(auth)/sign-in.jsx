import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { GlobalStyles } from '../../constants/styles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const { login, googleAuth, loading, error } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem('lastUserEmail');
      if (savedEmail) setEmail(savedEmail);
    })();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const res = await login(email, password);
    if (res?.success) {
      // Save email for biometric context
      await AsyncStorage.setItem('lastUserEmail', email);
      router.replace('/(main)');
    }
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    const biometricEnabled = await AsyncStorage.getItem('useBiometrics');
    const savedEmail = await AsyncStorage.getItem('lastUserEmail');

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Not Available", "Biometrics not set up on this device.");
      return;
    }

    if (biometricEnabled !== 'true' || !savedEmail) {
      Alert.alert(
        "Setup Required", 
        "Please sign in with your password first and enable Biometrics in Security settings."
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login as ${savedEmail}`,
      fallbackLabel: 'Use Password',
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(main)');
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken || signInResult.idToken;
      if (!idToken) throw new Error("No ID Token found");
      await googleAuth(idToken);
      router.replace('/(main)');
    } catch (err) {
      if (err.code !== 'ASYNC_OP_IN_PROGRESS') {
        Alert.alert("Google Error", err.message);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <View style={[GlobalStyles.safeArea, styles.container]}>
      <Text style={GlobalStyles.headerTitle}>Welcome Back</Text>
      <Text style={GlobalStyles.subtitle}>Sign in to continue your assessment journey.</Text>

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
        
        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            style={[GlobalStyles.inputField, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={[GlobalStyles.primaryBtn, (loading || socialLoading) && { opacity: 0.7 }]} 
          onPress={handleLogin} 
          disabled={loading || socialLoading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={GlobalStyles.btnText}>Sign In</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>QUICK ACCESS</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} onPress={handleBiometricAuth} disabled={loading || socialLoading}>
          <Ionicons name="finger-print" size={24} color={Colors.primary} />
          <Text style={styles.socialLabel}>Biometrics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignIn} disabled={loading || socialLoading}>
          {socialLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
            <>
              <Ionicons name="logo-google" size={24} color={Colors.primary} />
              <Text style={styles.socialLabel}>Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.linkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, justifyContent: 'center' },
  form: { marginTop: 30 },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 15,
    marginBottom: 15,
  },
  forgotText: { textAlign: 'right', color: Colors.primary, fontFamily: 'Ubuntu-Medium', marginBottom: 25 },
  errorText: { color: Colors.error, fontFamily: 'Ubuntu-Regular', textAlign: 'center', marginBottom: 15 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: Colors.secondary },
  dividerText: { marginHorizontal: 10, fontFamily: 'Ubuntu-Medium', color: '#999', fontSize: 12 },
  socialRow: { flexDirection: 'row', gap: 15 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 15, backgroundColor: Colors.secondary + '30', borderWidth: 1, borderColor: Colors.secondary, minHeight: 60 },
  socialLabel: { fontFamily: 'Ubuntu-Medium', color: Colors.text },
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontFamily: 'Ubuntu-Regular', color: '#666' },
  linkText: { color: Colors.primary, fontFamily: 'Ubuntu-Bold' },
});