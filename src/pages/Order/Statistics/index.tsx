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
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { orderApi, dashboardApi, customerApi } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const OrderStatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('week');
  const [loading, setLoading] = useState(false);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [productRanking, setProductRanking] = useState<any[]>([]);
  const [customerRanking, setCustomerRanking] = useState<any[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
  const [activeCustomers, setActiveCustomers] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取销售趋势
      const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const trendData = await dashboardApi.getSalesTrend(days);
      if (trendData && trendData.length > 0) {
        setSalesTrend(trendData.map((item: any) => ({
          date: item.date ? dayjs(item.date).format('MM-DD') : '',
          sales: item.totalAmount || 0,
          orders: item.orderCount || 0,
          avgPrice: item.orderCount ? Math.round((item.totalAmount || 0) / item.orderCount) : 0,
        })));
      }

      // 获取分类销售
      const categoryData = await dashboardApi.getCategorySales();
      if (categoryData && categoryData.length > 0) {
        const totalSales = categoryData.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);
        setCategorySales(categoryData.map((item: any) => ({
          category: item.categoryName || item.name,
          sales: item.totalAmount || 0,
          quantity: item.totalQuantity || 0,
          percentage: totalSales ? Math.round(((item.totalAmount || 0) / totalSales) * 100) : 0,
        })));
      }

      // 获取商品排行
      const topProducts = await dashboardApi.getTopProducts(7);
      if (topProducts && topProducts.length > 0) {
        setProductRanking(topProducts.map((item: any, index: number) => ({
          rank: index + 1,
          name: item.productName || item.name,
          category: item.categoryName || '',
          quantity: item.totalQuantity || 0,
          amount: item.totalAmount || 0,
          growth: item.growth || 0,
        })));
      }

      // 获取客户分析
      const customerData = await customerApi.getAnalysis();
      if (customerData?.topCustomers) {
        setCustomerRanking(customerData.topCustomers.slice(0, 5).map((item: any, index: number) => ({
          rank: index + 1,
          name: item.name,
          orders: item.totalOrders || 0,
          amount: item.totalAmount || 0,
          category: item.level === 'vip' || item.level === 'svip' ? 'VIP' : '普通',
        })));
        setActiveCustomers(customerData.activeCount || 0);
      }

      // 默认时段分布
      setHourlyDistribution([
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
      ]);

    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

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
  const totalSales = salesTrend.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesTrend.reduce((sum, item) => sum + item.orders, 0);
  const totalStats = {
    sales: totalSales,
    orders: totalOrders,
    avgPrice: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
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
                value={activeCustomers}
                suffix={
                  <span>
                    家
                  </span>
                }
              />
              <div className={styles.customerProgress}>
                <Text type="secondary">客户活跃情况</Text>
                <Progress percent={Math.min(activeCustomers * 2, 100)} size="small" strokeColor="#1890ff" />
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

