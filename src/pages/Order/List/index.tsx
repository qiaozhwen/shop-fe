import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  customerId: string;
  customerPhone: string;
  totalQuantity: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'credit';
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  operator: string;
  createdAt: string;
  completedAt?: string;
  remark?: string;
  items: OrderItem[];
}

// 模拟订单数据
const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: 'ORD202312230001',
    customer: '王府酒家',
    customerId: 'C001',
    customerPhone: '13800138001',
    totalQuantity: 35,
    totalAmount: 1575,
    paidAmount: 1575,
    paymentMethod: 'wechat',
    status: 'completed',
    operator: '张三',
    createdAt: '2023-12-23 08:30:15',
    completedAt: '2023-12-23 08:32:00',
    items: [
      { productId: 'P001', productName: '散养土鸡', category: '鸡类', quantity: 20, unitPrice: 45, amount: 900 },
      { productId: 'P006', productName: '肉鸽', category: '鸽类', quantity: 15, unitPrice: 45, amount: 675 },
    ],
  },
  {
    id: '2',
    orderNo: 'ORD202312230002',
    customer: '福满楼',
    customerId: 'C002',
    customerPhone: '13800138002',
    totalQuantity: 50,
    totalAmount: 2400,
    paidAmount: 2400,
    paymentMethod: 'alipay',
    status: 'completed',
    operator: '张三',
    createdAt: '2023-12-23 09:15:42',
    completedAt: '2023-12-23 09:18:00',
    items: [
      { productId: 'P002', productName: '三黄鸡', category: '鸡类', quantity: 30, unitPrice: 35, amount: 1050 },
      { productId: 'P004', productName: '麻鸭', category: '鸭类', quantity: 20, unitPrice: 38, amount: 760 },
      { productId: 'P005', productName: '番鸭', category: '鸭类', quantity: 10, unitPrice: 48, amount: 480 },
    ],
  },
  {
    id: '3',
    orderNo: 'ORD202312230003',
    customer: '李氏餐馆',
    customerId: 'C003',
    customerPhone: '13800138003',
    totalQuantity: 25,
    totalAmount: 1450,
    paidAmount: 1450,
    paymentMethod: 'cash',
    status: 'paid',
    operator: '王五',
    createdAt: '2023-12-23 10:05:30',
    items: [
      { productId: 'P003', productName: '乌鸡', category: '鸡类', quantity: 15, unitPrice: 58, amount: 870 },
      { productId: 'P005', productName: '番鸭', category: '鸭类', quantity: 10, unitPrice: 48, amount: 480 },
    ],
  },
  {
    id: '4',
    orderNo: 'ORD202312230004',
    customer: '张记酒楼',
    customerId: 'C004',
    customerPhone: '13800138004',
    totalQuantity: 80,
    totalAmount: 10240,
    paidAmount: 0,
    paymentMethod: 'credit',
    status: 'pending',
    operator: '张三',
    createdAt: '2023-12-23 11:20:00',
    items: [
      { productId: 'P007', productName: '大白鹅', category: '鹅类', quantity: 80, unitPrice: 128, amount: 10240 },
    ],
  },
  {
    id: '5',
    orderNo: 'ORD202312220001',
    customer: '赵家菜馆',
    customerId: 'C005',
    customerPhone: '13800138005',
    totalQuantity: 45,
    totalAmount: 2025,
    paidAmount: 2025,
    paymentMethod: 'wechat',
    status: 'completed',
    operator: '李四',
    createdAt: '2023-12-22 14:30:00',
    completedAt: '2023-12-22 14:35:00',
    items: [
      { productId: 'P001', productName: '散养土鸡', category: '鸡类', quantity: 45, unitPrice: 45, amount: 2025 },
    ],
  },
  {
    id: '6',
    orderNo: 'ORD202312220002',
    customer: '王府酒家',
    customerId: 'C001',
    customerPhone: '13800138001',
    totalQuantity: 30,
    totalAmount: 1380,
    paidAmount: 1380,
    paymentMethod: 'cash',
    status: 'refunded',
    operator: '张三',
    createdAt: '2023-12-22 16:00:00',
    remark: '客户退货，商品质量问题',
    items: [
      { productId: 'P004', productName: '麻鸭', category: '鸭类', quantity: 30, unitPrice: 38, amount: 1140 },
    ],
  },
];

const OrderListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const handleView = (record: Order) => {
    setCurrentOrder(record);
    setDetailVisible(true);
  };

  const handleCancel = (record: Order) => {
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消订单 ${record.orderNo} 吗？`,
      onOk: () => {
        message.success('订单已取消');
        actionRef.current?.reload();
      },
    });
  };

  const handlePrint = (record: Order) => {
    message.info('正在打印订单...');
  };

  const paymentMethodMap: Record<string, { text: string; color: string }> = {
    cash: { text: '现金', color: 'green' },
    wechat: { text: '微信', color: 'success' },
    alipay: { text: '支付宝', color: 'blue' },
    credit: { text: '挂账', color: 'orange' },
  };

  const statusMap: Record<string, { text: string; status: 'default' | 'processing' | 'success' | 'error' | 'warning' }> = {
    pending: { text: '待付款', status: 'warning' },
    paid: { text: '已付款', status: 'processing' },
    completed: { text: '已完成', status: 'success' },
    cancelled: { text: '已取消', status: 'default' },
    refunded: { text: '已退款', status: 'error' },
  };

  const columns: ProColumns<Order>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      copyable: true,
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: '客户',
      key: 'customer',
      width: 160,
      render: (_, record) => (
        <div>
          <Text strong>{record.customer}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.customerPhone}</Text>
        </div>
      ),
    },
    {
      title: '商品数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      width: 100,
      render: (quantity) => <Text>{quantity}只</Text>,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      width: 120,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      valueType: 'select',
      valueEnum: {
        cash: { text: '现金' },
        wechat: { text: '微信' },
        alipay: { text: '支付宝' },
        credit: { text: '挂账' },
      },
      render: (_, record) => {
        const method = paymentMethodMap[record.paymentMethod];
        return <Tag color={method?.color}>{method?.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待付款', status: 'Warning' },
        paid: { text: '已付款', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
        refunded: { text: '已退款', status: 'Error' },
      },
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      search: false,
      width: 80,
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
            打印
          </Button>
          {(record.status === 'pending' || record.status === 'paid') && (
            <Popconfirm title="确定要取消此订单吗？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small" danger>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 统计数据
  const todayOrders = mockOrders.filter((o) => o.createdAt.startsWith('2023-12-23'));
  const stats = {
    count: todayOrders.length,
    quantity: todayOrders.reduce((sum, o) => sum + o.totalQuantity, 0),
    amount: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    completed: todayOrders.filter((o) => o.status === 'completed').length,
    pending: todayOrders.filter((o) => o.status === 'pending').length,
  };

  return (
    <PageContainer
      header={{
        title: '订单列表',
        subTitle: '管理所有销售订单',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日订单" value={stats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="销售数量" value={stats.quantity} suffix="只" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="销售金额" value={stats.amount} precision={0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="已完成" value={stats.completed} suffix="单" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待处理" value={stats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="平均客单价" 
              value={stats.count > 0 ? Math.round(stats.amount / stats.count) : 0} 
              prefix="¥" 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<Order>
          headerTitle="订单记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="export" icon={<DownloadOutlined />}>
              导出
            </Button>,
          ]}
          request={async (params) => {
            let data = [...mockOrders];
            if (params.status) {
              data = data.filter((o) => o.status === params.status);
            }
            if (params.paymentMethod) {
              data = data.filter((o) => o.paymentMethod === params.paymentMethod);
            }
            if (params.orderNo) {
              data = data.filter((o) => o.orderNo.includes(params.orderNo));
            }
            return {
              data,
              success: true,
              total: data.length,
            };
          }}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => handlePrint(currentOrder!)}>
            打印小票
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentOrder && (
          <div className={styles.orderDetail}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="订单号" span={2}>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>{currentOrder.orderNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="客户">{currentOrder.customer}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentOrder.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{currentOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{currentOrder.completedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="操作员">{currentOrder.operator}</Descriptions.Item>
              <Descriptions.Item label="支付方式">
                <Tag color={paymentMethodMap[currentOrder.paymentMethod]?.color}>
                  {paymentMethodMap[currentOrder.paymentMethod]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态" span={2}>
                <Badge status={statusMap[currentOrder.status]?.status} text={statusMap[currentOrder.status]?.text} />
              </Descriptions.Item>
              {currentOrder.remark && (
                <Descriptions.Item label="备注" span={2}>{currentOrder.remark}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider />
            <Title level={5}>商品明细</Title>
            <Table
              dataSource={currentOrder.items}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                { title: '商品', dataIndex: 'productName' },
                { title: '分类', dataIndex: 'category' },
                { title: '数量', dataIndex: 'quantity', render: (q) => `${q}只` },
                { title: '单价', dataIndex: 'unitPrice', render: (p) => `¥${p}` },
                { title: '小计', dataIndex: 'amount', render: (a) => <Text strong>¥{a}</Text> },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>合计</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{currentOrder.totalQuantity}只</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                  <Table.Summary.Cell index={3}>
                    <Text strong style={{ color: '#D4380D', fontSize: 18 }}>
                      ¥{currentOrder.totalAmount}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">应付金额</Text>
                <br />
                <Title level={4} style={{ margin: 0 }}>¥{currentOrder.totalAmount}</Title>
              </Col>
              <Col span={12}>
                <Text type="secondary">实付金额</Text>
                <br />
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>¥{currentOrder.paidAmount}</Title>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderListPage;

