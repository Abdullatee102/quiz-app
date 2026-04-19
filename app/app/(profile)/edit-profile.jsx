import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { Colors } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { user, profile, fetchProfile } = useAuthStore();
  const [name, setName] = useState(profile?.fullName || '');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!name.trim()) return Alert.alert("Error", "Name cannot be empty");
    
    setUpdating(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { fullName: name });
      await fetchProfile(user.uid);
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Full Name</Text>
      <TextInput 
        style={styles.input} 
        value={name} 
        onChangeText={setName} 
        placeholder="Enter your name"
        placeholderTextColor="#999"
      />
      
      <TouchableOpacity 
        style={[styles.btn, updating && { opacity: 0.7 }]} 
        onPress={handleUpdate}
        disabled={updating}
      >
        {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  label: { fontFamily: 'Ubuntu-Bold', fontSize: 14, color: '#999', marginBottom: 8 },
  input: { 
    backgroundColor: '#F8F9FA', 
    padding: 15, 
    borderRadius: 12, 
    fontFamily: 'Ubuntu-Regular', 
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#EEE'
  },
  btn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: 'Ubuntu-Bold', fontSize: 16 }
});