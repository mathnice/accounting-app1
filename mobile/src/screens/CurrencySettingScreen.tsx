import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrency, CURRENCIES, CurrencyCode } from '../contexts/CurrencyContext';
import { useTheme } from '../contexts/ThemeContext';

export default function CurrencySettingScreen() {
  const { currency, setCurrency } = useCurrency();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {CURRENCIES.map((item, index) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.option,
                { borderBottomColor: colors.borderLight },
                index === CURRENCIES.length - 1 && styles.lastOption,
              ]}
              activeOpacity={0.7}
              onPress={() => setCurrency(item.code as CurrencyCode)}
            >
              <View style={[styles.symbolContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.symbol, { color: colors.primary }]}>{item.symbol}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.name, { color: colors.textPrimary }]}>{item.nameCN}</Text>
                <Text style={[styles.code, { color: colors.textMuted }]}>{item.code} - {item.name}</Text>
              </View>
              <View style={[
                styles.radio,
                { borderColor: currency === item.code ? colors.primary : colors.border },
              ]}>
                {currency === item.code && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, { color: colors.textMuted }]}>
          选择后，所有金额将以该货币符号显示
        </Text>
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
  symbolContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  symbol: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  code: {
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
