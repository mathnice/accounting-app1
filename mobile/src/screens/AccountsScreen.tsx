import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import { getAccounts, createAccount, initializeAccounts, Account } from '../services/accountService';

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const fetchData = async () => {
    try {
      await initializeAccounts();
      const res = await getAccounts();
      setAccounts(res.data.accounts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAdd = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter account name');
      return;
    }
    try {
      await createAccount({ name, initialBalance: Math.round(parseFloat(balance || '0') * 100) });
      setModalVisible(false);
      setName(''); setBalance('');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add account');
    }
  };

  const renderItem = ({ item }: { item: Account }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
      </View>
      <Text style={styles.itemBalance}>${(item.currentBalance / 100).toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={accounts} renderItem={renderItem} keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No accounts yet</Text>} />
      
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Account</Text>
            <Text style={styles.label}>Account Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Savings" value={name} onChangeText={setName} />
            <Text style={styles.label}>Initial Balance</Text>
            <TextInput style={styles.input} placeholder="0.00" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#1890ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginTop: 8, borderRadius: 8 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 16, fontWeight: '500' },
  defaultBadge: { backgroundColor: '#e6f7ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  defaultText: { color: '#1890ff', fontSize: 12 },
  itemBalance: { fontSize: 18, fontWeight: 'bold', color: '#1890ff' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, color: '#666', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelBtn: { flex: 1, padding: 15, alignItems: 'center', marginRight: 8, backgroundColor: '#f5f5f5', borderRadius: 8 },
  saveBtn: { flex: 1, padding: 15, alignItems: 'center', marginLeft: 8, backgroundColor: '#1890ff', borderRadius: 8 },
});
