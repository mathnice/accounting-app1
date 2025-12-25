import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { getSummary, SummaryResult } from '../services/statisticsService';
import { initializeCategories } from '../services/categoryService';
import { initializeAccounts } from '../services/accountService';
import colors from '../theme/colors';

export default function HomeScreen() {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    try {
      await Promise.all([initializeCategories(), initializeAccounts()]);
      const res = await getSummary({ period: 'month' });
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatAmount = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.headerTitle}>本月概览</Text>
        </View>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>本月结余</Text>
          <Text style={[
            styles.balanceValue,
            { color: (summary?.balance || 0) >= 0 ? colors.success : colors.danger }
          ]}>
            {formatAmount(summary?.balance || 0)}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📈</Text>
            </View>
            <Text style={styles.statLabel}>收入</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatAmount(summary?.income || 0)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.expenseCard]}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📉</Text>
            </View>
            <Text style={styles.statLabel}>支出</Text>
            <Text style={[styles.statValue, { color: colors.danger }]}>
              {formatAmount(summary?.expense || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Text style={styles.tipsIcon}>💡</Text>
            <Text style={styles.tipsTitle}>理财小贴士</Text>
          </View>
          <Text style={styles.tipsText}>
            建议将每月收入的20%存入储蓄账户，养成良好的储蓄习惯。
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>快捷功能</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Transactions')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Text style={styles.actionEmoji}>📝</Text>
              </View>
              <Text style={styles.actionText}>记一笔</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Transactions')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.actionEmoji}>📋</Text>
              </View>
              <Text style={styles.actionText}>账单明细</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Statistics')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionText}>统计分析</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('预算管理', '该功能正在开发中，敬请期待！')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FCE7F3' }]}>
                <Text style={styles.actionEmoji}>🎯</Text>
              </View>
              <Text style={styles.actionText}>预算管理</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  incomeCard: {
    borderTopWidth: 3,
    borderTopColor: colors.success,
  },
  expenseCard: {
    borderTopWidth: 3,
    borderTopColor: colors.danger,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tipsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
