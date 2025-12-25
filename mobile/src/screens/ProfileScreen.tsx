import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import colors from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleMenuPress = (title: string) => {
    switch (title) {
      case '设置':
        Alert.alert('设置', '账户设置功能正在开发中');
        break;
      case '通知':
        Alert.alert('通知', '暂无新消息');
        break;
      case '隐私':
        Alert.alert('隐私政策', '我们重视您的隐私安全，所有数据均加密存储在本地和云端。');
        break;
      case '帮助与支持':
        Alert.alert(
          '帮助与支持',
          '如有问题，请联系我们：\n\n邮箱：support@smartaccounting.com',
          [
            { text: '取消', style: 'cancel' },
            { text: '发送邮件', onPress: () => Linking.openURL('mailto:support@smartaccounting.com') },
          ]
        );
        break;
      case '关于':
        Alert.alert(
          '关于智能记账',
          '版本：1.0.0\n\n智能记账是一款支持AI语音和图像识别的记账应用，帮助您轻松管理个人财务。\n\n© 2024 Smart Accounting'
        );
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { icon: '⚙️', title: '设置', subtitle: '账户与偏好设置' },
    { icon: '🔔', title: '通知', subtitle: '消息与提醒' },
    { icon: '🔒', title: '隐私', subtitle: '数据安全与隐私' },
    { icon: '❓', title: '帮助与支持', subtitle: '常见问题与反馈' },
    { icon: 'ℹ️', title: '关于', subtitle: '版本信息' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>普通会员</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>30</Text>
            <Text style={styles.statLabel}>记账天数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>128</Text>
            <Text style={styles.statLabel}>交易笔数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>账户数量</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.title)}
            >
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={styles.version}>版本 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: colors.textWhite,
    fontSize: 36,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: colors.textWhite,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: 12,
  },
  content: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  statsCard: {
    backgroundColor: colors.surface,
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
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  menuSection: {
    backgroundColor: colors.surface,
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
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  signOutButton: {
    backgroundColor: colors.surface,
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
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
});
