import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuizStore } from '../../store/quizStore';
import { Colors } from '../../constants/colors';

export default function HistoryScreen() {
  const router = useRouter();
  const { allTimeHistory } = useQuizStore();

  // Helper to format the Firebase/ISO date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryItem = ({ item }) => {
    const percentage = Math.round((item.correct / item.totalQuestions) * 100);
    
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            <Text style={styles.categoryText}>Assessment Completed</Text>
          </View>
          <View style={styles.percentageBadge}>
            <Text style={styles.percentageText}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statDetail}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={styles.statValue}>{item.score} pts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statDetail}>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={styles.statValue}>{item.correct}/{item.totalQuestions}</Text>
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptySub}>Complete a quiz to see your performance history here.</Text>
      <TouchableOpacity 
        style={styles.startBtn} 
        onPress={() => router.push('/(main)')}
      >
        <Text style={styles.startBtnText}>Start a Quiz</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz History</Text>
        <Text style={styles.headerSub}>Tracking your growth over time</Text>
      </View>

      <FlatList
        data={allTimeHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    padding: 25, 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  headerTitle: { fontFamily: 'Archivo-Black', fontSize: 26, color: Colors.text },
  headerSub: { fontFamily: 'Ubuntu-Regular', fontSize: 14, color: '#999', marginTop: 4 },
  
  listContent: { padding: 20, paddingBottom: 100 },
  
  historyCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: Colors.secondary + '20', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerInfo: { flex: 1, marginLeft: 15 },
  dateText: { fontFamily: 'Ubuntu-Regular', fontSize: 12, color: '#AAA' },
  categoryText: { fontFamily: 'Ubuntu-Bold', fontSize: 16, color: Colors.text, marginTop: 2 },
  
  percentageBadge: { 
    backgroundColor: Colors.primary + '10', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  percentageText: { fontFamily: 'Ubuntu-Bold', color: Colors.primary, fontSize: 14 },

  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#FBFBFB', 
    borderRadius: 12, 
    padding: 15 
  },
  statDetail: { flex: 1, alignItems: 'center' },
  statLabel: { fontFamily: 'Ubuntu-Regular', fontSize: 11, color: '#999', marginBottom: 4 },
  statValue: { fontFamily: 'Archivo-Black', fontSize: 16, color: Colors.text },
  statDivider: { width: 1, height: '100%', backgroundColor: '#EEE' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontFamily: 'Archivo-Black', fontSize: 20, color: '#CCC', marginTop: 20 },
  emptySub: { fontFamily: 'Ubuntu-Regular', fontSize: 14, color: '#AAA', textAlign: 'center', paddingHorizontal: 50, marginTop: 8 },
  startBtn: { 
    marginTop: 25, 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 25 
  },
  startBtnText: { color: '#FFF', fontFamily: 'Ubuntu-Bold' }
});