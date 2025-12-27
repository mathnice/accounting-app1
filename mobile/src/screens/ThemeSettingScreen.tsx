import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';

interface ThemeOption {
  mode: ThemeMode;
  icon: string;
  title: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    mode: 'light',
    icon: '☀️',
    title: '浅色模式',
    description: '明亮的界面，适合白天使用',
  },
  {
    mode: 'dark',
    icon: '🌙',
    title: '深色模式',
    description: '暗色界面，保护眼睛',
  },
  {
    mode: 'system',
    icon: '📱',
    title: '跟随系统',
    description: '自动跟随系统设置切换',
  },
];

export default function ThemeSettingScreen() {
  const { theme, setTheme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                { borderBottomColor: colors.borderLight },
                index === themeOptions.length - 1 && styles.lastOption,
              ]}
              activeOpacity={0.7}
              onPress={() => setTheme(option.mode)}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.icon}>{option.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{option.title}</Text>
                <Text style={[styles.description, { color: colors.textMuted }]}>{option.description}</Text>
              </View>
              <View style={[
                styles.radio,
                { borderColor: theme === option.mode ? colors.primary : colors.border },
              ]}>
                {theme === option.mode && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, { color: colors.textMuted }]}>
          选择后立即生效，设置会自动保存
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
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});
