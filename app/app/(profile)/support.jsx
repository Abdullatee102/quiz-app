import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function HelpCenter() {
  const router = useRouter();

  const FAQItem = ({ question, answer }) => (
    <TouchableOpacity style={styles.faqCard}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 25 }}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:opeabdullateef74@gmail.com')}>
            <Ionicons name="mail" size={24} color={Colors.primary} />
            <Text style={styles.contactLabel}>Email Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactBtn} onPress={() => router.push('/live-chat')}>
            <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
            <Text style={styles.contactLabel}>Live Chat</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Frequently Asked Questions</Text>
        <FAQItem 
          question="How are points calculated?" 
          answer="You earn 10 points for every correct answer. Bonus points are awarded for finishing with more than 50% time remaining." 
        />
        <FAQItem 
          question="Can I retake a quiz?" 
          answer="Yes! You can retake any subject to improve your score. Only your highest score will appear on the leaderboard." 
        />
        <FAQItem 
          question="Biometrics not working?" 
          answer="Ensure you have enabled Fingerprint/FaceID in your phone settings and allowed the app permission in the Security screen." 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  headerTitle: { fontFamily: 'Archivo-Black', fontSize: 20, color: Colors.text },
  sectionTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: Colors.text, marginBottom: 15 },
  contactRow: { flexDirection: 'row', gap: 15 },
  contactBtn: { flex: 1, backgroundColor: '#F0F7FF', padding: 20, borderRadius: 20, alignItems: 'center' },
  contactLabel: { fontFamily: 'Ubuntu-Medium', fontSize: 12, color: Colors.primary, marginTop: 8 },
  faqCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 15 },
  question: { fontFamily: 'Ubuntu-Bold', fontSize: 14, color: Colors.text },
  answer: { fontFamily: 'Ubuntu-Regular', fontSize: 13, color: '#777', marginTop: 8, lineHeight: 20 }
});