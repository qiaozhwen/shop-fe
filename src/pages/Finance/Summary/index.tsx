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
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 收支趋势数据
const financeTrend = [
  { date: '12-17', income: 28500, expense: 18200, profit: 10300 },
  { date: '12-18', income: 32100, expense: 21500, profit: 10600 },
  { date: '12-19', income: 25800, expense: 16800, profit: 9000 },
  { date: '12-20', income: 38600, expense: 24300, profit: 14300 },
  { date: '12-21', income: 35200, expense: 22100, profit: 13100 },
  { date: '12-22', income: 42500, expense: 28600, profit: 13900 },
  { date: '12-23', income: 15625, expense: 9800, profit: 5825 },
];

// 支出分类
const expenseCategories = [
  { type: '采购成本', value: 125600, percentage: 72 },
  { type: '人工成本', value: 28500, percentage: 16 },
  { type: '物流配送', value: 12800, percentage: 7 },
  { type: '水电杂费', value: 5200, percentage: 3 },
  { type: '其他支出', value: 3500, percentage: 2 },
];

// 收入来源
const incomeCategories = [
  { type: '销售收入', value: 215800 },
  { type: '配送费', value: 8500 },
  { type: '加工费', value: 3200 },
];

// 月度利润数据
const monthlyProfit = [
  { month: '7月', income: 285600, expense: 185200, profit: 100400, rate: 35.2 },
  { month: '8月', income: 312500, expense: 198600, profit: 113900, rate: 36.4 },
  { month: '9月', income: 298200, expense: 192800, profit: 105400, rate: 35.3 },
  { month: '10月', income: 335800, expense: 215600, profit: 120200, rate: 35.8 },
  { month: '11月', income: 358600, expense: 228500, profit: 130100, rate: 36.3 },
  { month: '12月', income: 218325, expense: 141300, profit: 77025, rate: 35.3 },
];

// 应收账款
const receivables = [
  { customer: '王府酒家', amount: 28500, dueDate: '2024-01-05', days: 13, status: 'normal' },
  { customer: '福满楼', amount: 15200, dueDate: '2024-01-10', days: 18, status: 'normal' },
  { customer: '张记酒楼', amount: 10200, dueDate: '2023-12-28', days: 5, status: 'warning' },
  { customer: '李氏餐馆', amount: 8600, dueDate: '2023-12-25', days: 2, status: 'urgent' },
];

const FinanceSummaryPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('week');

  const areaConfig = {
    data: financeTrend.flatMap((item) => [
      { date: item.date, value: item.income, type: '收入' },
      { date: item.date, value: item.expense, type: '支出' },
      { date: item.date, value: item.profit, type: '利润' },
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
      return { fill: colors[datum.type] };
    },
  };

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
        content: '¥175,600',
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
      formatter: (datum: any) => `¥${(datum.value / 1000).toFixed(1)}k`,
    },
  };

  const profitColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (income: number) => <Text style={{ color: '#52c41a' }}>¥{income.toLocaleString()}</Text>,
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (expense: number) => <Text style={{ color: '#ff4d4f' }}>¥{expense.toLocaleString()}</Text>,
    },
    {
      title: '利润',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit: number) => <Text strong style={{ color: '#1890ff' }}>¥{profit.toLocaleString()}</Text>,
    },
    {
      title: '利润率',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          strokeColor="#1890ff" 
          style={{ width: 80 }}
          format={(p) => `${p}%`}
        />
      ),
    },
  ];

  const receivableColumns = [
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: string) => <Text strong>{customer}</Text>,
    },
    {
      title: '应收金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong style={{ color: '#D4380D' }}>¥{amount.toLocaleString()}</Text>,
    },
    {
      title: '到期日',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '剩余天数',
      dataIndex: 'days',
      key: 'days',
      render: (days: number, record: any) => (
        <Text style={{ color: record.status === 'urgent' ? '#ff4d4f' : record.status === 'warning' ? '#faad14' : '#52c41a' }}>
          {days}天
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          normal: { color: 'success', text: '正常' },
          warning: { color: 'warning', text: '即将到期' },
          urgent: { color: 'error', text: '紧急' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
  ];

  // 计算统计数据
  const totalIncome = financeTrend.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = financeTrend.reduce((sum, item) => sum + item.expense, 0);
  const totalProfit = financeTrend.reduce((sum, item) => sum + item.profit, 0);
  const profitRate = ((totalProfit / totalIncome) * 100).toFixed(1);
  const totalReceivable = receivables.reduce((sum, item) => sum + item.amount, 0);

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
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><RiseOutlined style={{ color: '#52c41a' }} /> 总收入</Space>}
                value={totalIncome}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
              <div className={styles.statTrend}>
                <ArrowUpOutlined style={{ color: '#52c41a' }} />
                <Text style={{ color: '#52c41a' }}> 12.5% </Text>
                <Text type="secondary">较上周</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><FallOutlined style={{ color: '#ff4d4f' }} /> 总支出</Space>}
                value={totalExpense}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#ff4d4f' }}
              />
              <div className={styles.statTrend}>
                <ArrowUpOutlined style={{ color: '#ff4d4f' }} />
                <Text style={{ color: '#ff4d4f' }}> 8.3% </Text>
                <Text type="secondary">较上周</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
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
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><WalletOutlined style={{ color: '#722ed1' }} /> 应收账款</Space>}
                value={totalReceivable}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#722ed1' }}
              />
              <div className={styles.statTrend}>
                <Text type="secondary">待收款 </Text>
                <Text strong>{receivables.length}笔</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 收支趋势图 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>收支趋势</Title>}
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Area {...areaConfig} height={300} />
        </Card>

        {/* 收入与支出分析 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>支出构成</Title>}
              bordered={false}
            >
              <Pie {...expensePieConfig} height={300} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>收入来源</Title>}
              bordered={false}
            >
              <Column {...incomeColumnConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 利润分析与应收账款 */}
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>月度利润分析</Title>}
              bordered={false}
            >
              <Table
                dataSource={monthlyProfit}
                columns={profitColumns}
                rowKey="month"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <WalletOutlined style={{ color: '#722ed1' }} />
                  <Title level={5} style={{ margin: 0 }}>应收账款</Title>
                </Space>
              }
              bordered={false}
              extra={<Text type="secondary">共{receivables.length}笔</Text>}
            >
              <Table
                dataSource={receivables}
                columns={receivableColumns}
                rowKey="customer"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default FinanceSummaryPage;

