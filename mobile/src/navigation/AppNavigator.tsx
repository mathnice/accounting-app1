import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';
import AISummaryScreen from '../screens/AISummaryScreen';
import SmartBookingScreen from '../screens/SmartBookingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AvatarSettingScreen from '../screens/AvatarSettingScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ThemeSettingScreen from '../screens/ThemeSettingScreen';
import CurrencySettingScreen from '../screens/CurrencySettingScreen';
import DataExportScreen from '../screens/DataExportScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component with emoji
const TabIcon = ({ name, focused, colors }: { name: string; focused: boolean; colors: any }) => {
  const icons: Record<string, { icon: string; label: string }> = {
    Home: { icon: '🏠', label: '首页' },
    Transactions: { icon: '📝', label: '记账' },
    Statistics: { icon: '📊', label: '统计' },
    Accounts: { icon: '💳', label: '账户' },
    Profile: { icon: '👤', label: '我的' },
  };

  const item = icons[name] || { icon: '○', label: name };

  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {item.icon}
      </Text>
    </View>
  );
};

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} colors={colors} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { backgroundColor: colors.surface }],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarLabel: '记账' }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ tabBarLabel: '统计' }} />
      <Tab.Screen name="Accounts" component={AccountsScreen} options={{ tabBarLabel: '账户' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '我的' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: true, title: 'AI 助手' }} />
            <Stack.Screen name="AISummary" component={AISummaryScreen} options={{ headerShown: true, title: 'AI 总结' }} />
            <Stack.Screen name="SmartBooking" component={SmartBookingScreen} options={{ headerShown: true, title: '智能记账' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: '设置' }} />
            <Stack.Screen name="AvatarSetting" component={AvatarSettingScreen} options={{ headerShown: true, title: '更换头像' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: true, title: '修改密码' }} />
            <Stack.Screen name="ThemeSetting" component={ThemeSettingScreen} options={{ headerShown: true, title: '主题设置' }} />
            <Stack.Screen name="CurrencySetting" component={CurrencySettingScreen} options={{ headerShown: true, title: '货币设置' }} />
            <Stack.Screen name="DataExport" component={DataExportScreen} options={{ headerShown: true, title: '数据导出' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true, title: '关于' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabBarItem: {
    paddingTop: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});
