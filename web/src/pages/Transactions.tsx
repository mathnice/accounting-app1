import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, Transaction, TransactionType, PaymentMethod } from '../services/transactionService';
import { getCategories, Category, initializeCategories } from '../services/categoryService';
import { getAccounts, Account, initializeAccount } from '../services/accountService';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash', wechat: 'WeChat', alipay: 'Alipay', bank: 'Bank Card'
};

const Transactions = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [form] = Form.useForm();

  const fetchTransactions = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getTransactions({ page: p, limit: 10 });
      setTransactions(res.data.transactions);
      setTotal(res.data.total);
      setPage(p);
    } catch {} finally { setLoading(false); }
  };

  const fetchOptions = async () => {
    try {
      // Initialize default categories and account for new users
      await Promise.all([initializeCategories(), initializeAccount()]);
      const [catRes, accRes] = await Promise.all([getCategories(), getAccounts()]);
      setCategories(catRes.data.categories);
      setAccounts(accRes.data.accounts);
    } catch {}
  };

  useEffect(() => { fetchTransactions(); fetchOptions(); }, []);

  const handleAdd = () => {
    setEditingId(null);
    setTransactionType('expense');
    form.resetFields();
    form.setFieldsValue({ type: 'expense', date: dayjs(), paymentMethod: 'wechat' });
    setModalVisible(true);
  };

  const handleEdit = (record: Transaction) => {
    setEditingId(record._id);
    setTransactionType(record.type);
    form.setFieldsValue({
      ...record,
      categoryId: typeof record.categoryId === 'object' ? record.categoryId._id : record.categoryId,
      accountId: typeof record.accountId === 'object' ? record.accountId._id : record.accountId,
      amount: record.amount / 100,
      date: dayjs(record.date)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      message.success('Deleted successfully');
      fetchTransactions(page);
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, amount: Math.round(values.amount * 100), date: values.date.toISOString() };
      if (editingId) {
        await updateTransaction(editingId, data);
        message.success('Updated successfully');
      } else {
        await createTransaction(data);
        message.success('Added successfully');
      }
      setModalVisible(false);
      fetchTransactions(page);
    } catch {}
  };


  const columns = [
    { title: 'Date', dataIndex: 'date', render: (v: string) => dayjs(v).format('YYYY-MM-DD') },
    { title: 'Type', dataIndex: 'type', render: (v: TransactionType) => <Tag color={v === 'income' ? 'green' : 'red'}>{v === 'income' ? 'Income' : 'Expense'}</Tag> },
    { title: 'Category', dataIndex: 'categoryId', render: (v: any) => v?.name || '-' },
    { title: 'Amount', dataIndex: 'amount', render: (v: number, r: Transaction) => <span style={{ color: r.type === 'income' ? '#52c41a' : '#f5222d' }}>${(v / 100).toFixed(2)}</span> },
    { title: 'Account', dataIndex: 'accountId', render: (v: any) => v?.name || '-' },
    { title: 'Payment', dataIndex: 'paymentMethod', render: (v: PaymentMethod) => paymentMethodLabels[v] },
    { title: 'Note', dataIndex: 'note', ellipsis: true },
    {
      title: 'Actions', render: (_: any, record: Transaction) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(record._id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const filteredCategories = categories.filter(c => c.type === transactionType);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Transactions</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Transaction</Button>
      </div>
      <Table columns={columns} dataSource={transactions} rowKey="_id" loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: fetchTransactions }} />
      
      <Modal title={editingId ? 'Edit Transaction' : 'New Transaction'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select onChange={(v) => { setTransactionType(v); form.setFieldValue('categoryId', undefined); }}>
              <Select.Option value="expense">Expense</Select.Option>
              <Select.Option value="income">Income</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter amount' }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} prefix="$" />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true, message: 'Please select category' }]}>
            <Select placeholder="Select category">
              {filteredCategories.map(c => <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="accountId" label="Account" rules={[{ required: true, message: 'Please select account' }]}>
            <Select placeholder="Select account">
              {accounts.map(a => <Select.Option key={a._id} value={a._id}>{a.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="wechat">WeChat</Select.Option>
              <Select.Option value="alipay">Alipay</Select.Option>
              <Select.Option value="bank">Bank Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input.TextArea rows={2} placeholder="Note (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
