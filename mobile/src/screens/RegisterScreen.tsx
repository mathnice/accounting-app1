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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../theme/colors';

const INSFORGE_BASE_URL = 'https://y758dmj4.us-east.insforge.app';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 验证码相关状态
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  // 注册 - 发送验证码
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
      const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[Register] Response:', response.status, data);

      if (response.ok) {
        if (data.requireEmailVerification) {
          // 需要验证邮箱，显示验证码输入框
          setShowOtpModal(true);
          Alert.alert('验证码已发送', `验证码已发送到 ${email}，请查收邮件并输入验证码。`);
        } else if (data.accessToken) {
          Alert.alert('注册成功', '欢迎使用智能记账！', [
            { text: '开始使用', onPress: () => navigation.navigate('Login') }
          ]);
        }
      } else if (data.error === 'AUTH_USER_EXISTS') {
        Alert.alert(
          '账号已存在',
          '该邮箱已被注册。如果您还未验证邮箱，请点击"重新发送验证码"。',
          [
            { text: '去登录', onPress: () => navigation.navigate('Login') },
            { text: '重新发送验证码', onPress: () => handleResendOtp() },
            { text: '取消', style: 'cancel' }
          ]
        );
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

  // 验证 OTP 验证码
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('提示', '请输入完整的验证码');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      console.log('[Verify] Response:', response.status, data);

      if (response.ok) {
        setShowOtpModal(false);
        Alert.alert(
          '验证成功 🎉',
          '邮箱验证成功！现在可以登录了。',
          [{ text: '去登录', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('验证失败', data.message || '验证码错误或已过期，请重试');
      }
    } catch (error) {
      console.error('Verify error:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setVerifying(false);
    }
  };

  // 重新发送验证码
  const handleResendOtp = async () => {
    if (!email) {
      Alert.alert('提示', '请先输入邮箱地址');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${INSFORGE_BASE_URL}/api/auth/email/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('[Resend] Response:', response.status, data);

      if (response.ok) {
        setShowOtpModal(true);
        Alert.alert('发送成功', '新的验证码已发送到您的邮箱');
      } else {
        Alert.alert('发送失败', data.message || '无法发送验证码，请稍后重试');
      }
    } catch (error) {
      console.error('Resend error:', error);
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
          <Text style={styles.subtitle}>注册后会收到验证码</Text>
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

      {/* OTP 验证码输入弹窗 */}
      <Modal visible={showOtpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📧 输入验证码</Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>
              验证码已发送到 {email}
            </Text>

            <View style={styles.otpInputContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="请输入验证码"
                placeholderTextColor={colors.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={verifying}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>验 证</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOtp}
              disabled={loading}
            >
              <Text style={styles.resendText}>
                {loading ? '发送中...' : '重新发送验证码'}
              </Text>
            </TouchableOpacity>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  modalHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInputContainer: {
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  resendButton: {
    alignItems: 'center',
    padding: 12,
  },
  resendText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
