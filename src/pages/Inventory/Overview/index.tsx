import { Column, Liquid, Pie } from '@ant-design/charts';
import {
  AlertOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BoxPlotOutlined,
  ShoppingOutlined,
  StockOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Badge,
  Card,
  Col,
  Progress,
  Row,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

// 库存概览数据
const inventoryStats = {
  totalStock: 1580,
  todayIn: 320,
  todayOut: 185,
  lowStockCount: 4,
  totalValue: 89500,
  turnoverRate: 72,
};

// 分类库存数据
const categoryStock = [
  { category: '土鸡', stock: 156, percentage: 10 },
  { category: '三黄鸡', stock: 280, percentage: 18 },
  { category: '乌鸡', stock: 42, percentage: 3 },
  { category: '麻鸭', stock: 18, percentage: 1 },
  { category: '番鸭', stock: 95, percentage: 6 },
  { category: '肉鸽', stock: 165, percentage: 10 },
  { category: '大白鹅', stock: 85, percentage: 5 },
];

// 库存走势
const stockTrend = [
  { date: '12-17', inbound: 280, outbound: 195 },
  { date: '12-18', inbound: 350, outbound: 220 },
  { date: '12-19', inbound: 190, outbound: 180 },
  { date: '12-20', inbound: 420, outbound: 310 },
  { date: '12-21', inbound: 280, outbound: 240 },
  { date: '12-22', inbound: 380, outbound: 285 },
  { date: '12-23', inbound: 320, outbound: 185 },
];

// 饼图数据
const pieData = [
  { type: '鸡类', value: 478 },
  { type: '鸭类', value: 213 },
  { type: '鸽类', value: 165 },
  { type: '鹅类', value: 85 },
  { type: '其他', value: 42 },
];

// 库存预警列表
const alertList = [
  { id: 1, name: '麻鸭', category: '鸭类', current: 18, min: 30, status: 'critical', supplier: '高邮鸭业养殖合作社' },
  { id: 2, name: '土鸡', category: '鸡类', current: 25, min: 50, status: 'critical', supplier: '盐城绿源农场' },
  { id: 3, name: '乌鸡', category: '鸡类', current: 42, min: 40, status: 'warning', supplier: '泰和乌鸡养殖场' },
  { id: 4, name: '肉鸽', category: '鸽类', current: 65, min: 60, status: 'warning', supplier: '金华鸽业有限公司' },
];

// 最近出入库记录
const recentRecords = [
  { time: '11:30', type: 'out', product: '土鸡', quantity: 15, operator: '张三', customer: '王府酒家' },
  { time: '10:45', type: 'in', product: '三黄鸡', quantity: 50, operator: '李四', supplier: '清远鸡业' },
  { time: '10:20', type: 'out', product: '麻鸭', quantity: 8, operator: '张三', customer: '福满楼' },
  { time: '09:30', type: 'in', product: '肉鸽', quantity: 80, operator: '王五', supplier: '金华鸽业' },
  { time: '09:00', type: 'out', product: '番鸭', quantity: 12, operator: '张三', customer: '李氏餐馆' },
];

const InventoryOverviewPage: React.FC = () => {
  const columnConfig = {
    data: stockTrend.flatMap((item) => [
      { date: item.date, value: item.inbound, type: '入库' },
      { date: item.date, value: item.outbound, type: '出库' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    color: ['#52c41a', '#ff4d4f'],
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top' as const,
      style: { fontSize: 10 },
    },
  };

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    label: {
      type: 'outer',
      content: '{name}: {value}只',
    },
    color: ['#D4380D', '#FA8C16', '#52C41A', '#1890FF', '#722ED1'],
    statistic: {
      title: {
        content: '总库存',
      },
      content: {
        content: `${inventoryStats.totalStock}只`,
      },
    },
  };

  const liquidConfig = {
    percent: inventoryStats.turnoverRate / 100,
    outline: {
      border: 2,
      distance: 4,
    },
    wave: {
      length: 128,
    },
    color: '#52c41a',
  };

  const alertColumns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.category}</Text>
        </div>
      ),
    },
    {
      title: '当前库存',
      dataIndex: 'current',
      key: 'current',
      render: (current: number, record: any) => (
        <Text strong style={{ color: record.status === 'critical' ? '#ff4d4f' : '#faad14' }}>
          {current}只
        </Text>
      ),
    },
    {
      title: '预警线',
      dataIndex: 'min',
      key: 'min',
      render: (min: number) => <Text>{min}只</Text>,
    },
    {
      title: '库存比',
      key: 'ratio',
      render: (_: any, record: any) => (
        <Progress
          percent={Math.round((record.current / record.min) * 100)}
          size="small"
          status={record.status === 'critical' ? 'exception' : 'normal'}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier: string) => <Text type="secondary">{supplier}</Text>,
    },
  ];

  return (
    <PageContainer
      header={{
        title: '库存概览',
        subTitle: '实时监控库存状态',
      }}
    >
      <div className={styles.overview}>
        {/* 顶部统计卡片 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="当前总库存"
                value={inventoryStats.totalStock}
                suffix="只"
                prefix={<StockOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="今日入库"
                value={inventoryStats.todayIn}
                suffix="只"
                prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="今日出库"
                value={inventoryStats.todayOut}
                suffix="只"
                prefix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="预警商品"
                value={inventoryStats.lowStockCount}
                suffix="种"
                prefix={<AlertOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="库存总价值"
                value={inventoryStats.totalValue}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#D4380D' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="周转率"
                value={inventoryStats.turnoverRate}
                suffix="%"
                prefix={<BoxPlotOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={16}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>近7天出入库趋势</Title>}
              bordered={false}
            >
              <Column {...columnConfig} height={300} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>分类库存占比</Title>}
              bordered={false}
            >
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* 预警和动态 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertOutlined style={{ color: '#ff4d4f' }} />
                  <Title level={5} style={{ margin: 0 }}>库存预警</Title>
                  <Badge count={alertList.length} style={{ marginLeft: 8 }} />
                </div>
              }
              bordered={false}
              extra={<a href="/inventory/alert">查看全部</a>}
            >
              <Table
                dataSource={alertList}
                columns={alertColumns}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>今日出入库动态</Title>}
              bordered={false}
              className={styles.timelineCard}
            >
              <Timeline
                items={recentRecords.map((record) => ({
                  color: record.type === 'in' ? 'green' : 'red',
                  children: (
                    <div className={styles.timelineItem}>
                      <div className={styles.timelineHeader}>
                        <Tag color={record.type === 'in' ? 'success' : 'error'}>
                          {record.type === 'in' ? '入库' : '出库'}
                        </Tag>
                        <Text type="secondary">{record.time}</Text>
                      </div>
                      <Text>
                        <Text strong>{record.product}</Text>
                        {' '}{record.type === 'in' ? '入库' : '出库'}{' '}
                        <Text strong style={{ color: record.type === 'in' ? '#52c41a' : '#ff4d4f' }}>
                          {record.quantity}只
                        </Text>
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.type === 'in' ? `供应商: ${record.supplier}` : `客户: ${record.customer}`}
                        {' · '}操作员: {record.operator}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>

        {/* 分类库存详情 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>各品类库存详情</Title>}
          bordered={false}
          style={{ marginTop: 16 }}
        >
          <Row gutter={[16, 16]}>
            {categoryStock.map((item) => (
              <Col xs={12} sm={8} md={6} lg={4} xl={3} key={item.category}>
                <div className={styles.categoryItem}>
                  <Text strong>{item.category}</Text>
                  <div className={styles.stockValue}>{item.stock}只</div>
                  <Progress
                    percent={item.percentage}
                    size="small"
                    strokeColor="#D4380D"
                    format={(p) => `${p}%`}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
    </PageContainer>
  );
};

export default InventoryOverviewPage;

