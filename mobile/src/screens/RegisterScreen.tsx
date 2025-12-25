import React, { useState, useEffect } from 'react';
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
import colors from '../theme/colors';

const INSFORGE_BASE_URL = 'https://y758dmj4.us-east.insforge.app';
const BACKEND_URL = 'http://10.135.41.241:3000'; // 后端API地址

export default function RegisterScreen({ navigation }: any) {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('提示', '请输入有效的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/verification/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('成功', '验证码已发送，请查收邮件');
        setCountdown(60);
        setStep('verify');
      } else if (response.status === 429) {
        Alert.alert('提示', data.message || '请稍后再试');
        if (data.waitSeconds) {
          setCountdown(data.waitSeconds);
        }
      } else {
        Alert.alert('错误', data.message || '发送失败，请稍后重试');
      }
    } catch (error) {
      console.error('Send code error:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 验证并注册
  const handleRegister = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
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
      // 先验证验证码
      const verifyResponse = await fetch(`${BACKEND_URL}/api/verification/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        Alert.alert('错误', verifyData.message || '验证码错误');
        setLoading(false);
        return;
      }

      // 验证码正确，调用InsForge注册
      const registerResponse = await fetch(`${INSFORGE_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await registerResponse.text();
      let registerData;
      try {
        registerData = JSON.parse(text);
      } catch {
        console.error('Response is not JSON:', text);
        Alert.alert('错误', '服务器响应异常');
        setLoading(false);
        return;
      }

      if (registerResponse.ok) {
        Alert.alert('成功', '注册成功！', [
          { text: '去登录', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('错误', registerData.message || '注册失败，邮箱可能已被使用');
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  // 输入邮箱步骤
  const renderInputStep = () => (
    <>
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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendCode}
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
            <Text style={styles.buttonText}>获取验证码</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  // 验证码和密码步骤
  const renderVerifyStep = () => (
    <>
      <View style={styles.emailDisplay}>
        <Text style={styles.emailLabel}>验证邮箱</Text>
        <Text style={styles.emailValue}>{email}</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🔢</Text>
        <TextInput
          style={styles.input}
          placeholder="6位验证码"
          placeholderTextColor={colors.textMuted}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity
          style={[styles.resendBtn, countdown > 0 && styles.resendBtnDisabled]}
          onPress={handleSendCode}
          disabled={countdown > 0 || loading}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
            {countdown > 0 ? `${countdown}s` : '重发'}
          </Text>
        </TouchableOpacity>
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

      <TouchableOpacity style={styles.backBtn} onPress={() => setStep('input')}>
        <Text style={styles.backText}>← 返回修改邮箱</Text>
      </TouchableOpacity>
    </>
  );

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
            <Text style={styles.logoIcon}>{step === 'input' ? '✨' : '🔐'}</Text>
          </View>
          <Text style={styles.title}>
            {step === 'input' ? '创建账号' : '完成注册'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'input' ? '输入邮箱获取验证码' : '输入验证码和密码'}
          </Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
          {step === 'input' ? renderInputStep() : renderVerifyStep()}

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
  emailDisplay: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  emailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
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
  resendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  resendBtnDisabled: {
    backgroundColor: colors.border,
  },
  resendText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  resendTextDisabled: {
    color: colors.textMuted,
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
  backBtn: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 14,
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
