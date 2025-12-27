import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { requestPasswordOTP, changePassword } from '../services/profileService';

type Step = 'request' | 'verify';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [step, setStep] = useState<Step>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      await requestPasswordOTP();
      Alert.alert('发送成功', '验证码已发送到您的邮箱，请查收');
      setStep('verify');
      startCountdown();
    } catch (error: any) {
      Alert.alert('发送失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (!otp.trim()) {
      Alert.alert('提示', '请输入验证码');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('提示', '密码长度至少8位');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('提示', '两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await changePassword(otp, newPassword);
      Alert.alert('成功', '密码修改成功', [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('修改失败', error.message || '请检查验证码是否正确');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              验证码将发送到：{user?.email}
            </Text>

            {step === 'request' ? (
              <>
                <Text style={[styles.description, { color: colors.textMuted }]}>
                  点击下方按钮，我们将向您的邮箱发送验证码
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleRequestOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>发送验证码</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>验证码</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.textPrimary }]}
                    placeholder="请输入邮箱验证码"
                    placeholderTextColor={colors.textMuted}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {countdown > 0 ? (
                    <Text style={[styles.countdown, { color: colors.textMuted }]}>
                      {countdown}秒后可重新发送
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleRequestOTP}>
                      <Text style={[styles.resend, { color: colors.primary }]}>重新发送</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>新密码</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.textPrimary }]}
                    placeholder="请输入新密码（至少8位）"
                    placeholderTextColor={colors.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>确认密码</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surfaceSecondary, color: colors.textPrimary }]}
                    placeholder="请再次输入新密码"
                    placeholderTextColor={colors.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>确认修改</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  email: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  countdown: {
    fontSize: 13,
    marginTop: 8,
  },
  resend: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
