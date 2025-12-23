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
import { Badge, Card, Col, Progress, Row, Statistic, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import styles from './index.less';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>({});
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        overviewRes,
        salesTrendRes,
        categorySalesRes,
        weeklyRes,
        alertsRes,
        ordersRes,
        topRes,
      ] = await Promise.all([
        dashboardApi.getOverview(),
        dashboardApi.getSalesTrend(30),
        dashboardApi.getCategorySales(),
        dashboardApi.getWeeklySales(),
        dashboardApi.getInventoryAlerts(),
        dashboardApi.getRecentOrders(5),
        dashboardApi.getTopProducts(5),
      ]);
      
      setOverview(overviewRes || {});
      setSalesData(salesTrendRes || []);
      setCategoryData(categorySalesRes || []);
      setWeeklyData(weeklyRes || []);
      setInventoryAlerts(alertsRes || []);
      setRecentOrders(ordersRes || []);
      setTopProducts(topRes || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

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
      return { fill: colors[datum.type] || 'l(270) 0:rgba(212, 56, 13, 0.3) 1:rgba(212, 56, 13, 0.01)' };
    },
  };

  const totalCategorySales = categoryData.reduce((sum, item) => sum + (item.value || 0), 0);

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
        content: totalCategorySales.toLocaleString(),
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
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text: string) => <Text strong style={{ color: '#D4380D' }}>{text}</Text>,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (amount: number) => <Text strong>¥{(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: '数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (qty: number) => `${qty || 0}只`,
    },
    {
      title: '时间',
      dataIndex: 'orderAt',
      key: 'orderAt',
      render: (time: string) => dayjs(time).format('HH:mm'),
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
          cancelled: { color: 'default', text: '已取消' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>;
      },
    },
  ];

  // 计算趋势（简化处理）
  const salesTrend = overview.salesTrend || 0;
  const orderTrend = overview.orderTrend || 0;
  const stockTrend = overview.stockTrend || 0;
  const customerTrend = overview.newCustomers || 0;

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
            <Card className={styles.statCard} bordered={false} loading={loading}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #D4380D 0%, #FA541C 100%)' }}>
                  <DollarOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">今日销售额</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={overview.todaySales || 0}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={salesTrend >= 0 ? styles.trendUp : styles.trendDown}>
                      {salesTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(salesTrend)}%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={Math.min(100, (overview.todaySales / (overview.salesTarget || 50000)) * 100)}
                strokeColor={{ '0%': '#D4380D', '100%': '#FA541C' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false} loading={loading}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #FA8C16 0%, #FAAD14 100%)' }}>
                  <ShoppingCartOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">今日订单数</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={overview.todayOrders || 0}
                      suffix="单"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={orderTrend >= 0 ? styles.trendUp : styles.trendDown}>
                      {orderTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(orderTrend)}%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={Math.min(100, (overview.todayOrders / (overview.orderTarget || 150)) * 100)}
                strokeColor={{ '0%': '#FA8C16', '100%': '#FAAD14' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false} loading={loading}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)' }}>
                  <StockOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">当前库存</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={overview.totalStock || 0}
                      suffix="只"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={stockTrend >= 0 ? styles.trendUp : styles.trendDown}>
                      {stockTrend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(stockTrend)}%
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>较昨日</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={Math.min(100, (overview.totalStock / (overview.stockCapacity || 2000)) * 100)}
                strokeColor={{ '0%': '#52C41A', '100%': '#73D13D' }}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={styles.statCard} bordered={false} loading={loading}>
              <div className={styles.statCardInner}>
                <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #1890FF 0%, #40A9FF 100%)' }}>
                  <TeamOutlined />
                </div>
                <div className={styles.statContent}>
                  <Text type="secondary">活跃客户</Text>
                  <div className={styles.statValue}>
                    <Statistic
                      value={overview.activeCustomers || 0}
                      suffix="家"
                      valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#262626' }}
                    />
                  </div>
                  <div className={styles.statTrend}>
                    <span className={styles.trendUp}>
                      <ArrowUpOutlined /> {customerTrend}
                    </span>
                    <Text type="secondary" style={{ marginLeft: 8 }}>新增客户</Text>
                  </div>
                </div>
              </div>
              <Progress
                percent={Math.min(100, (overview.activeCustomers / (overview.totalCustomers || 100)) * 100)}
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
              loading={loading}
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
                  <Badge count={inventoryAlerts.filter(a => a.alertLevel === 'critical').length} style={{ backgroundColor: '#ff4d4f' }}>
                    <Tag color="error">需紧急补货</Tag>
                  </Badge>
                </div>
              }
              bordered={false}
              className={styles.chartCard}
              loading={loading}
            >
              <div className={styles.alertList}>
                {inventoryAlerts.length > 0 ? inventoryAlerts.map((item) => (
                  <div key={item.id} className={styles.alertItem}>
                    <div className={styles.alertInfo}>
                      <Badge
                        status={item.alertLevel === 'critical' ? 'error' : 'warning'}
                        text={<Text strong>{item.product?.name || item.productName}</Text>}
                      />
                      <Text type="secondary" style={{ marginLeft: 12 }}>
                        当前: <Text strong style={{ color: item.alertLevel === 'critical' ? '#ff4d4f' : '#faad14' }}>{item.currentStock}只</Text>
                        {' '}/{' '}最低: {item.minStock}只
                      </Text>
                    </div>
                    <Progress
                      percent={(item.currentStock / item.minStock) * 100}
                      size="small"
                      status={item.alertLevel === 'critical' ? 'exception' : 'normal'}
                      strokeColor={item.alertLevel === 'critical' ? '#ff4d4f' : '#faad14'}
                      style={{ width: 120 }}
                      format={() => `${((item.currentStock / item.minStock) * 100).toFixed(0)}%`}
                    />
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                    暂无库存预警
                  </div>
                )}
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
              loading={loading}
            >
              <Table
                dataSource={recentOrders}
                columns={orderColumns}
                rowKey="id"
                pagination={false}
                size="middle"
                locale={{ emptyText: '暂无订单' }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card
              title={<Title level={5} style={{ margin: 0 }}>热销排行榜</Title>}
              bordered={false}
              className={styles.chartCard}
              extra={<Text type="secondary">本月</Text>}
              loading={loading}
            >
              <div className={styles.rankList}>
                {topProducts.length > 0 ? topProducts.map((item, index) => (
                  <div key={item.productId || index} className={styles.rankItem}>
                    <div className={styles.rankNumber} data-rank={index + 1}>
                      {index + 1}
                    </div>
                    <div className={styles.rankInfo}>
                      <Text strong>{item.productName || item.name}</Text>
                      <Text type="secondary">销量: {item.totalQuantity || item.sales}只</Text>
                    </div>
                    <div className={styles.rankAmount}>
                      ¥{(item.totalAmount || item.amount || 0).toLocaleString()}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                    暂无销售数据
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;

