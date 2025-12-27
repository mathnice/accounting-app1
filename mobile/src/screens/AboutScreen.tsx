import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const { colors } = useTheme();
  const [checking, setChecking] = useState(false);

  // 获取版本信息
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || 
                      Constants.expoConfig?.android?.versionCode || 
                      '1';

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      // 模拟检查更新（实际可以调用远程 API）
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 这里可以替换为实际的版本检查逻辑
      Alert.alert('检查完成', '当前已是最新版本');
    } catch (error) {
      Alert.alert('检查失败', '请稍后重试');
    } finally {
      setChecking(false);
    }
  };

  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/mathnice/accounting-app1');
  };

  const handleOpenExpo = () => {
    Linking.openURL('https://expo.dev/@chennice/smart-accounting');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        {/* App 信息 */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>📊</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>智能记账</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>
            版本 {appVersion} (Build {buildNumber})
          </Text>
          
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.primary }]}
            onPress={handleCheckUpdate}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>检查更新</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 链接 */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.linkItem, { borderBottomColor: colors.borderLight }]}
            onPress={handleOpenGitHub}
          >
            <Text style={styles.linkIcon}>📦</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>GitHub 仓库</Text>
            <Text style={[styles.linkArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.linkItem}
            onPress={handleOpenExpo}
          >
            <Text style={styles.linkIcon}>📱</Text>
            <Text style={[styles.linkText, { color: colors.textPrimary }]}>Expo 项目</Text>
            <Text style={[styles.linkArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 版权信息 */}
        <Text style={[styles.copyright, { color: colors.textMuted }]}>
          © 2024-2025 Smart Accounting{'\n'}
          All rights reserved
        </Text>
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
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    fontSize: 64,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    marginBottom: 20,
  },
  updateButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    width: '100%',
    borderBottomWidth: 1,
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
  },
  linkArrow: {
    fontSize: 24,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 24,
  },
});
