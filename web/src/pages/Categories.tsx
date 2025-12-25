import { useEffect, useState } from 'react';
import { Card, List, Button, Modal, Form, Input, Select, Tag, message, Popconfirm, ColorPicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, createCategory, updateCategory, deleteCategory, Category, CategoryType } from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data.categories);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ type: activeType, color: '#1890ff' });
    setModalVisible(true);
  };

  const handleEdit = (record: Category) => {
    setEditingId(record._id);
    form.setFieldsValue({ name: record.name, type: record.type, icon: record.icon, color: record.color });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('Deleted successfully');
      fetchCategories();
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const color = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#1890ff';
      const data = { ...values, color };
      if (editingId) {
        await updateCategory(editingId, data);
        message.success('Updated successfully');
      } else {
        await createCategory(data);
        message.success('Added successfully');
      }
      setModalVisible(false);
      fetchCategories();
    } catch {}
  };

  const filteredCategories = categories.filter(c => c.type === activeType);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Categories</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Category</Button>
      </div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type={activeType === 'expense' ? 'primary' : 'default'} onClick={() => setActiveType('expense')} style={{ marginRight: 8 }}>Expense</Button>
          <Button type={activeType === 'income' ? 'primary' : 'default'} onClick={() => setActiveType('income')}>Income</Button>
        </div>
        <List loading={loading} dataSource={filteredCategories} renderItem={(item) => (
          <List.Item actions={[
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>Edit</Button>,
            !item.isDefault && (
              <Popconfirm title="Confirm delete?" onConfirm={() => handleDelete(item._id)}>
                <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
              </Popconfirm>
            )
          ]}>
            <List.Item.Meta
              avatar={<div style={{ width: 32, height: 32, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{item.name[0]}</div>}
              title={<span>{item.name} {item.isDefault && <Tag>Default</Tag>}</span>}
            />
          </List.Item>
        )} />
      </Card>
      <Modal title={editingId ? 'Edit Category' : 'New Category'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input placeholder="Category name" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select disabled={!!editingId}>
              <Select.Option value="expense">Expense</Select.Option>
              <Select.Option value="income">Income</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="color" label="Color">
            <ColorPicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
