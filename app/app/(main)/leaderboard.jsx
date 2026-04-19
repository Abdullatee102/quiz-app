import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), orderBy("totalScore", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      const leaderboardData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaders(leaderboardData);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderLeader = ({ item, index }) => {
    const isTopThree = index < 3;
    const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']; 

    return (
      <View style={styles.leaderRow}>
        <View style={styles.rankContainer}>
          {isTopThree ? (
            <Ionicons name="trophy" size={20} color={rankColors[index]} />
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>

        <View style={styles.avatarContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.initialAvatar]}>
              <Text style={styles.initialText}>{item.fullName?.charAt(0) || 'S'}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.userName} numberOfLines={1}>{item.fullName || "Anonymous"}</Text>
          <Text style={styles.userRole}>Scholar</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.totalScore || 0}</Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
      </View>
    );
  };

  if (loading && leaders.length === 0) return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSub}>Top Performers of Brain Buzz</Text>
      </View>

      <FlatList
        data={leaders}
        keyExtractor={(item) => item.id}
        renderItem={renderLeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchLeaderboard}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    padding: 25, 
    backgroundColor: Colors.primary, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingBottom: 40
  },
  headerTitle: { fontFamily: 'Archivo-Black', fontSize: 28, color: '#FFF' },
  headerSub: { fontFamily: 'Ubuntu-Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  listContent: { padding: 20, paddingTop: 10 },
  leaderRow: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    padding: 15, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  rankContainer: { width: 30, alignItems: 'center' },
  rankText: { fontFamily: 'Ubuntu-Bold', color: '#888' },
  avatarContainer: { marginHorizontal: 12 },
  avatar: { width: 45, height: 45, borderRadius: 22.5 },
  initialAvatar: { backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
  initialText: { color: Colors.primary, fontFamily: 'Ubuntu-Bold' },
  infoContainer: { flex: 1 },
  userName: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: Colors.text },
  userRole: { fontFamily: 'Ubuntu-Regular', fontSize: 12, color: '#AAA' },
  scoreContainer: { alignItems: 'flex-end' },
  scoreText: { fontFamily: 'Archivo-Black', fontSize: 18, color: Colors.primary },
  scoreLabel: { fontFamily: 'Ubuntu-Regular', fontSize: 10, color: '#AAA' }
});