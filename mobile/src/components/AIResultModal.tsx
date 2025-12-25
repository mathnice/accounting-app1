import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ParsedTransaction, ImageRecognitionResult } from '../services/aiService';
import { Category, getCategories } from '../services/categoryService';
import { Account, getAccounts } from '../services/accountService';
import { createTransaction, PaymentMethod } from '../services/transactionService';

interface AIResultModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  speechResult?: ParsedTransaction | null;
  imageResult?: ImageRecognitionResult | null;
}

export default function AIResultModal({
  visible,
  onClose,
  onSuccess,
  speechResult,
  imageResult,
}: AIResultModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wechat');

  // Load categories and accounts
  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  // Populate form from AI result
  useEffect(() => {
    if (speechResult) {
      setType(speechResult.type);
      if (speechResult.amount) {
        setAmount(speechResult.amount.toString());
      }
      if (speechResult.categoryId) {
        setCategoryId(speechResult.categoryId);
      }
      setNote(speechResult.note || '');
    }
  }, [speechResult]);

  useEffect(() => {
    if (imageResult) {
      setType('expense');
      
      if (imageResult.mode === 'object' && imageResult.object) {
        setNote(imageResult.object.objectName || '');
        if (imageResult.categoryId) {
          setCategoryId(imageResult.categoryId);
        }
        // Object mode: user needs to enter amount
        setAmount('');
      } else if (imageResult.mode === 'receipt' && imageResult.receipt) {
        if (imageResult.receipt.amount) {
          setAmount(imageResult.receipt.amount.toString());
        }
        setNote(imageResult.receipt.merchantName || '');
        if (imageResult.categoryId) {
          setCategoryId(imageResult.categoryId);
        }
      }
    }
  }, [imageResult]);

  const loadData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([getCategories(), getAccounts()]);
      setCategories(catRes.data.categories);
      setAccounts(accRes.data.accounts);
      
      // Set default account
      const defaultAcc = accRes.data.accounts.find((a: Account) => a.isDefault);
      if (defaultAcc) {
        setAccountId(defaultAcc._id);
      } else if (accRes.data.accounts.length > 0) {
        setAccountId(accRes.data.accounts[0]._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('错误', '请输入有效金额');
      return;
    }
    if (!categoryId) {
      Alert.alert('错误', '请选择分类');
      return;
    }
    if (!accountId) {
      Alert.alert('错误', '请选择账户');
      return;
    }

    setLoading(true);
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
      Alert.alert('成功', '交易已创建');
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('错误', '创建交易失败');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setCategoryId('');
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const getTitle = () => {
    if (speechResult) return '语音识别结果';
    if (imageResult?.mode === 'object') return '物品识别结果';
    if (imageResult?.mode === 'receipt') return '票据识别结果';
    return 'AI 识别结果';
  };

  const getConfidence = () => {
    if (speechResult) return speechResult.confidence;
    if (imageResult?.object) return imageResult.object.confidence;
    if (imageResult?.receipt) return imageResult.receipt.confidence;
    return 0;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{getTitle()}</Text>
          
          {/* Confidence indicator */}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>识别置信度:</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${getConfidence() * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>
              {Math.round(getConfidence() * 100)}%
            </Text>
          </View>

          <ScrollView style={styles.form}>
            {/* Type selector */}
            <Text style={styles.label}>类型</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                  支出
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'income' && styles.typeBtnActive]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                  收入
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <Text style={styles.label}>金额</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            {/* Category */}
            <Text style={styles.label}>分类</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
                <Picker.Item label="选择分类" value="" />
                {filteredCategories.map((c) => (
                  <Picker.Item key={c._id} label={c.name} value={c._id} />
                ))}
              </Picker>
            </View>

            {/* Account */}
            <Text style={styles.label}>账户</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={accountId} onValueChange={setAccountId}>
                <Picker.Item label="选择账户" value="" />
                {accounts.map((a) => (
                  <Picker.Item key={a._id} label={a.name} value={a._id} />
                ))}
              </Picker>
            </View>

            {/* Payment Method */}
            <Text style={styles.label}>支付方式</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod}>
                <Picker.Item label="微信" value="wechat" />
                <Picker.Item label="支付宝" value="alipay" />
                <Picker.Item label="现金" value="cash" />
                <Picker.Item label="银行卡" value="bank" />
              </Picker>
            </View>

            {/* Note */}
            <Text style={styles.label}>备注</Text>
            <TextInput
              style={styles.input}
              placeholder="备注信息"
              value={note}
              onChangeText={setNote}
            />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitBtnText}>
                {loading ? '保存中...' : '确认保存'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#52c41a',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#52c41a',
    width: 40,
  },
  form: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#1890ff',
  },
  typeBtnText: {
    fontSize: 16,
    color: '#666',
  },
  typeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    color: '#666',
  },
  submitBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1890ff',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
