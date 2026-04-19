import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useQuizStore } from '../../store/quizStore';
import { Colors } from '../../constants/colors';
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  { id: 'chemistry', title: 'Chemistry', icon: 'flask-outline', color: '#4834D4', total: 30 },
  { id: 'english', title: 'English', icon: 'alphabetical', color: '#FF9F43', total: 50 },
  { id: 'maths', title: 'Mathematics', icon: 'calculator', color: '#6AB04C', total: 40 },
  { id: 'physics', title: 'Physics', icon: 'atom', color: '#EB4D4B', total: 45 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, loading } = useAuthStore();
  const { results } = useQuizStore();

  const totalQuizzes = profile?.quizzesCompleted || results.history?.length || 0;
  const totalScore = profile?.totalScore || results.totalScore || 0; 
  const correctAnswers = profile?.totalCorrect || results.correct || 0;
  
  const userInitial = (profile?.fullName || user?.displayName || 'S').charAt(0).toUpperCase();
  const profileImage = profile?.photoURL || user?.photoURL;

  const handleCategoryPress = (categoryId, title) => {
    router.push({
      pathname: "/(main)/quiz",
      params: { categoryId, categoryTitle: title }
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id, item.title)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icon} size={30} color={item.color} />
      </View>
      <Text style={styles.categoryTitle}>{item.title}</Text>
      <Text style={styles.categorySub}>{item.total} Questions</Text>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: Colors.white }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <Text style={styles.userName}>{profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Scholar'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(main)/profile')}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialAvatar]}>
                <Text style={styles.initialText}>{userInitial}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>How to play</Text>
            <Text style={styles.infoText}>Pick a subject below to start. Each correct answer earns you 10 points. Watch the timer!</Text>
          </View>
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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            style={{ marginTop: 15 }}
          />
        </View>

        <TouchableOpacity 
          style={styles.timerBanner}
          onPress={() => handleCategoryPress('mixed', 'Timed Challenge')}
        >
          <View>
            <Text style={styles.bannerTitle}>Timed Challenge</Text>
            <Text style={styles.bannerSub}>Mixed Past Questions • 20 mins</Text>
          </View>
          <MaterialCommunityIcons name="timer-sand" size={35} color={Colors.white} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20, marginBottom: 20 },
  welcomeText: { fontFamily: 'Ubuntu-Light', fontSize: 16, color: '#666' },
  userName: { fontFamily: 'Archivo-Black', fontSize: 28, color: Colors.text },
  avatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: Colors.secondary },
  initialAvatar: { backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 0 },
  initialText: { fontFamily: 'Archivo-Black', color: Colors.primary, fontSize: 22 },
  instructionCard: { flexDirection: 'row', backgroundColor: '#F0F7FF', marginHorizontal: 25, padding: 15, borderRadius: 15, marginBottom: 20, alignItems: 'center', gap: 12 },
  infoIconBox: { backgroundColor: '#fff', padding: 8, borderRadius: 10 },
  infoTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 14, color: Colors.primary },
  infoText: { fontFamily: 'Ubuntu-Regular', fontSize: 12, color: '#555', lineHeight: 18 },
  statsCard: { flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: 25, borderRadius: 22, padding: 20, justifyContent: 'space-around', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, marginBottom: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontFamily: 'Archivo-Black', fontSize: 20, color: Colors.text },
  statLabel: { fontFamily: 'Ubuntu-Regular', fontSize: 11, color: '#999', marginTop: 2 },
  divider: { width: 1, height: 35, backgroundColor: '#F0F0F0' },
  sectionContainer: { paddingHorizontal: 25 },
  sectionTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 20, color: Colors.text },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  categoryCard: { backgroundColor: Colors.white, width: '47%', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: '#F5F5F5' },
  iconBox: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 15, marginBottom: 15 },
  categoryTitle: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: Colors.text },
  categorySub: { fontFamily: 'Ubuntu-Regular', fontSize: 12, color: '#AAA', marginTop: 4 },
  timerBanner: { backgroundColor: Colors.primary, margin: 25, borderRadius: 22, padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { fontFamily: 'Archivo-Black', color: Colors.white, fontSize: 18 },
  bannerSub: { fontFamily: 'Ubuntu-Regular', color: Colors.white, opacity: 0.9, marginTop: 4 },
});