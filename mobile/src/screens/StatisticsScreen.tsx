import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { getSummary, getCategoryStats, SummaryResult, CategoryStatResult } from '../services/statisticsService';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [summaryRes, categoryRes] = await Promise.all([
        getSummary({ period: 'month' }),
        getCategoryStats({ type: 'expense', period: 'month' })
      ]);
      setSummary(summaryRes.data);
      setCategoryStats(categoryRes.data.categories);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatAmount = (amount: number) => `$${(amount / 100).toFixed(2)}`;
  const totalExpense = categoryStats.reduce((sum, c) => sum + c.amount, 0);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Statistics</Text>
      
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#52c41a' }]}>{formatAmount(summary?.income || 0)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Expense</Text>
            <Text style={[styles.summaryValue, { color: '#f5222d' }]}>{formatAmount(summary?.expense || 0)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Expense by Category</Text>
      {categoryStats.length === 0 ? (
        <Text style={styles.empty}>No expense data</Text>
      ) : (
        categoryStats.map(cat => (
          <View key={cat.categoryId} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <View style={[styles.colorDot, { backgroundColor: cat.categoryColor }]} />
              <Text style={styles.categoryName}>{cat.categoryName}</Text>
              <Text style={styles.categoryAmount}>{formatAmount(cat.amount)}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(cat.amount / totalExpense) * 100}%`, backgroundColor: cat.categoryColor }]} />
            </View>
            <Text style={styles.percentage}>{((cat.amount / totalExpense) * 100).toFixed(1)}%</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  summaryCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
  categoryItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  categoryName: { flex: 1, fontSize: 16 },
  categoryAmount: { fontSize: 16, fontWeight: 'bold' },
  progressBar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  percentage: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
});
