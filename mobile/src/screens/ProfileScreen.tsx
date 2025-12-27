import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserStats, UserStats } from '../services/profileService';

const AVATAR_STORAGE_KEY = '@user_avatar_base64';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const loadAvatarUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      if (savedUrl) {
        setAvatarUrl(savedUrl);
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  // 页面聚焦时刷新数据
  useFocusEffect(
    useCallback(() => {
      fetchStats();
      loadAvatarUrl();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), loadAvatarUrl()]);
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleMenuPress = (screen: string) => {
    navigation.navigate(screen);
  };

  const menuItems = [
    { icon: '⚙️', title: '设置', subtitle: '账户与偏好设置', screen: 'Settings' },
    { icon: '🔒', title: '隐私', subtitle: '数据安全与隐私', action: 'privacy' },
    { icon: '❓', title: '帮助与支持', subtitle: '常见问题与反馈', action: 'help' },
  ];

  const handleAction = (action: string) => {
    switch (action) {
      case 'privacy':
        Alert.alert('隐私政策', '我们重视您的隐私安全，所有数据均加密存储在云端。');
        break;
      case 'help':
        Alert.alert('帮助与支持', '如有问题，请联系我们：\n\n邮箱：support@smartaccounting.com');
        break;
    }
  };

  const initials = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => navigation.navigate('AvatarSetting')}
          activeOpacity={0.8}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>✏️</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>普通会员</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats?.recordingDays || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>记账天数</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats?.transactionCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>交易笔数</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats?.accountCount || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>账户数量</Text>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surface }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                { borderBottomColor: colors.borderLight },
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => item.screen ? handleMenuPress(item.screen) : handleAction(item.action!)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.surface }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={[styles.signOutText, { color: colors.danger }]}>退出登录</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>版本 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
  },
  menuSection: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  menuArrow: {
    fontSize: 24,
  },
  signOutButton: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});
