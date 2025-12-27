import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { smartBookingText, smartBookingImage, SmartBookingResult } from '../services/aiService';
import { createTransaction } from '../services/transactionService';
import colors from '../theme/colors';

export default function SmartBookingScreen() {
  const navigation = useNavigation<any>();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartBookingResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 文字识别
  const handleTextRecognition = async () => {
    if (!text.trim()) {
      Alert.alert('提示', '请输入记账描述');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await smartBookingText(text.trim());
      setResult(res.data);
    } catch (error: any) {
      Alert.alert('识别失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 选择图片
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要相册访问权限');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      handleImageRecognition(result.assets[0].base64);
    }
  };

  // 拍照
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('权限不足', '需要相机访问权限');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setSelectedImage(result.assets[0].uri);
      handleImageRecognition(result.assets[0].base64);
    }
  };

  // 图片识别
  const handleImageRecognition = async (base64: string) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await smartBookingImage(base64);
      setResult(res.data);
    } catch (error: any) {
      Alert.alert('识别失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 确认记账
  const handleConfirm = async () => {
    if (!result || result.amount === null) {
      Alert.alert('提示', '请先识别记账信息');
      return;
    }
    if (!result.categoryId) {
      Alert.alert('提示', '未能匹配到分类，请手动选择');
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        type: result.type,
        amount: result.amount,
        categoryId: result.categoryId,
        accountId: result.accountId || '',
        date: result.date || new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        note: result.note,
      });
      Alert.alert('成功', '记账成功！', [
        { text: '继续记账', onPress: () => { setResult(null); setText(''); setSelectedImage(null); } },
        { text: '查看账单', onPress: () => navigation.navigate('Transactions') },
      ]);
    } catch (error: any) {
      Alert.alert('记账失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 文字输入区 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 文字记账</Text>
            <Text style={styles.hint}>输入自然语言描述，如"今天午餐花了35元"</Text>
            <TextInput
              style={styles.textInput}
              placeholder="描述您的收支..."
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handleTextRecognition}
              disabled={loading}
            >
              <Text style={styles.buttonText}>🔍 识别</Text>
            </TouchableOpacity>
          </View>

          {/* 图片识别区 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 图片记账</Text>
            <Text style={styles.hint}>拍照或上传小票、账单、发票</Text>
            <View style={styles.imageButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, styles.halfButton]} 
                onPress={takePhoto}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>📸 拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, styles.halfButton]} 
                onPress={pickImage}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>🖼️ 相册</Text>
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}
          </View>

          {/* 加载状态 */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>AI 正在识别中...</Text>
            </View>
          )}

          {/* 识别结果 */}
          {result && !loading && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionTitle}>✨ 识别结果</Text>
              <View style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>类型</Text>
                  <Text style={[styles.resultValue, { color: result.type === 'income' ? colors.success : colors.danger }]}>
                    {result.type === 'income' ? '收入' : '支出'}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>金额</Text>
                  <Text style={styles.resultValue}>
                    {result.amount !== null ? formatAmount(result.amount) : '未识别'}
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>分类</Text>
                  <Text style={styles.resultValue}>{result.categoryName}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>备注</Text>
                  <Text style={styles.resultValue}>{result.note || '-'}</Text>
                </View>
                {result.date && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>日期</Text>
                    <Text style={styles.resultValue}>{result.date}</Text>
                  </View>
                )}
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>置信度</Text>
                  <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(0)}%</Text>
                </View>
                {result.items && result.items.length > 0 && (
                  <View style={styles.itemsContainer}>
                    <Text style={styles.resultLabel}>商品明细</Text>
                    {result.items.map((item, index) => (
                      <Text key={index} style={styles.itemText}>
                        • {item.name}: {formatAmount(item.price)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]} 
                onPress={handleConfirm}
                disabled={loading || result.amount === null}
              >
                <Text style={styles.buttonText}>✅ 确认记账</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  button: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.success,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'contain',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemsContainer: {
    marginTop: 12,
  },
  itemText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
