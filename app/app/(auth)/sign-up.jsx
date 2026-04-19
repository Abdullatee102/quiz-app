import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { GlobalStyles } from '../../constants/styles';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  
  const { signUp, googleAuth, loading, error, githubLogin } = useAuthStore();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Missing Fields", "Please fill in all details.");
      return;
    }
    const res = await signUp(email, password, fullName);
    if (res?.success) router.replace('/(auth)/verify-email');
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      try { await GoogleSignin.signOut(); } catch (e) {}
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken || signInResult.idToken;
      if (!idToken) throw new Error("No ID Token found");
      const res = await googleAuth(idToken);
      if (res) router.replace('/(main)');
    } catch (err) {
      if (err.code !== 'ASYNC_OP_IN_PROGRESS') {
        Alert.alert("Google Error", err.message);
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={GlobalStyles.safeArea}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.subtitle}>Join Brain Buzz and start your assessment journey.</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#666"
            style={GlobalStyles.inputField}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#666"
            style={GlobalStyles.inputField}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          
          {/* Password Toggle Wrapper */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              style={[GlobalStyles.inputField, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={[GlobalStyles.primaryBtn, (loading || socialLoading) && { opacity: 0.7 }]} 
          onPress={handleSignUp}
          disabled={loading || socialLoading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={GlobalStyles.btnText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignUp} disabled={loading || socialLoading}>
            {socialLoading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Ionicons name="logo-google" size={24} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={githubLogin} disabled={loading || socialLoading}>
            <Ionicons name="logo-github" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 25, justifyContent: 'center', flexGrow: 1 },
  headerTitle: { fontFamily: 'Archivo-Black', fontSize: 32, color: Colors.primary, marginBottom: 10 },
  subtitle: { fontFamily: 'Ubuntu-Regular', fontSize: 16, color: '#666', marginBottom: 30 },
  inputContainer: { marginBottom: 20 },
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
  eyeIcon: { padding: 5 },
  errorText: { color: Colors.error, fontFamily: 'Ubuntu-Medium', marginBottom: 10, textAlign: 'center' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: Colors.secondary },
  dividerText: { marginHorizontal: 10, fontFamily: 'Ubuntu-Medium', color: '#999', fontSize: 12 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 30 },
  socialBtn: { padding: 15, borderRadius: 12, borderWidth: 1, borderColor: Colors.secondary, minWidth: 60, alignItems: 'center' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { textAlign: 'center', fontFamily: 'Ubuntu-Regular', color: '#666' },
  linkText: { color: Colors.primary, fontFamily: 'Ubuntu-Bold' }
});