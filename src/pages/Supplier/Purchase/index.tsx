import {
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplier: string;
  supplierId: string;
  totalQuantity: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  creator: string;
  approver?: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
  remark?: string;
  items: PurchaseItem[];
}

interface PurchaseItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNo: 'PO202312230001',
    supplier: '盐城绿源农场',
    supplierId: 'S001',
    totalQuantity: 200,
    totalAmount: 7600,
    status: 'completed',
    creator: '李四',
    approver: '张总',
    createdAt: '2023-12-23 08:00:00',
    approvedAt: '2023-12-23 08:30:00',
    completedAt: '2023-12-23 10:00:00',
    items: [
      { productId: 'P001', productName: '散养土鸡', category: '鸡类', quantity: 120, unitPrice: 32, amount: 3840 },
      { productId: 'P003', productName: '乌鸡', category: '鸡类', quantity: 80, unitPrice: 47, amount: 3760 },
    ],
  },
  {
    id: '2',
    orderNo: 'PO202312230002',
    supplier: '金华鸽业有限公司',
    supplierId: 'S003',
    totalQuantity: 300,
    totalAmount: 9600,
    status: 'approved',
    creator: '王五',
    approver: '张总',
    createdAt: '2023-12-23 09:30:00',
    approvedAt: '2023-12-23 10:00:00',
    items: [
      { productId: 'P006', productName: '肉鸽', category: '鸽类', quantity: 300, unitPrice: 32, amount: 9600 },
    ],
  },
  {
    id: '3',
    orderNo: 'PO202312230003',
    supplier: '高邮鸭业养殖合作社',
    supplierId: 'S004',
    totalQuantity: 150,
    totalAmount: 4500,
    status: 'pending',
    creator: '李四',
    createdAt: '2023-12-23 11:00:00',
    items: [
      { productId: 'P004', productName: '麻鸭', category: '鸭类', quantity: 100, unitPrice: 28, amount: 2800 },
      { productId: 'P005', productName: '番鸭', category: '鸭类', quantity: 50, unitPrice: 34, amount: 1700 },
    ],
  },
  {
    id: '4',
    orderNo: 'PO202312220001',
    supplier: '清远鸡业有限公司',
    supplierId: 'S002',
    totalQuantity: 250,
    totalAmount: 6250,
    status: 'completed',
    creator: '王五',
    approver: '张总',
    createdAt: '2023-12-22 14:00:00',
    approvedAt: '2023-12-22 14:30:00',
    completedAt: '2023-12-22 18:00:00',
    items: [
      { productId: 'P002', productName: '三黄鸡', category: '鸡类', quantity: 250, unitPrice: 25, amount: 6250 },
    ],
  },
];

const suppliers = [
  { value: 'S001', label: '盐城绿源农场' },
  { value: 'S002', label: '清远鸡业有限公司' },
  { value: 'S003', label: '金华鸽业有限公司' },
  { value: 'S004', label: '高邮鸭业养殖合作社' },
  { value: 'S005', label: '皖西白鹅养殖场' },
];

const products = [
  { value: 'P001', label: '散养土鸡', category: '鸡类', price: 32 },
  { value: 'P002', label: '三黄鸡', category: '鸡类', price: 25 },
  { value: 'P003', label: '乌鸡', category: '鸡类', price: 47 },
  { value: 'P004', label: '麻鸭', category: '鸭类', price: 28 },
  { value: 'P005', label: '番鸭', category: '鸭类', price: 34 },
  { value: 'P006', label: '肉鸽', category: '鸽类', price: 32 },
  { value: 'P007', label: '大白鹅', category: '鹅类', price: 95 },
];

const PurchasePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [form] = Form.useForm();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const handleAdd = () => {
    form.resetFields();
    setPurchaseItems([]);
    setModalVisible(true);
  };

  const handleView = (record: PurchaseOrder) => {
    setCurrentOrder(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: '',
        productName: '',
        category: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    if (field === 'productId') {
      const product = products.find((p) => p.value === value);
      if (product) {
        newItems[index].productName = product.label;
        newItems[index].category = product.category;
        newItems[index].unitPrice = product.price;
        newItems[index].amount = newItems[index].quantity * product.price;
      }
    }

    setPurchaseItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (purchaseItems.length === 0) {
        message.error('请至少添加一项采购商品');
        return;
      }
      message.success('采购单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleApprove = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '审批采购单',
      content: `确定要审批通过采购单 ${record.orderNo} 吗？`,
      onOk: () => {
        message.success('审批通过');
        actionRef.current?.reload();
      },
    });
  };

  const handleComplete = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '确认到货',
      content: `确定采购单 ${record.orderNo} 已到货入库吗？`,
      onOk: () => {
        message.success('采购完成');
        actionRef.current?.reload();
      },
    });
  };

  const totalQuantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);

  const statusMap: Record<string, { text: string; color: string }> = {
    draft: { text: '草稿', color: 'default' },
    pending: { text: '待审批', color: 'warning' },
    approved: { text: '已审批', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    cancelled: { text: '已取消', color: 'default' },
  };

  const columns: ProColumns<PurchaseOrder>[] = [
    {
      title: '采购单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (text) => <Text strong style={{ color: '#52c41a' }}>{text}</Text>,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '采购数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      render: (quantity) => `${quantity}只`,
    },
    {
      title: '采购金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#1890ff' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        pending: { text: '待审批', status: 'Warning' },
        approved: { text: '已审批', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" onClick={() => handleComplete(record)}>
              确认到货
            </Button>
          )}
          <Button type="link" size="small" icon={<PrinterOutlined />}>
            打印
          </Button>
        </Space>
      ),
    },
  ];

  const todayStats = {
    count: mockPurchaseOrders.filter((o) => o.createdAt.startsWith('2023-12-23')).length,
    quantity: mockPurchaseOrders
      .filter((o) => o.createdAt.startsWith('2023-12-23'))
      .reduce((sum, o) => sum + o.totalQuantity, 0),
    amount: mockPurchaseOrders
      .filter((o) => o.createdAt.startsWith('2023-12-23'))
      .reduce((sum, o) => sum + o.totalAmount, 0),
    pending: mockPurchaseOrders.filter((o) => o.status === 'pending').length,
  };

  return (
    <PageContainer
      header={{
        title: '采购管理',
        subTitle: '管理采购订单',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日采购单" value={todayStats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="采购数量" value={todayStats.quantity} suffix="只" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="采购金额" value={todayStats.amount} precision={0} prefix="¥" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待审批" value={todayStats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<PurchaseOrder>
          headerTitle="采购订单"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建采购单
            </Button>,
          ]}
          request={async () => ({
            data: mockPurchaseOrders,
            success: true,
            total: mockPurchaseOrders.length,
          })}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* 新建采购单弹窗 */}
      <Modal
        title="新建采购单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select options={suppliers} placeholder="请选择供应商" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expectedDate" label="预计到货日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider>采购商品明细</Divider>

        <Table
          dataSource={purchaseItems}
          rowKey={(_, index) => index!.toString()}
          pagination={false}
          size="small"
          columns={[
            {
              title: '商品',
              dataIndex: 'productId',
              width: 180,
              render: (value, _, index) => (
                <Select
                  value={value}
                  options={products}
                  placeholder="选择商品"
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'productId', v)}
                />
              ),
            },
            {
              title: '分类',
              dataIndex: 'category',
              width: 80,
            },
            {
              title: '数量(只)',
              dataIndex: 'quantity',
              width: 120,
              render: (value, _, index) => (
                <InputNumber
                  value={value}
                  min={1}
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'quantity', v)}
                />
              ),
            },
            {
              title: '单价(元)',
              dataIndex: 'unitPrice',
              width: 120,
              render: (value, _, index) => (
                <InputNumber
                  value={value}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'unitPrice', v)}
                />
              ),
            },
            {
              title: '金额',
              dataIndex: 'amount',
              width: 100,
              render: (amount) => <Text strong>¥{amount?.toFixed(2)}</Text>,
            },
            {
              title: '操作',
              width: 60,
              render: (_, __, index) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(index)}
                />
              ),
            },
          ]}
          footer={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                添加商品
              </Button>
              <Space size="large">
                <Text>
                  合计数量: <Text strong>{totalQuantity}只</Text>
                </Text>
                <Text>
                  合计金额: <Text strong style={{ color: '#1890ff', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 采购单详情弹窗 */}
      <Modal
        title="采购单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={750}
      >
        {currentOrder && (
          <div className={styles.orderDetail}>
            <Steps
              current={
                currentOrder.status === 'draft' ? 0 :
                currentOrder.status === 'pending' ? 1 :
                currentOrder.status === 'approved' ? 2 :
                currentOrder.status === 'completed' ? 3 : 0
              }
              items={[
                { title: '创建' },
                { title: '待审批' },
                { title: '已审批' },
                { title: '已完成' },
              ]}
              style={{ marginBottom: 24 }}
            />

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="采购单号" span={2}>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{currentOrder.orderNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="供应商">{currentOrder.supplier}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentOrder.status]?.color}>
                  {statusMap[currentOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建人">{currentOrder.creator}</Descriptions.Item>
              <Descriptions.Item label="审批人">{currentOrder.approver || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{currentOrder.completedAt || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>采购明细</Title>
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
                { title: '金额', dataIndex: 'amount', render: (a) => <Text strong>¥{a}</Text> },
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
                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                      ¥{currentOrder.totalAmount.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default PurchasePage;

