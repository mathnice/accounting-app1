import { useState } from 'react';
import { Card, Input, Button, Upload, message, Spin, Descriptions, Tag, List, Space, Typography, Divider } from 'antd';
import { UploadOutlined, ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { smartBookingText, smartBookingImage, SmartBookingResult } from '../services/aiService';
import { createTransaction } from '../services/transactionService';

const { TextArea } = Input;
const { Title, Text } = Typography;

const SmartBooking = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartBookingResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleTextRecognition = async () => {
    if (!text.trim()) {
      message.warning('请输入记账描述');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await smartBookingText(text.trim());
      setResult(res.data);
      message.success('识别成功');
    } catch (error: any) {
      message.error(error.message || '识别失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setLoading(true);
      setResult(null);
      try {
        const base64Data = base64.split(',')[1] || base64;
        const res = await smartBookingImage(base64Data);
        setResult(res.data);
        message.success('识别成功');
      } catch (error: any) {
        message.error(error.message || '识别失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleConfirm = async () => {
    if (!result || result.amount === null) {
      message.warning('请先识别记账信息');
      return;
    }
    if (!result.categoryId) {
      message.warning('未能匹配到分类，请手动添加');
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        type: result.type,
        amount: result.amount,
        categoryId: result.categoryId,
        accountId: result.accountId || '',
        date: result.date || new Date().toISOString().split('T')[0],
        note: result.note,
      });
      message.success('记账成功！');
      setResult(null);
      setText('');
      setImagePreview(null);
    } catch (error: any) {
      message.error(error.message || '记账失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>智能记账</Title>
      <Text type="secondary">通过文字描述或上传小票图片，AI 自动识别并记账</Text>
      <Divider />

      <Card title="文字记账" style={{ marginBottom: 16 }}>
        <TextArea
          rows={3}
          placeholder="输入自然语言描述，如：今天午餐花了35元"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Button type="primary" icon={<ScanOutlined />} onClick={handleTextRecognition} loading={loading}>
          识别
        </Button>
      </Card>

      <Card title="图片记账" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">上传小票、账单、发票图片，AI 自动识别金额和商品</Text>
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleImageUpload} disabled={loading}>
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
          {imagePreview && (
            <img src={imagePreview} alt="预览" style={{ maxWidth: '100%', maxHeight: 300, marginTop: 12, borderRadius: 8 }} />
          )}
        </Space>
      </Card>

      {loading && (
        <Card style={{ textAlign: 'center', marginBottom: 16 }}>
          <Spin size="large" />
          <div style={{ marginTop: 12 }}>AI 正在识别中...</div>
        </Card>
      )}

      {result && !loading && (
        <Card
          title="识别结果"
          style={{ marginBottom: 16 }}
          extra={<Tag color={result.confidence > 0.7 ? 'green' : result.confidence > 0.4 ? 'orange' : 'red'}>置信度: {(result.confidence * 100).toFixed(0)}%</Tag>}
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="类型">
              <Tag color={result.type === 'income' ? 'green' : 'red'}>{result.type === 'income' ? '收入' : '支出'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="金额">
              <Text strong style={{ fontSize: 18, color: result.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
                {result.amount !== null ? formatAmount(result.amount) : '未识别'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="分类">{result.categoryName}</Descriptions.Item>
            <Descriptions.Item label="备注">{result.note || '-'}</Descriptions.Item>
            {result.date && <Descriptions.Item label="日期">{result.date}</Descriptions.Item>}
          </Descriptions>

          {result.items && result.items.length > 0 && (
            <>
              <Divider orientation="left">商品明细</Divider>
              <List
                size="small"
                dataSource={result.items}
                renderItem={(item) => (
                  <List.Item>
                    <Text>{item.name}</Text>
                    <Text type="secondary">{formatAmount(item.price)}</Text>
                  </List.Item>
                )}
              />
            </>
          )}

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleConfirm}
              disabled={result.amount === null || !result.categoryId}
              loading={loading}
            >
              确认记账
            </Button>
            {!result.categoryId && (
              <div style={{ marginTop: 8 }}>
                <Text type="warning">未能匹配到分类，请先在分类管理中添加对应分类</Text>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SmartBooking;
