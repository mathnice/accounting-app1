import { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';
import { getAccounts, createAccount, updateAccount, deleteAccount, setDefaultAccount, Account } from '../services/accountService';

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await getAccounts();
      setAccounts(res.data.accounts);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ initialBalance: 0 });
    setModalVisible(true);
  };

  const handleEdit = (record: Account) => {
    setEditingId(record._id);
    form.setFieldsValue({ name: record.name, initialBalance: record.initialBalance / 100 });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      message.success('Deleted successfully');
      fetchAccounts();
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAccount(id);
      message.success('Set as default');
      fetchAccounts();
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, initialBalance: Math.round(values.initialBalance * 100) };
      if (editingId) {
        await updateAccount(editingId, data);
        message.success('Updated successfully');
      } else {
        await createAccount(data);
        message.success('Added successfully');
      }
      setModalVisible(false);
      fetchAccounts();
    } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Accounts</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Account</Button>
      </div>
      <Card>
        <List loading={loading} dataSource={accounts} renderItem={(item) => (
          <List.Item actions={[
            !item.isDefault && <Button type="link" onClick={() => handleSetDefault(item._id)}>Set Default</Button>,
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>Edit</Button>,
            accounts.length > 1 && (
              <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(item._id)}>
                <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>
            )
          ]}>
            <List.Item.Meta
              avatar={<WalletOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
              title={<span>{item.name} {item.isDefault && <Tag color="blue">Default</Tag>}</span>}
              description={`Balance: $${(item.currentBalance / 100).toFixed(2)}`}
            />
          </List.Item>
        )} />
      </Card>
      <Modal title={editingId ? 'Edit Account' : 'New Account'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Account Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Account name" />
          </Form.Item>
          <Form.Item name="initialBalance" label="Initial Balance">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Accounts;
