import { Area, Column, Pie } from '@ant-design/charts';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  FallOutlined,
  RiseOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Col,
  DatePicker,
  Progress,
  Radio,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { financeApi } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const FinanceSummaryPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<string>('week');
  const [summary, setSummary] = useState<any>({});
  const [financeTrend, setFinanceTrend] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, settlementsRes] = await Promise.all([
        financeApi.getSummary(),
        financeApi.getSettlements(),
      ]);
      
      setSummary(summaryRes || {});
      setSettlements(settlementsRes || []);
      
      // 模拟生成趋势数据
      if (summaryRes?.dailyData) {
        setFinanceTrend(summaryRes.dailyData);
      }
      if (summaryRes?.expenseByCategory) {
        setExpenseCategories(summaryRes.expenseByCategory);
      }
      if (summaryRes?.incomeByCategory) {
        setIncomeCategories(summaryRes.incomeByCategory);
      }
    } catch (error) {
      // 使用默认数据
      setSummary({
        totalIncome: 0,
        totalExpense: 0,
        totalProfit: 0,
        profitRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const areaConfig = {
    data: financeTrend.flatMap((item) => [
      { date: item.date, value: item.income || 0, type: '收入' },
      { date: item.date, value: item.expense || 0, type: '支出' },
      { date: item.date, value: (item.income || 0) - (item.expense || 0), type: '利润' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    color: ['#52c41a', '#ff4d4f', '#1890ff'],
    areaStyle: (datum: any) => {
      const colors: any = {
        '收入': 'l(270) 0:rgba(82, 196, 26, 0.3) 1:rgba(82, 196, 26, 0.01)',
        '支出': 'l(270) 0:rgba(255, 77, 79, 0.3) 1:rgba(255, 77, 79, 0.01)',
        '利润': 'l(270) 0:rgba(24, 144, 255, 0.3) 1:rgba(24, 144, 255, 0.01)',
      };
      return { fill: colors[datum.type] || colors['收入'] };
    },
  };

  const totalExpense = expenseCategories.reduce((sum, item) => sum + (item.value || 0), 0);

  const expensePieConfig = {
    data: expenseCategories,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name}: {percentage}',
    },
    color: ['#ff4d4f', '#fa8c16', '#faad14', '#52c41a', '#1890ff'],
    statistic: {
      title: {
        content: '总支出',
      },
      content: {
        content: `¥${totalExpense.toLocaleString()}`,
        style: { fontSize: '18px' },
      },
    },
  };

  const incomeColumnConfig = {
    data: incomeCategories,
    xField: 'type',
    yField: 'value',
    color: '#52c41a',
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top' as const,
      formatter: (datum: any) => `¥${((datum.value || 0) / 1000).toFixed(1)}k`,
    },
  };

  const profitColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (income: number) => <Text style={{ color: '#52c41a' }}>¥{(income || 0).toLocaleString()}</Text>,
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (expense: number) => <Text style={{ color: '#ff4d4f' }}>¥{(expense || 0).toLocaleString()}</Text>,
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => <Text strong style={{ color: '#1890ff' }}>¥{(profit || 0).toLocaleString()}</Text>,
    },
    {
      title: '利润率',
      key: 'rate',
      render: (_: any, record: any) => {
        const rate = record.income > 0 ? ((record.profit || 0) / record.income * 100) : 0;
        return (
          <Progress 
            percent={rate} 
            size="small" 
            strokeColor="#1890ff" 
            style={{ width: 80 }}
            format={(p) => `${(p || 0).toFixed(1)}%`}
          />
        );
      },
    },
  ];

  const totalIncome = summary.totalIncome || 0;
  const totalExpenseValue = summary.totalExpense || 0;
  const totalProfit = totalIncome - totalExpenseValue;
  const profitRate = totalIncome > 0 ? ((totalProfit / totalIncome) * 100).toFixed(1) : '0';

  return (
    <PageContainer
      header={{
        title: '收支统计',
        subTitle: '财务收支概览与分析',
      }}
    >
      <div className={styles.summary}>
        {/* 日期筛选 */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large">
            <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)}>
              <Radio.Button value="today">今日</Radio.Button>
              <Radio.Button value="week">本周</Radio.Button>
              <Radio.Button value="month">本月</Radio.Button>
              <Radio.Button value="year">本年</Radio.Button>
            </Radio.Group>
            <RangePicker />
          </Space>
        </Card>

        {/* 核心指标 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard} loading={loading}>
              <Statistic
                title={<Space><RiseOutlined style={{ color: '#52c41a' }} /> 总收入</Space>}
                value={totalIncome}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
              <div className={styles.statTrend}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#52c41a' }}> {summary.incomeTrend || 0}% </Text>
                <Text type="secondary">较上期</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard} loading={loading}>
              <Statistic
                title={<Space><FallOutlined style={{ color: '#ff4d4f' }} /> 总支出</Space>}
                value={totalExpenseValue}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <div className={styles.statTrend}>
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                <Text style={{ color: '#ff4d4f' }}> {summary.expenseTrend || 0}% </Text>
                <Text type="secondary">较上期</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard} loading={loading}>
              <Statistic
                title={<Space><DollarOutlined style={{ color: '#1890ff' }} /> 净利润</Space>}
                value={totalProfit}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
              <div className={styles.statTrend}>
                <Text type="secondary">利润率 </Text>
                <Text strong style={{ color: '#1890ff' }}>{profitRate}%</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard} loading={loading}>
              <Statistic
                title={<Space><WalletOutlined style={{ color: '#722ed1' }} /> 应收账款</Space>}
                value={summary.receivables || 0}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
              <div className={styles.statTrend}>
                <Text type="secondary">待收款 </Text>
                <Text strong>{summary.receivableCount || 0}笔</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 收支趋势图 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>收支趋势</Title>}
          bordered={false}
          style={{ marginBottom: 16 }}
          loading={loading}
        >
          {financeTrend.length > 0 ? (
            <Area {...areaConfig} height={300} />
          ) : (
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text type="secondary">暂无数据</Text>
            </div>
          )}
        </Card>

        {/* 收入与支出分析 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>支出构成</Title>}
              bordered={false}
              loading={loading}
            >
              {expenseCategories.length > 0 ? (
                <Pie {...expensePieConfig} height={300} />
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">暂无数据</Text>
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>收入来源</Title>}
              bordered={false}
              loading={loading}
            >
              {incomeCategories.length > 0 ? (
                <Column {...incomeColumnConfig} height={300} />
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">暂无数据</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* 每日结算 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>每日结算</Title>}
          bordered={false}
          loading={loading}
        >
          <Table
            dataSource={settlements}
            columns={profitColumns}
            rowKey="date"
            pagination={{ pageSize: 7 }}
            size="middle"
            locale={{ emptyText: '暂无数据' }}
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default FinanceSummaryPage;
