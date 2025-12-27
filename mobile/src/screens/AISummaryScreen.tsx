import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { getMonthlySummary, MonthlySummaryResponse } from '../services/aiService';
import colors from '../theme/colors';

export default function AISummaryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryData, setSummaryData] = useState<MonthlySummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchSummary = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const response = await getMonthlySummary(selectedYear, selectedMonth);
      setSummaryData(response.data);
    } catch (err: any) {
      console.error('Summary error:', err);
      setError(err.response?.data?.error?.message || '获取总结失败，请稍后再试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary(false);
  };

  const formatAmount = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI 财务总结</Text>
        <Text style={styles.headerSubtitle}>智能分析你的收支情况</Text>
      </View>

      {/* 月份选择器 */}
      <View style={styles.selector}>
        <View style={styles.yearSelector}>
          {years.map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={[styles.yearText, selectedYear === year && styles.yearTextActive]}>
                {year}年
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {months.map(month => (
            <TouchableOpacity
              key={month}
              style={[styles.monthButton, selectedMonth === month && styles.monthButtonActive]}
              onPress={() => setSelectedMonth(month)}
            >
              <Text style={[styles.monthText, selectedMonth === month && styles.monthTextActive]}>
                {month}月
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>AI 正在分析你的财务数据...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>😔</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchSummary()}>
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : summaryData ? (
          <>
            {/* 统计卡片 */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>
                {selectedYear}年{selectedMonth}月 收支概览
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>收入</Text>
                  <Text style={[styles.statValue, { color: colors.success }]}>
                    {formatAmount(summaryData.stats.totalIncome)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>支出</Text>
                  <Text style={[styles.statValue, { color: colors.danger }]}>
                    {formatAmount(summaryData.stats.totalExpense)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>结余</Text>
                  <Text style={[styles.statValue, { color: summaryData.stats.balance >= 0 ? colors.success : colors.danger }]}>
                    {formatAmount(summaryData.stats.balance)}
                  </Text>
                </View>
              </View>
              <Text style={styles.transactionCount}>
                共 {summaryData.stats.transactionCount} 笔交易
              </Text>
            </View>

            {/* AI 分析报告 */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryIcon}>🤖</Text>
                <Text style={styles.summaryTitle}>AI 分析报告</Text>
              </View>
              <Text style={styles.summaryText}>{summaryData.summary}</Text>
            </View>

            {/* 消费排行 */}
            {summaryData.stats.topCategories && summaryData.stats.topCategories.length > 0 && (
              <View style={styles.rankCard}>
                <Text style={styles.rankTitle}>💰 消费排行</Text>
                {summaryData.stats.topCategories.map((cat, index) => (
                  <View key={index} style={styles.rankItem}>
                    <View style={styles.rankLeft}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                      <Text style={styles.rankName}>{cat.categoryName}</Text>
                    </View>
                    <View style={styles.rankRight}>
                      <Text style={styles.rankAmount}>{formatAmount(cat.amount)}</Text>
                      <Text style={styles.rankPercent}>{cat.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  selector: {
    padding: 16,
  },
  yearSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  yearButtonActive: {
    backgroundColor: colors.primary,
  },
  yearText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  yearTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  monthScroll: {
    flexDirection: 'row',
  },
  monthButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.surface,
  },
  monthButtonActive: {
    backgroundColor: colors.primary,
  },
  monthText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  monthTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  rankCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  rankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  rankName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rankPercent: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
