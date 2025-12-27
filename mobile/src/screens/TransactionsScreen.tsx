import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  Transaction,
  TransactionType,
  PaymentMethod,
} from '../services/transactionService';
import { getCategories, Category, initializeCategories } from '../services/categoryService';
import { getAccounts, Account, initializeAccounts } from '../services/accountService';
import { useCurrency } from '../contexts/CurrencyContext';
import colors from '../theme/colors';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');
  const [note, setNote] = useState('');
  const { formatAmount } = useCurrency();

  const fetchData = async () => {
    try {
      console.log('[TransactionsScreen] Starting to fetch data...');
      
      // Initialize default data first
      try {
        await initializeCategories();
        console.log('[TransactionsScreen] Categories initialized');
      } catch (e) {
        console.log('[TransactionsScreen] Initialize categories error:', e);
      }
      
      try {
        await initializeAccounts();
        console.log('[TransactionsScreen] Accounts initialized');
      } catch (e) {
        console.log('[TransactionsScreen] Initialize accounts error:', e);
      }
      
      // Fetch data
      const [txRes, catRes, accRes] = await Promise.all([
        getTransactions({ page: 1, limit: 50 }),
        getCategories(),
        getAccounts(),
      ]);
      
      console.log('[TransactionsScreen] Categories loaded:', catRes?.data?.categories?.length || 0);
      console.log('[TransactionsScreen] Accounts loaded:', accRes?.data?.accounts?.length || 0);
      console.log('[TransactionsScreen] Transactions loaded:', txRes?.data?.transactions?.length || 0);
      
      setTransactions(txRes?.data?.transactions || []);
      setCategories(catRes?.data?.categories || []);
      setAccounts(accRes?.data?.accounts || []);
    } catch (error: any) {
      console.error('[TransactionsScreen] Error fetching data:', error?.response?.status, error?.message);
      if (error?.response?.status === 401) {
        Alert.alert('错误', '登录已过期，请重新登录');
      } else {
        Alert.alert('错误', '加载数据失败，请检查网络连接');
      }
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

  const handleAdd = async () => {
    if (!amount || !categoryId || !accountId) {
      Alert.alert('提示', '请填写所有必填项');
      return;
    }
    try {
      await createTransaction({
        type,
        amount: Math.round(parseFloat(amount) * 100),
        categoryId,
        accountId,
        date: new Date().toISOString(),
        paymentMethod,
        note,
      });
      setModalVisible(false);
      setAmount('');
      setNote('');
      fetchData();
    } catch (error) {
      Alert.alert('错误', '添加交易失败');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('删除确认', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(id);
          fetchData();
        },
      },
    ]);
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      餐饮: '🍜',
      交通: '🚗',
      购物: '🛒',
      娱乐: '🎮',
      医疗: '💊',
      教育: '📚',
      住房: '🏠',
      工资: '💰',
      奖金: '🎁',
      投资: '📈',
    };
    return icons[categoryName] || '💳';
  };

  const renderItem = ({ item }: { item: Transaction }) => {
    const categoryName = typeof item.categoryId === 'object' ? item.categoryId.name : '-';
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onLongPress={() => handleDelete(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionEmoji}>{getCategoryIcon(categoryName)}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCategory}>{categoryName}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.date).toLocaleDateString('zh-CN')}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? colors.success : colors.danger },
          ]}
        >
          {item.type === 'income' ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>交易记录</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ 添加</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>暂无交易记录</Text>
            <Text style={styles.emptyHint}>点击上方按钮添加第一笔记录</Text>
          </View>
        }
      />

      {/* Manual Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>新增交易</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'expense' && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    setType('expense');
                    setCategoryId('');
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'expense' && styles.typeButtonTextActive,
                    ]}
                  >
                    支出
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'income' && styles.typeButtonActiveIncome,
                  ]}
                  onPress={() => {
                    setType('income');
                    setCategoryId('');
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'income' && styles.typeButtonTextActive,
                    ]}
                  >
                    收入
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>金额</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>分类 ({filteredCategories.length}个)</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  selectedValue={categoryId} 
                  onValueChange={setCategoryId}
                  style={styles.picker}
                  dropdownIconColor={colors.textPrimary}
                >
                  <Picker.Item label="选择分类" value="" color={colors.textMuted} />
                  {filteredCategories.map((c) => (
                    <Picker.Item key={c._id} label={c.name} value={c._id} color={colors.textPrimary} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>账户 ({accounts.length}个)</Text>
              <View style={styles.pickerWrapper}>
                <Picker 
                  selectedValue={accountId} 
                  onValueChange={setAccountId}
                  style={styles.picker}
                  dropdownIconColor={colors.textPrimary}
                >
                  <Picker.Item label="选择账户" value="" color={colors.textMuted} />
                  {accounts.map((a) => (
                    <Picker.Item key={a._id} label={a.name} value={a._id} color={colors.textPrimary} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.inputLabel}>支付方式</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <Picker.Item label="微信" value="wechat" />
                  <Picker.Item label="支付宝" value="alipay" />
                  <Picker.Item label="现金" value="cash" />
                  <Picker.Item label="银行卡" value="bank" />
                </Picker>
              </View>

              <Text style={styles.inputLabel}>备注</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="添加备注（可选）"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.saveButtonText}>保存</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.textWhite,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionEmoji: {
    fontSize: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textMuted,
    padding: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.danger,
  },
  typeButtonActiveIncome: {
    backgroundColor: colors.success,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.textWhite,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  amountInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  pickerWrapper: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 50,
  },
  picker: {
    color: colors.textPrimary,
    backgroundColor: 'transparent',
  },
  noteInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textWhite,
  },
});
