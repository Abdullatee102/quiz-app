import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { Colors } from '../../constants/colors';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';

export default function ProfileScreen() {
  const { user, profile, fetchProfile } = useAuthStore();
  const { results } = useQuizStore(); // Use global quiz results
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  // Syncing stats exactly like HomeScreen
  const totalQuizzes = profile?.quizzesCompleted || results.history?.length || 0;
  const totalScore = profile?.totalScore || results.totalScore || 0; 
  const correctAnswers = profile?.totalCorrect || results.correct || 0;

  const userInitial = profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'S';
  const profileImage = profile?.photoURL || user?.photoURL;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri) => {
    setUploading(true);
    try {
      await updateAuthProfile(auth.currentUser, { photoURL: uri });
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { photoURL: uri });
      await fetchProfile(user.uid);
      Alert.alert("Success", "Avatar updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to update image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Profile Identity Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.avatarWrapper}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialAvatar]}>
                <Text style={styles.initialText}>{userInitial}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.fullName || 'Scholar'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="book" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{totalQuizzes}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{totalScore}</Text>
            <Text style={styles.statLabel}>Total Pts</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="trending-up" size={20} color="#27AE60" />
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Achievement & Growth</Text>
          <MenuButton icon="medal-outline" title="My Achievements" onPress={() => router.push('/achievements')} />
          <MenuButton icon="time-outline" title="Quiz History" onPress={() => router.push('/history')} />
          
          <Text style={[styles.menuSectionTitle, { marginTop: 25 }]}>Security & Preference</Text>
          <MenuButton icon="person-outline" title="Edit Profile" onPress={() => router.push('/edit-profile')} />
          <MenuButton icon="finger-print-outline" title="Biometric Security" onPress={() => router.push('/security')} />
          <MenuButton icon="lock-closed-outline" title="Change Password" onPress={() => router.push('/forgot-password')} />
          
          <Text style={[styles.menuSectionTitle, { marginTop: 25 }]}>Support</Text>
          <MenuButton icon="help-circle-outline" title="Help Center" onPress={() => router.push('/support')} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuButton = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
    <View style={styles.menuLeft}>
      <View style={styles.menuIconBox}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: 20, 
    marginBottom: 20 
  },
  headerTitle: { fontFamily: 'Archivo-Black', fontSize: 20, color: Colors.text },
  backBtn: { padding: 5 },
  settingsBtn: { padding: 5 },
  
  profileSection: { alignItems: 'center', marginVertical: 10 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.secondary },
  initialAvatar: { backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 0 },
  initialText: { fontFamily: 'Archivo-Black', color: Colors.primary, fontSize: 36 },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: Colors.primary, 
    padding: 8, 
    borderRadius: 20, 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  userName: { fontFamily: 'Archivo-Black', fontSize: 24, color: Colors.text, marginTop: 15 },
  userEmail: { fontFamily: 'Ubuntu-Light', fontSize: 14, color: '#666', marginTop: 2 },

  statsCard: { 
    flexDirection: 'row', 
    backgroundColor: Colors.white, 
    marginHorizontal: 25, 
    borderRadius: 22, 
    padding: 20, 
    justifyContent: 'space-around', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    marginVertical: 25 
  },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'Archivo-Black', fontSize: 20, color: Colors.text },
  statLabel: { fontFamily: 'Ubuntu-Regular', fontSize: 11, color: '#999', marginTop: 2 },
  divider: { width: 1, height: 35, backgroundColor: '#F0F0F0' },

  menuContainer: { paddingHorizontal: 25 },
  menuSectionTitle: { 
    fontFamily: 'Ubuntu-Bold', 
    fontSize: 12, 
    color: '#999', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 15 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12, 
    marginBottom: 10 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuIconBox: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#F0F7FF', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuText: { fontFamily: 'Ubuntu-Medium', fontSize: 16, color: Colors.text },
});