import { useEffect, useState } from 'react';
import { Card, Row, Col, Select, Spin, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getSummary, getCategoryStats, getTrendData, SummaryResult, CategoryStatResult, TrendDataResult } from '../services/statisticsService';

type Period = 'day' | 'week' | 'month' | 'year';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('month');
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [expenseStats, setExpenseStats] = useState<CategoryStatResult[]>([]);
  const [incomeStats, setIncomeStats] = useState<CategoryStatResult[]>([]);
  const [trendData, setTrendData] = useState<TrendDataResult[]>([]);

  const fetchData = async (p: Period) => {
    setLoading(true);
    try {
      const [summaryRes, expenseRes, incomeRes, trendRes] = await Promise.all([
        getSummary({ period: p }),
        getCategoryStats({ type: 'expense', period: p }),
        getCategoryStats({ type: 'income', period: p }),
        getTrendData({ period: p === 'day' ? 'week' : p }),
      ]);
      setSummary(summaryRes.data);
      setExpenseStats(expenseRes.data.categories);
      setIncomeStats(incomeRes.data.categories);
      setTrendData(trendRes.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(period); }, [period]);

  const pieOption = (data: CategoryStatResult[], title: string) => ({
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: data.map(item => ({ value: item.amount / 100, name: item.categoryName, itemStyle: { color: item.categoryColor } }))
    }]
  });

  const barOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Income', 'Expense'] },
    xAxis: { type: 'category', data: trendData.map(item => item.date) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Income', type: 'bar', data: trendData.map(item => item.income / 100), itemStyle: { color: '#52c41a' } },
      { name: 'Expense', type: 'bar', data: trendData.map(item => item.expense / 100), itemStyle: { color: '#f5222d' } }
    ]
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Statistics</h2>
        <Select value={period} onChange={setPeriod} style={{ width: 120 }}>
          <Select.Option value="day">Today</Select.Option>
          <Select.Option value="week">This Week</Select.Option>
          <Select.Option value="month">This Month</Select.Option>
          <Select.Option value="year">This Year</Select.Option>
        </Select>
      </div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="Income" value={(summary?.income || 0) / 100} precision={2} prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />} suffix="$" valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Expense" value={(summary?.expense || 0) / 100} precision={2} prefix={<ArrowDownOutlined style={{ color: '#f5222d' }} />} suffix="$" valueStyle={{ color: '#f5222d' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Balance" value={(summary?.balance || 0) / 100} precision={2} suffix="$" valueStyle={{ color: (summary?.balance || 0) >= 0 ? '#1890ff' : '#f5222d' }} /></Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>{expenseStats.length > 0 ? <ReactECharts option={pieOption(expenseStats, 'Expense by Category')} style={{ height: 300 }} /> : <div style={{ textAlign: 'center', padding: 50 }}>No data</div>}</Card>
        </Col>
        <Col span={12}>
          <Card>{incomeStats.length > 0 ? <ReactECharts option={pieOption(incomeStats, 'Income by Category')} style={{ height: 300 }} /> : <div style={{ textAlign: 'center', padding: 50 }}>No data</div>}</Card>
        </Col>
      </Row>
      <Card title="Income vs Expense Trend">
        <ReactECharts option={barOption} style={{ height: 300 }} />
      </Card>
    </div>
  );
};

export default Statistics;
