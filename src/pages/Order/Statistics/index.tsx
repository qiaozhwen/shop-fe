import { Column, Line, Pie } from '@ant-design/charts';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Col,
  DatePicker,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 销售趋势数据
const salesTrend = [
  { date: '12-17', sales: 28500, orders: 45, avgPrice: 633 },
  { date: '12-18', sales: 32100, orders: 52, avgPrice: 617 },
  { date: '12-19', sales: 25800, orders: 41, avgPrice: 629 },
  { date: '12-20', sales: 38600, orders: 62, avgPrice: 623 },
  { date: '12-21', sales: 35200, orders: 58, avgPrice: 607 },
  { date: '12-22', sales: 42500, orders: 68, avgPrice: 625 },
  { date: '12-23', sales: 15625, orders: 25, avgPrice: 625 },
];

// 品类销售数据
const categorySales = [
  { category: '鸡类', sales: 85600, quantity: 2150, percentage: 48 },
  { category: '鸭类', sales: 42300, quantity: 1120, percentage: 24 },
  { category: '鸽类', sales: 28500, quantity: 680, percentage: 16 },
  { category: '鹅类', sales: 21500, quantity: 180, percentage: 12 },
];

// 商品销量排行
const productRanking = [
  { rank: 1, name: '散养土鸡', category: '鸡类', quantity: 856, amount: 38520, growth: 12.5 },
  { rank: 2, name: '三黄鸡', category: '鸡类', quantity: 720, amount: 25200, growth: 8.3 },
  { rank: 3, name: '麻鸭', category: '鸭类', quantity: 580, amount: 22040, growth: -5.2 },
  { rank: 4, name: '肉鸽', category: '鸽类', quantity: 450, amount: 20250, growth: 15.8 },
  { rank: 5, name: '乌鸡', category: '鸡类', quantity: 320, amount: 18560, growth: 6.7 },
  { rank: 6, name: '番鸭', category: '鸭类', quantity: 285, amount: 13680, growth: 3.2 },
  { rank: 7, name: '大白鹅', category: '鹅类', quantity: 120, amount: 15360, growth: 22.1 },
];

// 客户排行
const customerRanking = [
  { rank: 1, name: '王府酒家', orders: 45, amount: 58600, category: 'VIP' },
  { rank: 2, name: '福满楼', orders: 38, amount: 42300, category: 'VIP' },
  { rank: 3, name: '李氏餐馆', orders: 32, amount: 35800, category: 'VIP' },
  { rank: 4, name: '张记酒楼', orders: 28, amount: 28500, category: '普通' },
  { rank: 5, name: '赵家菜馆', orders: 25, amount: 22600, category: '普通' },
];

// 时段分布
const hourlyDistribution = [
  { hour: '06:00', orders: 8 },
  { hour: '07:00', orders: 15 },
  { hour: '08:00', orders: 28 },
  { hour: '09:00', orders: 35 },
  { hour: '10:00', orders: 42 },
  { hour: '11:00', orders: 38 },
  { hour: '12:00', orders: 25 },
  { hour: '13:00', orders: 18 },
  { hour: '14:00', orders: 22 },
  { hour: '15:00', orders: 30 },
  { hour: '16:00', orders: 35 },
  { hour: '17:00', orders: 28 },
  { hour: '18:00', orders: 15 },
];

const OrderStatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('week');

  const lineConfig = {
    data: salesTrend,
    xField: 'date',
    yField: 'sales',
    smooth: true,
    color: '#D4380D',
    point: {
      size: 4,
      shape: 'circle',
    },
    label: {
      formatter: (datum: any) => `¥${(datum.sales / 1000).toFixed(1)}k`,
    },
    area: {
      style: {
        fill: 'l(270) 0:rgba(212, 56, 13, 0.3) 1:rgba(212, 56, 13, 0.01)',
      },
    },
  };

  const pieConfig = {
    data: categorySales.map((item) => ({ type: item.category, value: item.sales })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    color: ['#D4380D', '#FA8C16', '#52C41A', '#1890FF'],
    statistic: {
      title: {
        content: '总销售额',
      },
      content: {
        content: '¥177,900',
        style: { fontSize: '20px' },
      },
    },
  };

  const columnConfig = {
    data: hourlyDistribution,
    xField: 'hour',
    yField: 'orders',
    color: '#FA8C16',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top' as const,
    },
  };

  const productColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <div
            className={styles.rankBadge}
            style={{ background: rank <= 3 ? colors[rank - 1] : '#f0f0f0' }}
          >
            {rank}
          </div>
        );
      },
    },
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Tag color="blue">{record.category}</Tag>
        </div>
      ),
    },
    {
      title: '销量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q: number) => `${q}只`,
    },
    {
      title: '销售额',
      dataIndex: 'amount',
      key: 'amount',
      render: (a: number) => <Text strong style={{ color: '#D4380D' }}>¥{a.toLocaleString()}</Text>,
    },
    {
      title: '环比',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
  ];

  const customerColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <div
            className={styles.rankBadge}
            style={{ background: rank <= 3 ? colors[rank - 1] : '#f0f0f0' }}
          >
            {rank}
          </div>
        );
      },
    },
    {
      title: '客户',
      key: 'customer',
      render: (_: any, record: any) => (
        <Space>
          <Text strong>{record.name}</Text>
          <Tag color={record.category === 'VIP' ? 'gold' : 'default'}>{record.category}</Tag>
        </Space>
      ),
    },
    {
      title: '订单数',
      dataIndex: 'orders',
      key: 'orders',
      render: (o: number) => `${o}单`,
    },
    {
      title: '消费金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (a: number) => <Text strong style={{ color: '#D4380D' }}>¥{a.toLocaleString()}</Text>,
    },
  ];

  // 总计统计
  const totalStats = {
    sales: salesTrend.reduce((sum, item) => sum + item.sales, 0),
    orders: salesTrend.reduce((sum, item) => sum + item.orders, 0),
    avgPrice: Math.round(salesTrend.reduce((sum, item) => sum + item.sales, 0) / salesTrend.reduce((sum, item) => sum + item.orders, 0)),
  };

  return (
    <PageContainer
      header={{
        title: '订单统计',
        subTitle: '销售数据分析与统计',
      }}
    >
      <div className={styles.statistics}>
        {/* 日期筛选 */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large">
            <CalendarOutlined />
            <Radio.Group value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <Radio.Button value="today">今日</Radio.Button>
              <Radio.Button value="week">本周</Radio.Button>
              <Radio.Button value="month">本月</Radio.Button>
              <Radio.Button value="quarter">本季度</Radio.Button>
            </Radio.Group>
            <RangePicker />
          </Space>
        </Card>

        {/* 核心指标 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="总销售额"
                value={totalStats.sales}
                precision={0}
                prefix="¥"
                suffix={
                  <span className={styles.statTrend} style={{ color: '#52c41a' }}>
                    <ArrowUpOutlined /> 12.5%
                  </span>
                }
              />
              <Progress
                percent={75}
                strokeColor={{ '0%': '#D4380D', '100%': '#FA541C' }}
                showInfo={false}
                style={{ marginTop: 12 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="订单总数"
                value={totalStats.orders}
                suffix={
                  <span>
                    单
                    <span className={styles.statTrend} style={{ color: '#52c41a', marginLeft: 8 }}>
                      <ArrowUpOutlined /> 8.3%
                    </span>
                  </span>
                }
              />
              <Progress
                percent={83}
                strokeColor={{ '0%': '#FA8C16', '100%': '#FAAD14' }}
                showInfo={false}
                style={{ marginTop: 12 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="平均客单价"
                value={totalStats.avgPrice}
                prefix="¥"
                suffix={
                  <span className={styles.statTrend} style={{ color: '#ff4d4f' }}>
                    <ArrowDownOutlined /> 2.1%
                  </span>
                }
              />
              <Progress
                percent={68}
                strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }}
                showInfo={false}
                style={{ marginTop: 12 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="活跃客户"
                value={86}
                suffix={
                  <span>
                    家
                    <span className={styles.statTrend} style={{ color: '#52c41a', marginLeft: 8 }}>
                      +3
                    </span>
                  </span>
                }
              />
              <div className={styles.customerProgress}>
                <Text type="secondary">新客户占比</Text>
                <Progress percent={18} size="small" strokeColor="#1890ff" />
              </div>
            </Card>
          </Col>
        </Row>

        {/* 销售趋势与品类分布 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={16}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>销售趋势</Title>}
              bordered={false}
            >
              <Line {...lineConfig} height={300} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>品类销售占比</Title>}
              bordered={false}
            >
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 排行榜 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#faad14' }} />
                  <Title level={5} style={{ margin: 0 }}>商品销量排行</Title>
                </Space>
              }
              bordered={false}
              extra={<Text type="secondary">本周数据</Text>}
            >
              <Table
                dataSource={productRanking}
                columns={productColumns}
                rowKey="rank"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: '#1890ff' }} />
                  <Title level={5} style={{ margin: 0 }}>客户消费排行</Title>
                </Space>
              }
              bordered={false}
              extra={<Text type="secondary">本周数据</Text>}
            >
              <Table
                dataSource={customerRanking}
                columns={customerColumns}
                rowKey="rank"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>

        {/* 时段分布与品类明细 */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>订单时段分布</Title>}
              bordered={false}
            >
              <Column {...columnConfig} height={280} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>品类销售明细</Title>}
              bordered={false}
            >
              <div className={styles.categoryDetail}>
                {categorySales.map((item, index) => (
                  <div key={item.category} className={styles.categoryItem}>
                    <div className={styles.categoryHeader}>
                      <Space>
                        <span className={styles.categoryRank}>{index + 1}</span>
                        <Text strong>{item.category}</Text>
                      </Space>
                      <Text strong style={{ color: '#D4380D' }}>¥{item.sales.toLocaleString()}</Text>
                    </div>
                    <Progress
                      percent={item.percentage}
                      strokeColor={['#D4380D', '#FA8C16', '#52C41A', '#1890FF'][index]}
                      showInfo={false}
                    />
                    <div className={styles.categoryMeta}>
                      <Text type="secondary">销量: {item.quantity}只</Text>
                      <Text type="secondary">占比: {item.percentage}%</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default OrderStatisticsPage;

