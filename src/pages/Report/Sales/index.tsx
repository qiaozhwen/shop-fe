import { Area, Column, DualAxes, Pie } from '@ant-design/charts';
import {
  CalendarOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
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
import { reportApi, dashboardApi } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const SalesReportPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('month');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dailySalesData, setDailySalesData] = useState<any[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<any[]>([]);
  const [productSalesRanking, setProductSalesRanking] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalSales: 0, totalOrders: 0, totalQuantity: 0 });

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // 获取销售趋势
      const trendData = await dashboardApi.getSalesTrend(14);
      if (trendData && trendData.length > 0) {
        setDailySalesData(trendData.map((item: any) => ({
          date: item.date ? dayjs(item.date).format('MM-DD') : '',
          sales: item.totalAmount || 0,
          orders: item.orderCount || 0,
          quantity: item.totalQuantity || 0,
        })));
      }

      // 获取分类销售
      const categoryData = await dashboardApi.getCategorySales();
      if (categoryData && categoryData.length > 0) {
        const totalSales = categoryData.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);
        setCategorySalesData(categoryData.map((item: any) => ({
          category: item.categoryName || item.name,
          sales: item.totalAmount || 0,
          quantity: item.totalQuantity || 0,
          avgPrice: item.totalQuantity ? Math.round((item.totalAmount || 0) / item.totalQuantity) : 0,
          percentage: totalSales ? Math.round(((item.totalAmount || 0) / totalSales) * 100) : 0,
        })));
      }

      // 获取商品排行
      const topProducts = await dashboardApi.getTopProducts(10);
      if (topProducts && topProducts.length > 0) {
        setProductSalesRanking(topProducts.map((item: any, index: number) => ({
          rank: index + 1,
          name: item.productName || item.name,
          category: item.categoryName || '',
          quantity: item.totalQuantity || 0,
          sales: item.totalAmount || 0,
          growth: item.growth || 0,
        })));
      }

      // 使用默认时段数据
      setHourlyData([
        { hour: '06:00', sales: 8500, orders: 12 },
        { hour: '07:00', sales: 15600, orders: 22 },
        { hour: '08:00', sales: 28800, orders: 45 },
        { hour: '09:00', sales: 35200, orders: 58 },
        { hour: '10:00', sales: 42500, orders: 72 },
        { hour: '11:00', sales: 38600, orders: 65 },
        { hour: '12:00', sales: 25800, orders: 42 },
        { hour: '13:00', sales: 18500, orders: 28 },
        { hour: '14:00', sales: 22800, orders: 35 },
        { hour: '15:00', sales: 32500, orders: 52 },
        { hour: '16:00', sales: 38200, orders: 62 },
        { hour: '17:00', sales: 28500, orders: 45 },
        { hour: '18:00', sales: 15800, orders: 22 },
      ]);

    } catch (error) {
      console.error('获取报表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [period, dateRange]);

  const dualAxesConfig = {
    data: [dailySalesData, dailySalesData],
    xField: 'date',
    yField: ['sales', 'orders'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#D4380D',
        columnStyle: {
          radius: [4, 4, 0, 0],
        },
      },
      {
        geometry: 'line',
        color: '#1890ff',
        lineStyle: {
          lineWidth: 2,
        },
        point: {
          size: 3,
        },
      },
    ],
    meta: {
      sales: {
        alias: '销售额',
        formatter: (v: number) => `¥${(v / 1000).toFixed(1)}k`,
      },
      orders: {
        alias: '订单数',
      },
    },
  };

  const categoryPieConfig = {
    data: categorySalesData.map((item) => ({ type: item.category, value: item.sales })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name}\n{percentage}',
    },
    color: ['#D4380D', '#FA8C16', '#52C41A', '#1890FF'],
    statistic: {
      title: {
        content: '总销售额',
      },
      content: {
        content: '¥594,600',
        style: { fontSize: '18px' },
      },
    },
  };

  const hourlyColumnConfig = {
    data: hourlyData,
    xField: 'hour',
    yField: 'sales',
    color: '#FA8C16',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top' as const,
      formatter: (datum: any) => `¥${(datum.sales / 1000).toFixed(0)}k`,
      style: {
        fontSize: 10,
      },
    },
  };

  const categoryColumns = [
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Text strong>{category}</Text>,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => <Text strong style={{ color: '#D4380D' }}>¥{sales.toLocaleString()}</Text>,
    },
    {
      title: '销量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => `${quantity}只`,
    },
    {
      title: '均价',
      dataIndex: 'avgPrice',
      key: 'avgPrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Tag color={percentage > 30 ? 'red' : percentage > 15 ? 'orange' : 'blue'}>
          {percentage}%
        </Tag>
      ),
    },
  ];

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
        <Space>
          <Text strong>{record.name}</Text>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      ),
    },
    {
      title: '销量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => `${quantity}只`,
    },
    {
      title: '销售额',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales: number) => <Text strong style={{ color: '#D4380D' }}>¥{sales.toLocaleString()}</Text>,
    },
    {
      title: '环比',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Text style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth >= 0 ? '+' : ''}{growth}%
        </Text>
      ),
    },
  ];

  // 计算统计数据
  const totalSales = dailySalesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = dailySalesData.reduce((sum, item) => sum + item.orders, 0);
  const totalQuantity = dailySalesData.reduce((sum, item) => sum + item.quantity, 0);
  const avgOrderValue = Math.round(totalSales / totalOrders);

  return (
    <PageContainer
      header={{
        title: '销售报表',
        subTitle: '销售数据分析与统计',
      }}
    >
      <div className={styles.report}>
        {/* 筛选区域 */}
        <Card bordered={false} style={{ marginBottom: 16 }}>
          <Space size="large" wrap>
            <Space>
              <CalendarOutlined />
              <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)}>
                <Radio.Button value="week">本周</Radio.Button>
                <Radio.Button value="month">本月</Radio.Button>
                <Radio.Button value="quarter">本季度</Radio.Button>
                <Radio.Button value="year">本年</Radio.Button>
              </Radio.Group>
            </Space>
            <RangePicker value={dateRange} onChange={setDateRange} />
            <Select
              placeholder="选择门店"
              style={{ width: 150 }}
              options={[{ value: 'all', label: '全部门店' }]}
              defaultValue="all"
            />
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
                title="总销售额"
                value={totalSales}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#D4380D' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                环比 <Text style={{ color: '#52c41a' }}>+12.5%</Text>
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="订单总数"
                value={totalOrders}
                suffix="单"
                valueStyle={{ color: '#FA8C16' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                环比 <Text style={{ color: '#52c41a' }}>+8.3%</Text>
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="销售数量"
                value={totalQuantity}
                suffix="只"
                valueStyle={{ color: '#52C41A' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                环比 <Text style={{ color: '#52c41a' }}>+10.2%</Text>
              </Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title="平均客单价"
                value={avgOrderValue}
                prefix="¥"
                valueStyle={{ color: '#1890FF' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                环比 <Text style={{ color: '#ff4d4f' }}>-2.1%</Text>
              </Text>
            </Card>
          </Col>
        </Row>

        {/* 销售趋势 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>销售趋势</Title>}
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <DualAxes {...dualAxesConfig} height={350} />
        </Card>

        {/* 品类分析和时段分布 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>品类销售分布</Title>}
              bordered={false}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Pie {...categoryPieConfig} height={280} />
                </Col>
                <Col span={12}>
                  <Table
                    dataSource={categorySalesData}
                    columns={categoryColumns.slice(0, 3)}
                    rowKey="category"
                    pagination={false}
                    size="small"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>时段销售分布</Title>}
              bordered={false}
            >
              <Column {...hourlyColumnConfig} height={280} />
            </Card>
          </Col>
        </Row>

        {/* 商品销售排行 */}
        <Card
          title={<Title level={5} style={{ margin: 0 }}>商品销售排行</Title>}
          bordered={false}
          extra={<Text type="secondary">{period === 'month' ? '本月' : period === 'week' ? '本周' : ''}数据</Text>}
        >
          <Table
            dataSource={productSalesRanking}
            columns={productColumns}
            rowKey="rank"
            pagination={false}
            size="middle"
          />
        </Card>
      </div>
    </PageContainer>
  );
};

export default SalesReportPage;

