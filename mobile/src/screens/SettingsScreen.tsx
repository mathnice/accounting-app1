import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

interface SettingItem {
  icon: string;
  title: string;
  subtitle: string;
  value?: string;
  screen?: string;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { theme, colors } = useTheme();

  const themeLabels: Record<string, string> = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  };

  const settingItems: SettingItem[] = [
    {
      icon: '🖼️',
      title: '头像设置',
      subtitle: '更换个人头像',
      screen: 'AvatarSetting',
    },
    {
      icon: '🎨',
      title: '主题设置',
      subtitle: '切换浅色/深色模式',
      value: themeLabels[theme],
      screen: 'ThemeSetting',
    },
    {
      icon: '📤',
      title: '数据导出',
      subtitle: '导出交易记录为 CSV',
      screen: 'DataExport',
    },
    {
      icon: 'ℹ️',
      title: '关于',
      subtitle: '版本信息与更新',
      screen: 'About',
    },
  ];

  const handlePress = (item: SettingItem) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar barStyle={colors.background === '#0F172A' ? 'light-content' : 'dark-content'} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {settingItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                { borderBottomColor: colors.borderLight },
                index === settingItems.length - 1 && styles.lastItem,
              ]}
              activeOpacity={0.7}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
              </View>
              <View style={styles.rightContainer}>
                {item.value && (
                  <Text style={[styles.value, { color: colors.textSecondary }]}>{item.value}</Text>
                )}
                <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  section: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    marginRight: 8,
  },
  arrow: {
    fontSize: 24,
  },
});
