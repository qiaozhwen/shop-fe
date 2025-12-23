import { Column, Line, Pie } from '@ant-design/charts';
import {
  AlertOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import React from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 库存变动趋势
const inventoryTrend = [
  { date: '12-17', inbound: 280, outbound: 195, balance: 1520 },
  { date: '12-18', inbound: 350, outbound: 220, balance: 1650 },
  { date: '12-19', inbound: 190, outbound: 180, balance: 1660 },
  { date: '12-20', inbound: 420, outbound: 310, balance: 1770 },
  { date: '12-21', inbound: 280, outbound: 240, balance: 1810 },
  { date: '12-22', inbound: 380, outbound: 285, balance: 1905 },
  { date: '12-23', inbound: 320, outbound: 185, balance: 2040 },
];

// 品类库存分布
const categoryInventory = [
  { category: '鸡类', stock: 856, percentage: 42, value: 38520 },
  { category: '鸭类', stock: 528, percentage: 26, value: 19536 },
  { category: '鸽类', stock: 385, percentage: 19, value: 17325 },
  { category: '鹅类', stock: 268, percentage: 13, value: 34304 },
];

// 商品库存明细
const inventoryDetail = [
  { name: '三黄鸡', category: '鸡类', stock: 280, minStock: 80, maxStock: 400, status: 'normal', turnover: 12.5 },
  { name: '散养土鸡', category: '鸡类', stock: 156, minStock: 50, maxStock: 200, status: 'normal', turnover: 15.2 },
  { name: '肉鸽', category: '鸽类', stock: 165, minStock: 60, maxStock: 200, status: 'normal', turnover: 8.6 },
  { name: '番鸭', category: '鸭类', stock: 95, minStock: 40, maxStock: 150, status: 'normal', turnover: 6.8 },
  { name: '大白鹅', category: '鹅类', stock: 85, minStock: 20, maxStock: 100, status: 'normal', turnover: 4.2 },
  { name: '乌鸡', category: '鸡类', stock: 42, minStock: 40, maxStock: 120, status: 'warning', turnover: 7.5 },
  { name: '麻鸭', category: '鸭类', stock: 18, minStock: 30, maxStock: 100, status: 'critical', turnover: 10.8 },
  { name: '珍珠鸡', category: '鸡类', stock: 35, minStock: 20, maxStock: 80, status: 'normal', turnover: 3.2 },
];

// 周转率排行
const turnoverRanking = [
  { name: '散养土鸡', turnover: 15.2, avgDays: 2.4 },
  { name: '三黄鸡', turnover: 12.5, avgDays: 2.9 },
  { name: '麻鸭', turnover: 10.8, avgDays: 3.4 },
  { name: '肉鸽', turnover: 8.6, avgDays: 4.2 },
  { name: '乌鸡', turnover: 7.5, avgDays: 4.8 },
];

const InventoryReportPage: React.FC = () => {
  const lineConfig = {
    data: inventoryTrend,
    xField: 'date',
    yField: 'balance',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle',
    },
    area: {
      style: {
        fill: 'l(270) 0:rgba(24, 144, 255, 0.3) 1:rgba(24, 144, 255, 0.01)',
      },
    },
    label: {
      formatter: (datum: any) => `${datum.balance}`,
    },
  };

  const columnConfig = {
    data: inventoryTrend.flatMap((item) => [
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
  };

  const pieConfig = {
    data: categoryInventory.map((item) => ({ type: item.category, value: item.stock })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name}: {value}只',
    },
    color: ['#D4380D', '#FA8C16', '#52C41A', '#1890FF'],
    statistic: {
      title: {
        content: '总库存',
      },
      content: {
        content: '2,037只',
      },
    },
  };

  const inventoryColumns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: any) => (
        <Space>
          <Text strong>{record.name}</Text>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      ),
    },
    {
      title: '当前库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number, record: any) => (
        <Badge status={record.status === 'critical' ? 'error' : record.status === 'warning' ? 'warning' : 'success'}>
          <Text strong style={{ 
            color: record.status === 'critical' ? '#ff4d4f' : record.status === 'warning' ? '#faad14' : '#52c41a' 
          }}>
            {stock}只
          </Text>
        </Badge>
      ),
    },
    {
      title: '安全库存',
      key: 'safeStock',
      render: (_: any, record: any) => (
        <Text type="secondary">{record.minStock} - {record.maxStock}</Text>
      ),
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          normal: { color: 'success', text: '正常' },
          warning: { color: 'warning', text: '预警' },
          critical: { color: 'error', text: '紧急' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: '库存比',
      key: 'ratio',
      render: (_: any, record: any) => {
        const ratio = Math.round((record.stock / record.maxStock) * 100);
        return (
          <Progress
            percent={ratio}
            size="small"
            strokeColor={ratio < 30 ? '#ff4d4f' : ratio < 50 ? '#faad14' : '#52c41a'}
            style={{ width: 100 }}
          />
        );
      },
    },
    {
      title: '周转率',
      dataIndex: 'turnover',
      key: 'turnover',
      sorter: (a: any, b: any) => a.turnover - b.turnover,
      render: (turnover: number) => <Text>{turnover}次/月</Text>,
    },
  ];

  const turnoverColumns = [
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
      title: '商品',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '周转率',
      dataIndex: 'turnover',
      key: 'turnover',
      render: (turnover: number) => <Text style={{ color: '#1890ff' }}>{turnover}次/月</Text>,
    },
    {
      title: '平均库存天数',
      dataIndex: 'avgDays',
      key: 'avgDays',
      render: (days: number) => `${days}天`,
    },
  ];

  // 统计数据
  const totalStock = categoryInventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = categoryInventory.reduce((sum, item) => sum + item.value, 0);
  const alertCount = inventoryDetail.filter((item) => item.status !== 'normal').length;
  const avgTurnover = (inventoryDetail.reduce((sum, item) => sum + item.turnover, 0) / inventoryDetail.length).toFixed(1);

  return (
    <PageContainer
      header={{
        title: '库存报表',
        subTitle: '库存数据分析与统计',
      }}
    >
      <div className={styles.report}>
        {/* 筛选区域 */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <RangePicker />
            <Select
              placeholder="选择品类"
              style={{ width: 150 }}
              options={[
                { value: 'all', label: '全部品类' },
                { value: 'chicken', label: '鸡类' },
                { value: 'duck', label: '鸭类' },
                { value: 'pigeon', label: '鸽类' },
                { value: 'goose', label: '鹅类' },
              ]}
              defaultValue="all"
            />
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button type="primary" icon={<DownloadOutlined />}>
              导出报表
            </Button>
            <Button icon={<PrinterOutlined />}>
              打印
            </Button>
          </Space>
        </Card>

        {/* 核心指标 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="当前总库存"
                value={totalStock}
                suffix="只"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="库存总价值"
                value={totalValue}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="预警商品"
                value={alertCount}
                suffix="种"
                prefix={<AlertOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="平均周转率"
                value={avgTurnover}
                suffix="次/月"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 库存趋势 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>库存余额趋势</Title>}
              bordered={false}
            >
              <Line {...lineConfig} height={280} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>出入库趋势</Title>}
              bordered={false}
            >
              <Column {...columnConfig} height={280} />
            </Card>
          </Col>
        </Row>

        {/* 品类分布和周转排行 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>品类库存分布</Title>}
              bordered={false}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Pie {...pieConfig} height={280} />
                </Col>
                <Col span={12}>
                  <div className={styles.categoryList}>
                    {categoryInventory.map((item) => (
                      <div key={item.category} className={styles.categoryItem}>
                        <div className={styles.categoryHeader}>
                          <Text strong>{item.category}</Text>
                          <Text type="secondary">{item.percentage}%</Text>
                        </div>
                        <Progress
                          percent={item.percentage}
                          strokeColor="#D4380D"
                          showInfo={false}
                        />
                        <div className={styles.categoryMeta}>
                          <Text type="secondary">库存: {item.stock}只</Text>
                          <Text type="secondary">价值: ¥{item.value.toLocaleString()}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>周转率排行</Title>}
              bordered={false}
            >
              <Table
                dataSource={turnoverRanking}
                columns={turnoverColumns}
                rowKey="name"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>

        {/* 库存明细 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>库存明细</Title>}
          bordered={false}
        >
          <Table
            dataSource={inventoryDetail}
            columns={inventoryColumns}
            rowKey="name"
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default InventoryReportPage;

