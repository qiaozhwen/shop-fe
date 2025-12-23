import { Area, Column, Pie } from '@ant-design/charts';
import {
  AlertOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  StockOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Card, Col, Progress, Row, Statistic, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { Title, Text } = Typography;

// 模拟数据
const generateSalesData = () => {
  const data: any[] = [];
  const today = dayjs();
  for (let i = 29; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('MM-DD');
    data.push(
      { date, value: Math.floor(Math.random() * 5000) + 3000, type: '土鸡' },
      { date, value: Math.floor(Math.random() * 4000) + 2000, type: '肉鸭' },
      { date, value: Math.floor(Math.random() * 2000) + 1000, type: '鸽子' },
      { date, value: Math.floor(Math.random() * 1500) + 500, type: '鹅' },
    );
  }
  return data;
};

const categoryData = [
  { type: '土鸡', value: 4500 },
  { type: '三黄鸡', value: 3200 },
  { type: '乌鸡', value: 2100 },
  { type: '麻鸭', value: 2800 },
  { type: '番鸭', value: 1900 },
  { type: '肉鸽', value: 1500 },
  { type: '大白鹅', value: 980 },
];

const weeklyData = [
  { day: '周一', sales: 12500, orders: 45 },
  { day: '周二', sales: 15600, orders: 58 },
  { day: '周三', sales: 18200, orders: 62 },
  { day: '周四', sales: 14800, orders: 51 },
  { day: '周五', sales: 21000, orders: 78 },
  { day: '周六', sales: 28500, orders: 105 },
  { day: '周日', sales: 32000, orders: 125 },
];

const inventoryAlerts = [
  { id: 1, name: '土鸡', current: 25, min: 50, status: 'critical' },
  { id: 2, name: '乌鸡', current: 42, min: 40, status: 'warning' },
  { id: 3, name: '麻鸭', current: 18, min: 30, status: 'critical' },
  { id: 4, name: '肉鸽', current: 65, min: 60, status: 'warning' },
];

const recentOrders = [
  { id: 'ORD202312001', customer: '张记酒楼', amount: 2580, items: 12, time: '10:25', status: 'completed' },
  { id: 'ORD202312002', customer: '李氏餐馆', amount: 1850, items: 8, time: '10:42', status: 'completed' },
  { id: 'ORD202312003', customer: '王府酒家', amount: 3200, items: 15, time: '11:05', status: 'processing' },
  { id: 'ORD202312004', customer: '赵家菜馆', amount: 980, items: 5, time: '11:18', status: 'processing' },
  { id: 'ORD202312005', customer: '福满楼', amount: 4500, items: 22, time: '11:35', status: 'pending' },
];

const topProducts = [
  { rank: 1, name: '散养土鸡', sales: 1250, amount: 56250 },
  { rank: 2, name: '麻鸭', sales: 980, amount: 34300 },
  { rank: 3, name: '三黄鸡', sales: 850, amount: 29750 },
  { rank: 4, name: '肉鸽', sales: 620, amount: 27900 },
  { rank: 5, name: '乌鸡', sales: 450, amount: 22500 },
];

const DashboardPage: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setSalesData(generateSalesData());
      setLoading(false);
    }, 500);
  }, []);

  const areaConfig = {
    data: salesData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1500,
      },
    },
    color: ['#D4380D', '#FA8C16', '#52C41A', '#1890FF'],
    areaStyle: (datum: any) => {
      const colors: any = {
        '土鸡': 'l(270) 0:rgba(212, 56, 13, 0.3) 1:rgba(212, 56, 13, 0.01)',
        '肉鸭': 'l(270) 0:rgba(250, 140, 22, 0.3) 1:rgba(250, 140, 22, 0.01)',
        '鸽子': 'l(270) 0:rgba(82, 196, 26, 0.3) 1:rgba(82, 196, 26, 0.01)',
        '鹅': 'l(270) 0:rgba(24, 144, 255, 0.3) 1:rgba(24, 144, 255, 0.01)',
      };
      return { fill: colors[datum.type] };
    },
  };

  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: {
        content: '总销量',
        style: { fontSize: '14px' },
      },
      content: {
        content: '17,280',
        style: { fontSize: '24px', fontWeight: 'bold' },
      },
    },
    color: ['#D4380D', '#FA541C', '#FA8C16', '#FAAD14', '#52C41A', '#13C2C2', '#1890FF'],
  };

  const columnConfig = {
    data: weeklyData,
    xField: 'day',
    yField: 'sales',
    color: '#D4380D',
    label: {
      position: 'top' as const,
      style: {
        fill: '#595959',
        fontSize: 12,
      },
      formatter: (datum: any) => `¥${(datum.sales / 1000).toFixed(1)}k`,
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <Text strong style={{ color: '#D4380D' }}>{text}</Text>,
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Text strong>¥{amount.toLocaleString()}</Text>,
    },
    {
      title: '数量',
      dataIndex: 'items',
      key: 'items',
      render: (items: number) => `${items}只`,
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          completed: { color: 'success', text: '已完成' },
          processing: { color: 'processing', text: '处理中' },
          pending: { color: 'warning', text: '待处理' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: '工作台',
        subTitle: dayjs().format('YYYY年MM月DD日 dddd'),
      }}
    >
      <div className={styles.dashboard}>
        {/* 核心指标卡片 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #D4380D 0%, #FA541C 100%)' }}>
                  <DollarOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">今日销售额</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={32580}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={styles.trendUp}>
                      <ArrowUpOutlined /> 12.5%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={75}
                strokeColor={{ '0%': '#D4380D', '100%': '#FA541C' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FA8C16 0%, #FAAD14 100%)' }}>
                  <ShoppingCartOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">今日订单数</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={125}
                      suffix="单"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={styles.trendUp}>
                      <ArrowUpOutlined /> 8.3%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={83}
                strokeColor={{ '0%': '#FA8C16', '100%': '#FAAD14' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)' }}>
                  <StockOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">当前库存</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={1580}
                      suffix="只"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={styles.trendDown}>
                      <ArrowDownOutlined /> 5.2%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={68}
                strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)' }}>
                  <TeamOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">活跃客户</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={86}
                      suffix="家"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={styles.trendUp}>
                      <ArrowUpOutlined /> 3
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>新增客户</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={86}
                strokeColor={{ '0%': '#1890FF', '100%': '#40A9FF' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 销售趋势图 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} xl={16}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>近30天销售趋势</Title>}
              bordered={false}
              className={styles.chartCard}
              loading={loading}
            >
              <Area {...areaConfig} height={320} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>品类销量占比</Title>}
              bordered={false}
              className={styles.chartCard}
              loading={loading}
            >
              <Pie {...pieConfig} height={320} />
            </Card>
          </Col>
        </Row>

        {/* 周销售与库存预警 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>本周销售统计</Title>}
              bordered={false}
              className={styles.chartCard}
            >
              <Column {...columnConfig} height={280} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Title level={5} style={{ margin: 0 }}>
                    <AlertOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    库存预警
                  </Title>
                  <Badge count={inventoryAlerts.filter(a => a.status === 'critical').length} style={{ backgroundColor: '#ff4d4f' }}>
                    <Tag color="error">需紧急补货</Tag>
                  </Badge>
                </div>
              }
              bordered={false}
              className={styles.chartCard}
            >
              <div className={styles.alertList}>
                {inventoryAlerts.map((item) => (
                  <div key={item.id} className={styles.alertItem}>
                    <div className={styles.alertInfo}>
                      <Badge
                        status={item.status === 'critical' ? 'error' : 'warning'}
                        text={<Text strong>{item.name}</Text>}
                      />
                      <Text type="secondary" style={{ marginLeft: 12 }}>
                        当前: <Text strong style={{ color: item.status === 'critical' ? '#ff4d4f' : '#faad14' }}>{item.current}只</Text>
                        {' '}/{' '}最低: {item.min}只
                      </Text>
                    </div>
                    <Progress
                      percent={(item.current / item.min) * 100}
                      size="small"
                      status={item.status === 'critical' ? 'exception' : 'normal'}
                      strokeColor={item.status === 'critical' ? '#ff4d4f' : '#faad14'}
                      style={{ width: 120 }}
                      format={() => `${((item.current / item.min) * 100).toFixed(0)}%`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 最近订单与热销排行 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} lg={14}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>最近订单</Title>}
              bordered={false}
              className={styles.chartCard}
              extra={<a href="/order/list">查看全部</a>}
            >
              <Table
                dataSource={recentOrders}
                columns={orderColumns}
                rowKey="id"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>热销排行榜</Title>}
              bordered={false}
              className={styles.chartCard}
              extra={<Text type="secondary">本月</Text>}
            >
              <div className={styles.rankList}>
                {topProducts.map((item) => (
                  <div key={item.rank} className={styles.rankItem}>
                    <div className={styles.rankNumber} data-rank={item.rank}>
                      {item.rank}
                    </div>
                    <div className={styles.rankInfo}>
                      <Text strong>{item.name}</Text>
                      <Text type="secondary">销量: {item.sales}只</Text>
                    </div>
                    <div className={styles.rankAmount}>
                      ¥{item.amount.toLocaleString()}
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

export default DashboardPage;
