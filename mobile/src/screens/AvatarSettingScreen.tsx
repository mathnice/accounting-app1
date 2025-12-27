import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { uploadAvatar } from '../services/profileService';
import { compressImage } from '../utils/imageUtils';

const AVATAR_STORAGE_KEY = '@user_avatar_url';

export default function AvatarSettingScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedAvatar();
  }, []);

  const loadSavedAvatar = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedUrl) {
        setAvatarUrl(savedUrl);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const showImageOptions = () => {
    Alert.alert('选择头像', '请选择获取头像的方式', [
      { text: '取消', style: 'cancel' },
      { text: '拍照', onPress: takePhoto },
      { text: '从相册选择', onPress: pickImage },
    ]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('权限不足', '需要相机权限才能拍照');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('权限不足', '需要相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  const handleImageSelected = async (uri: string) => {
    setLoading(true);
    try {
      // 压缩图片
      const compressedBase64 = await compressImage(uri);
      
      // 上传头像
      const response = await uploadAvatar(compressedBase64);
      const newAvatarUrl = response.data.avatarUrl;
      setAvatarUrl(newAvatarUrl);
      
      // 保存到本地存储
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, newAvatarUrl);
      
      Alert.alert('成功', '头像更新成功');
    } catch (error: any) {
      Alert.alert('上传失败', error.message || '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const displayAvatar = avatarUrl || null;
  const initials = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.avatarContainer, { backgroundColor: colors.surface }]}
          onPress={showImageOptions}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          点击头像更换
        </Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>头像要求</Text>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            • 支持 JPG、PNG 格式{'\n'}
            • 图片会自动压缩到 500KB 以下{'\n'}
            • 建议使用正方形图片
          </Text>
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
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 18,
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
  },
  infoCard: {
    marginTop: 40,
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
