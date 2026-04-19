import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { GlobalStyles } from '../../constants/styles';
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyEmail() {
  const router = useRouter();

  const openEmailApp = () => {
    Linking.openURL('mailto:');
  };

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="email-check-outline" size={60} color={Colors.primary} />
      </View>

      <Text style={[GlobalStyles.headerTitle, { textAlign: 'center' }]}>Check Your Email</Text>
      <Text style={[GlobalStyles.subtitle, { textAlign: 'center', marginTop: 10 }]}>
        We've sent a verification link to your email address. Please click the link to secure your account.
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={GlobalStyles.primaryBtn} onPress={openEmailApp}>
          <Text style={GlobalStyles.btnText}>Open Email App</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryBtn} 
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text style={styles.secondaryBtnText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Didn't receive an email? <Text style={styles.resendLink}>Resend</Text>
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 40,
    gap: 15,
  },
  secondaryBtn: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  secondaryBtnText: {
    fontFamily: 'Ubuntu-Bold',
    color: Colors.primary,
    fontSize: 18,
  },
  footerText: {
    marginTop: 30,
    fontFamily: 'Ubuntu-Regular',
    color: '#666',
  },
  resendLink: {
    color: Colors.primary,
    fontFamily: 'Ubuntu-Bold',
  }
});