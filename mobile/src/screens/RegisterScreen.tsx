import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../theme/colors';

const INSFORGE_BASE_URL = 'https://y758dmj4.us-east.insforge.app';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 直接使用 InsForge 注册（InsForge 会自动发送验证邮件）
  const handleRegister = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('提示', '请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      Alert.alert('提示', '请输入密码');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      // 调用 InsForge 注册 API
      const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (response.ok && data.user) {
        // 注册成功，InsForge 会自动发送验证邮件
        Alert.alert(
          '注册成功',
          '验证邮件已发送到您的邮箱，请点击邮件中的链接完成验证后再登录。',
          [{ text: '去登录', onPress: () => navigation.navigate('Login') }]
        );
      } else if (data.error === 'AUTH_USER_EXISTS') {
        Alert.alert('提示', '该邮箱已被注册，请直接登录或使用其他邮箱');
      } else {
        Alert.alert('错误', data.message || '注册失败，请稍后重试');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>✨</Text>
          </View>
          <Text style={styles.title}>创建账号</Text>
          <Text style={styles.subtitle}>注册后会收到验证邮件</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📧</Text>
            <TextInput
              style={styles.input}
              placeholder="邮箱地址"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="密码（至少6位）"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔐</Text>
            <TextInput
              style={styles.input}
              placeholder="确认密码"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>注 册</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>已有账号？</Text>
            <Text style={styles.linkHighlight}>立即登录</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    height: '35%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  formContainer: {
    flex: 1,
    marginTop: -50,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkHighlight: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
