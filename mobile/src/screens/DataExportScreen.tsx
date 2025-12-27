import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../contexts/ThemeContext';
import { exportTransactions } from '../services/profileService';

export default function DataExportScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [exportResult, setExportResult] = useState<{ count: number; filename: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await exportTransactions();
      const { csv, filename, count } = response.data;

      // 保存到临时文件
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      setExportResult({ count, filename });

      // 检查是否支持分享
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: '导出交易记录',
        });
      } else {
        Alert.alert('导出成功', `已导出 ${count} 条记录到 ${filename}`);
      }
    } catch (error: any) {
      if (error.message?.includes('NO_DATA')) {
        Alert.alert('提示', '暂无交易记录可导出');
      } else {
        Alert.alert('导出失败', error.message || '请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📤</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>导出交易记录</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            将所有交易记录导出为 CSV 文件，{'\n'}
            可用于备份或在 Excel 中分析
          </Text>

          <View style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>导出内容包括：</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              • 交易日期{'\n'}
              • 交易类型（收入/支出）{'\n'}
              • 金额{'\n'}
              • 分类{'\n'}
              • 账户{'\n'}
              • 备注
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleExport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>开始导出</Text>
            )}
          </TouchableOpacity>

          {exportResult && (
            <Text style={[styles.result, { color: colors.success }]}>
              ✓ 已成功导出 {exportResult.count} 条记录
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});
