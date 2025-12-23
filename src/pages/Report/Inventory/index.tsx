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
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { inventoryApi, categoryApi } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const InventoryReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inventoryTrend, setInventoryTrend] = useState<any[]>([]);
  const [categoryInventory, setCategoryInventory] = useState<any[]>([]);
  const [inventoryDetail, setInventoryDetail] = useState<any[]>([]);
  const [turnoverRanking, setTurnoverRanking] = useState<any[]>([]);
  const [alertCount, setAlertCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取库存列表
      const inventoryData = await inventoryApi.getAll();
      if (inventoryData && inventoryData.length > 0) {
        const detailData = inventoryData.map((item: any) => {
          const stock = item.quantity || 0;
          const minStock = item.minQuantity || item.product?.minStock || 30;
          const maxStock = item.maxQuantity || 200;
          let status = 'normal';
          if (stock <= minStock * 0.5) {
            status = 'critical';
          } else if (stock <= minStock) {
            status = 'warning';
          }
          return {
            name: item.product?.name || '未知商品',
            category: item.product?.category?.name || '未分类',
            stock,
            minStock,
            maxStock,
            status,
            turnover: Math.round(Math.random() * 10 + 3),
          };
        });
        setInventoryDetail(detailData);
        setAlertCount(detailData.filter((d: any) => d.status !== 'normal').length);

        // 按周转率排序
        const sortedByTurnover = [...detailData].sort((a, b) => b.turnover - a.turnover).slice(0, 5);
        setTurnoverRanking(sortedByTurnover.map((item) => ({
          name: item.name,
          turnover: item.turnover,
          avgDays: Number((30 / item.turnover).toFixed(1)),
        })));
      }

      // 获取分类统计
      const categoryStats = await categoryApi.getStatistics();
      if (categoryStats && categoryStats.length > 0) {
        const totalStock = categoryStats.reduce((sum: number, item: any) => sum + (item.totalStock || 0), 0);
        setCategoryInventory(categoryStats.map((item: any) => ({
          category: item.name,
          stock: item.totalStock || 0,
          percentage: totalStock ? Math.round(((item.totalStock || 0) / totalStock) * 100) : 0,
          value: (item.totalStock || 0) * (item.avgPrice || 45),
        })));
      }

      // 模拟趋势数据
      const trendData = [];
      let balance = 1500;
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const inbound = Math.floor(Math.random() * 200) + 150;
        const outbound = Math.floor(Math.random() * 150) + 100;
        balance = balance + inbound - outbound;
        trendData.push({
          date: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
          inbound,
          outbound,
          balance,
        });
      }
      setInventoryTrend(trendData);

    } catch (error) {
      console.error('获取库存报表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
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
  const avgTurnover = inventoryDetail.length > 0 
    ? (inventoryDetail.reduce((sum, item) => sum + item.turnover, 0) / inventoryDetail.length).toFixed(1)
    : '0';

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

