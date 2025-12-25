import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getSummary, getCategoryStats, getTrendData, SummaryResult, CategoryStatResult, TrendDataResult } from '../services/statisticsService';
import { initializeCategories } from '../services/categoryService';
import { initializeAccount } from '../services/accountService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStatResult[]>([]);
  const [trendData, setTrendData] = useState<TrendDataResult[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize default categories and account for new users
        await Promise.all([
          initializeCategories(),
          initializeAccount()
        ]);
        const [summaryRes, categoryRes, trendRes] = await Promise.all([
          getSummary({ period: 'month' }),
          getCategoryStats({ type: 'expense', period: 'month' }),
          getTrendData({ period: 'week' }),
        ]);
        setSummary(summaryRes.data);
        setCategoryStats(categoryRes.data.categories);
        setTrendData(trendRes.data.data);
      } catch {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: categoryStats.map(item => ({
        value: item.amount / 100,
        name: item.categoryName,
        itemStyle: { color: item.categoryColor }
      }))
    }]
  };

  const lineOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Income', 'Expense'] },
    xAxis: { type: 'category', data: trendData.map(item => item.date) },
    yAxis: { type: 'value', axisLabel: { formatter: '${value}' } },
    series: [
      { name: 'Income', type: 'line', smooth: true, data: trendData.map(item => item.income / 100), itemStyle: { color: '#52c41a' } },
      { name: 'Expense', type: 'line', smooth: true, data: trendData.map(item => item.expense / 100), itemStyle: { color: '#f5222d' } }
    ]
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }


  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Monthly Overview</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monthly Income"
              value={(summary?.income || 0) / 100}
              precision={2}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              suffix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monthly Expense"
              value={(summary?.expense || 0) / 100}
              precision={2}
              prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />}
              suffix="$"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monthly Balance"
              value={(summary?.balance || 0) / 100}
              precision={2}
              prefix={<WalletOutlined />}
              suffix="$"
              valueStyle={{ color: (summary?.balance || 0) >= 0 ? '#1890ff' : '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Expense by Category">
            {categoryStats.length > 0 ? (
              <ReactECharts option={pieOption} style={{ height: 300 }} />
            ) : (
              <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>No data</div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="7-Day Trend">
            <ReactECharts option={lineOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
