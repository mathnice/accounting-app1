import React, { useState, useEffect } from 'react';
import { Card, Select, Spin, Typography, Row, Col, Statistic, List, Progress, Button, Empty } from 'antd';
import { RobotOutlined, ReloadOutlined } from '@ant-design/icons';
import { getMonthlySummary, MonthlySummaryResponse } from '../services/aiService';

const { Paragraph, Text } = Typography;

const AISummary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<MonthlySummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMonthlySummary(selectedYear, selectedMonth);
      setSummaryData(response.data);
    } catch (err: any) {
      console.error('Summary error:', err);
      setError(err.response?.data?.error?.message || '获取总结失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  const formatAmount = (amount: number) => `¥${(amount / 100).toFixed(2)}`;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span>AI 财务总结</span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 100 }}
              options={years.map(y => ({ value: y, label: `${y}年` }))}
            />
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 80 }}
              options={months.map(m => ({ value: m, label: `${m}月` }))}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchSummary} loading={loading}>
              刷新
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: 16 }}>AI 正在分析你的财务数据...</Paragraph>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Text type="danger">{error}</Text>
            <br />
            <Button type="primary" onClick={fetchSummary} style={{ marginTop: 16 }}>
              重试
            </Button>
          </div>
        ) : summaryData ? (
          <>
            {/* 统计概览 */}
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总收入"
                    value={summaryData.stats.totalIncome / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="总支出"
                    value={summaryData.stats.totalExpense / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="结余"
                    value={summaryData.stats.balance / 100}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: summaryData.stats.balance >= 0 ? '#52c41a' : '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={24}>
              {/* AI 分析报告 */}
              <Col span={16}>
                <Card 
                  title={<><RobotOutlined /> AI 分析报告</>}
                  style={{ marginBottom: 24 }}
                >
                  <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {summaryData.summary}
                  </Paragraph>
                </Card>
              </Col>

              {/* 消费排行 */}
              <Col span={8}>
                <Card title="💰 消费排行">
                  {summaryData.stats.topCategories && summaryData.stats.topCategories.length > 0 ? (
                    <List
                      dataSource={summaryData.stats.topCategories}
                      renderItem={(item, index) => (
                        <List.Item>
                          <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <Text>
                                <span style={{ 
                                  display: 'inline-block',
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  backgroundColor: index === 0 ? '#ff4d4f' : index === 1 ? '#faad14' : '#1890ff',
                                  color: '#fff',
                                  textAlign: 'center',
                                  lineHeight: '20px',
                                  fontSize: 12,
                                  marginRight: 8
                                }}>
                                  {index + 1}
                                </span>
                                {item.categoryName}
                              </Text>
                              <Text strong>{formatAmount(item.amount)}</Text>
                            </div>
                            <Progress 
                              percent={item.percentage} 
                              size="small" 
                              showInfo={false}
                              strokeColor={index === 0 ? '#ff4d4f' : index === 1 ? '#faad14' : '#1890ff'}
                            />
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无消费数据" />
                  )}
                </Card>
              </Col>
            </Row>
          </>
        ) : null}
      </Card>
    </div>
  );
};

export default AISummary;
