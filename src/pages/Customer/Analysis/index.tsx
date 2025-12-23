import { Bar, Column, Pie, Radar } from '@ant-design/charts';
import {
  CrownOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Col,
  Progress,
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

// 客户分布数据
const customerDistribution = [
  { type: 'VIP客户', value: 12 },
  { type: '普通客户', value: 45 },
  { type: '新客户', value: 29 },
];

// 客户消费排行
const customerRanking = [
  { name: '王府酒家', amount: 285600, orders: 156, type: 'VIP', growth: 15.2 },
  { name: '福满楼', amount: 168500, orders: 98, type: 'VIP', growth: 12.8 },
  { name: '李氏餐馆', amount: 125800, orders: 75, type: 'VIP', growth: 8.5 },
  { name: '张记酒楼', amount: 85600, orders: 45, type: '普通', growth: 22.1 },
  { name: '赵家菜馆', amount: 52300, orders: 32, type: '普通', growth: 18.6 },
  { name: '鼎香园', amount: 8500, orders: 5, type: '新客户', growth: 0 },
];

// 月度客户增长
const monthlyGrowth = [
  { month: '7月', newCustomers: 5, activeCustomers: 62 },
  { month: '8月', newCustomers: 8, activeCustomers: 68 },
  { month: '9月', newCustomers: 6, activeCustomers: 72 },
  { month: '10月', newCustomers: 4, activeCustomers: 74 },
  { month: '11月', newCustomers: 7, activeCustomers: 79 },
  { month: '12月', newCustomers: 9, activeCustomers: 86 },
];

// 客户画像雷达图数据
const customerProfile = [
  { item: '消费频次', VIP: 90, 普通: 60, 新客户: 30 },
  { item: '客单价', VIP: 85, 普通: 50, 新客户: 45 },
  { item: '忠诚度', VIP: 95, 普通: 65, 新客户: 20 },
  { item: '活跃度', VIP: 88, 普通: 55, 新客户: 70 },
  { item: '增长潜力', VIP: 40, 普通: 70, 新客户: 90 },
];

// 客户偏好数据
const productPreference = [
  { product: '土鸡', percentage: 35 },
  { product: '三黄鸡', percentage: 25 },
  { product: '麻鸭', percentage: 18 },
  { product: '肉鸽', percentage: 12 },
  { product: '乌鸡', percentage: 7 },
  { product: '其他', percentage: 3 },
];

// 流失预警客户
const churnRiskCustomers = [
  { name: '金龙餐厅', lastOrder: '2023-11-15', daysSince: 38, avgInterval: 7, risk: '高' },
  { name: '银海酒家', lastOrder: '2023-11-28', daysSince: 25, avgInterval: 10, risk: '中' },
  { name: '丰泽园', lastOrder: '2023-12-05', daysSince: 18, avgInterval: 5, risk: '中' },
];

const CustomerAnalysisPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('month');

  const pieConfig = {
    data: customerDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name}: {value}家',
    },
    color: ['#faad14', '#1890ff', '#52c41a'],
    statistic: {
      title: {
        content: '总客户',
      },
      content: {
        content: '86家',
      },
    },
  };

  const columnConfig = {
    data: monthlyGrowth.flatMap((item) => [
      { month: item.month, value: item.newCustomers, type: '新增客户' },
      { month: item.month, value: item.activeCustomers, type: '活跃客户' },
    ]),
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    color: ['#52c41a', '#1890ff'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  const barConfig = {
    data: productPreference,
    xField: 'percentage',
    yField: 'product',
    color: '#D4380D',
    label: {
      position: 'right' as const,
      content: (datum: any) => `${datum.percentage}%`,
    },
    barStyle: {
      radius: [0, 4, 4, 0],
    },
  };

  const radarData = customerProfile.flatMap((item) => [
    { item: item.item, score: item.VIP, type: 'VIP客户' },
    { item: item.item, score: item.普通, type: '普通客户' },
    { item: item.item, score: item.新客户, type: '新客户' },
  ]);

  const radarConfig = {
    data: radarData,
    xField: 'item',
    yField: 'score',
    seriesField: 'type',
    meta: {
      score: { min: 0, max: 100 },
    },
    color: ['#faad14', '#1890ff', '#52c41a'],
    point: { size: 2 },
    area: {},
  };

  const rankColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => {
        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
        return (
          <div
            className={styles.rankBadge}
            style={{ background: index < 3 ? colors[index] : '#f0f0f0' }}
          >
            {index + 1}
          </div>
        );
      },
    },
    {
      title: '客户',
      key: 'name',
      render: (_: any, record: any) => (
        <Space>
          <Text strong>{record.name}</Text>
          <Tag color={record.type === 'VIP' ? 'gold' : record.type === '新客户' ? 'green' : 'default'}>
            {record.type}
          </Tag>
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
    {
      title: '增长',
      dataIndex: 'growth',
      key: 'growth',
      render: (g: number) => (
        <span style={{ color: g > 0 ? '#52c41a' : '#999' }}>
          {g > 0 ? `+${g}%` : '-'}
        </span>
      ),
    },
  ];

  const churnColumns = [
    {
      title: '客户',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '最后下单',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
    },
    {
      title: '已过天数',
      dataIndex: 'daysSince',
      key: 'daysSince',
      render: (days: number) => <Text style={{ color: days > 30 ? '#ff4d4f' : '#faad14' }}>{days}天</Text>,
    },
    {
      title: '平均间隔',
      dataIndex: 'avgInterval',
      key: 'avgInterval',
      render: (days: number) => `${days}天`,
    },
    {
      title: '流失风险',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk: string) => (
        <Tag color={risk === '高' ? 'error' : 'warning'}>{risk}风险</Tag>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '客户分析',
        subTitle: '深入了解客户画像与消费行为',
      }}
    >
      <div className={styles.analysis}>
        {/* 核心指标 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><TeamOutlined /> 客户总数</Space>}
                value={86}
                suffix="家"
              />
              <div className={styles.statExtra}>
                <Text type="secondary">本月新增 </Text>
                <Text style={{ color: '#52c41a' }}>+9</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><CrownOutlined style={{ color: '#faad14' }} /> VIP客户</Space>}
                value={12}
                suffix="家"
              />
              <div className={styles.statExtra}>
                <Progress percent={14} size="small" showInfo={false} strokeColor="#faad14" />
                <Text type="secondary">占比 14%</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={<Space><RiseOutlined style={{ color: '#52c41a' }} /> 活跃客户</Space>}
                value={68}
                suffix="家"
              />
              <div className={styles.statExtra}>
                <Progress percent={79} size="small" showInfo={false} strokeColor="#52c41a" />
                <Text type="secondary">活跃率 79%</Text>
              </div>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="平均客单价"
                value={625}
                prefix="¥"
              />
              <div className={styles.statExtra}>
                <Text type="secondary">较上月 </Text>
                <Text style={{ color: '#52c41a' }}>+3.2%</Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 客户分布与增长趋势 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={8}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>客户类型分布</Title>}
              bordered={false}
            >
              <Pie {...pieConfig} height={280} />
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>客户增长趋势</Title>}
              bordered={false}
              extra={
                <Segmented
                  options={['月', '季', '年']}
                  value={period === 'month' ? '月' : period === 'quarter' ? '季' : '年'}
                  onChange={(v) => setPeriod(v === '月' ? 'month' : v === '季' ? 'quarter' : 'year')}
                />
              }
            >
              <Column {...columnConfig} height={280} />
            </Card>
          </Col>
        </Row>

        {/* 客户排行与画像 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <Space>
                  <CrownOutlined style={{ color: '#faad14' }} />
                  <Title level={5} style={{ margin: 0 }}>客户消费排行</Title>
                </Space>
              }
              bordered={false}
            >
              <Table
                dataSource={customerRanking}
                columns={rankColumns}
                rowKey="name"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>客户画像分析</Title>}
              bordered={false}
            >
              <Radar {...radarConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 商品偏好与流失预警 */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>客户商品偏好</Title>}
              bordered={false}
            >
              <Bar {...barConfig} height={280} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <span style={{ color: '#ff4d4f' }}>⚠️</span>
                  <Title level={5} style={{ margin: 0 }}>流失预警客户</Title>
                </Space>
              }
              bordered={false}
              extra={<Text type="secondary">{churnRiskCustomers.length}位客户需要关注</Text>}
            >
              <Table
                dataSource={churnRiskCustomers}
                columns={churnColumns}
                rowKey="name"
                pagination={false}
                size="middle"
              />
              <div className={styles.churnTip}>
                <Text type="secondary">
                  💡 建议：对流失风险客户进行回访，了解需求变化，提供优惠促销
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default CustomerAnalysisPage;

