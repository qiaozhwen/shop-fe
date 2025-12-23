import {
  DeleteOutlined,
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
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface OutboundRecord {
  id: string;
  outboundNo: string;
  customer: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  operator: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  remark?: string;
  items: OutboundItem[];
}

interface OutboundItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 模拟出库记录
const mockOutboundRecords: OutboundRecord[] = [
  {
    id: '1',
    outboundNo: 'OUT202312230001',
    customer: '王府酒家',
    customerId: 'C001',
    totalQuantity: 35,
    totalAmount: 1575,
    operator: '张三',
    status: 'completed',
    createdAt: '2023-12-23 08:30:00',
    completedAt: '2023-12-23 08:45:00',
    items: [
      { productId: 'P001', productName: '散养土鸡', category: '鸡类', quantity: 20, unitPrice: 45, amount: 900 },
      { productId: 'P006', productName: '肉鸽', category: '鸽类', quantity: 15, unitPrice: 45, amount: 675 },
    ],
  },
  {
    id: '2',
    outboundNo: 'OUT202312230002',
    customer: '福满楼',
    customerId: 'C002',
    totalQuantity: 50,
    totalAmount: 2400,
    operator: '张三',
    status: 'completed',
    createdAt: '2023-12-23 09:15:00',
    completedAt: '2023-12-23 09:30:00',
    items: [
      { productId: 'P002', productName: '三黄鸡', category: '鸡类', quantity: 30, unitPrice: 35, amount: 1050 },
      { productId: 'P004', productName: '麻鸭', category: '鸭类', quantity: 20, unitPrice: 38, amount: 760 },
    ],
  },
  {
    id: '3',
    outboundNo: 'OUT202312230003',
    customer: '李氏餐馆',
    customerId: 'C003',
    totalQuantity: 25,
    totalAmount: 1450,
    operator: '王五',
    status: 'pending',
    createdAt: '2023-12-23 10:00:00',
    items: [
      { productId: 'P003', productName: '乌鸡', category: '鸡类', quantity: 15, unitPrice: 58, amount: 870 },
      { productId: 'P005', productName: '番鸭', category: '鸭类', quantity: 10, unitPrice: 48, amount: 480 },
    ],
  },
  {
    id: '4',
    outboundNo: 'OUT202312220001',
    customer: '张记酒楼',
    customerId: 'C004',
    totalQuantity: 80,
    totalAmount: 10240,
    operator: '张三',
    status: 'completed',
    createdAt: '2023-12-22 14:30:00',
    completedAt: '2023-12-22 14:50:00',
    items: [
      { productId: 'P007', productName: '大白鹅', category: '鹅类', quantity: 80, unitPrice: 128, amount: 10240 },
    ],
  },
];

const customers = [
  { value: 'C001', label: '王府酒家' },
  { value: 'C002', label: '福满楼' },
  { value: 'C003', label: '李氏餐馆' },
  { value: 'C004', label: '张记酒楼' },
  { value: 'C005', label: '赵家菜馆' },
];

const products = [
  { value: 'P001', label: '散养土鸡', category: '鸡类', price: 45, stock: 156 },
  { value: 'P002', label: '三黄鸡', category: '鸡类', price: 35, stock: 280 },
  { value: 'P003', label: '乌鸡', category: '鸡类', price: 58, stock: 42 },
  { value: 'P004', label: '麻鸭', category: '鸭类', price: 38, stock: 18 },
  { value: 'P005', label: '番鸭', category: '鸭类', price: 48, stock: 95 },
  { value: 'P006', label: '肉鸽', category: '鸽类', price: 45, stock: 165 },
  { value: 'P007', label: '大白鹅', category: '鹅类', price: 128, stock: 85 },
];

const OutboundPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OutboundRecord | null>(null);
  const [form] = Form.useForm();
  const [outboundItems, setOutboundItems] = useState<OutboundItem[]>([]);

  const handleAdd = () => {
    form.resetFields();
    setOutboundItems([]);
    setModalVisible(true);
  };

  const handleView = (record: OutboundRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setOutboundItems([
      ...outboundItems,
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
    const newItems = [...outboundItems];
    newItems.splice(index, 1);
    setOutboundItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...outboundItems];
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

    setOutboundItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (outboundItems.length === 0) {
        message.error('请至少添加一项出库商品');
        return;
      }
      // 检查库存
      for (const item of outboundItems) {
        const product = products.find((p) => p.value === item.productId);
        if (product && item.quantity > product.stock) {
          message.error(`${product.label} 库存不足，当前库存: ${product.stock}只`);
          return;
        }
      }
      message.success('出库单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleConfirm = (record: OutboundRecord) => {
    Modal.confirm({
      title: '确认出库',
      content: `确定要确认出库单 ${record.outboundNo} 吗？确认后库存将减少。`,
      onOk: () => {
        message.success('出库确认成功');
        actionRef.current?.reload();
      },
    });
  };

  const totalQuantity = outboundItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = outboundItems.reduce((sum, item) => sum + item.amount, 0);

  const columns: ProColumns<OutboundRecord>[] = [
    {
      title: '出库单号',
      dataIndex: 'outboundNo',
      key: 'outboundNo',
      render: (text) => <Text strong style={{ color: '#D4380D' }}>{text}</Text>,
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '出库数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      render: (quantity) => <Text strong>{quantity}只</Text>,
    },
    {
      title: '销售金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      render: (amount) => <Text strong style={{ color: '#52c41a' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        pending: { text: '待确认', status: 'Warning' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
      },
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
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <Button type="link" onClick={() => handleConfirm(record)}>
              确认出库
            </Button>
          )}
          <Button type="link" icon={<PrinterOutlined />}>
            打印
          </Button>
        </Space>
      ),
    },
  ];

  const todayStats = {
    count: mockOutboundRecords.filter((r) => r.createdAt.startsWith('2023-12-23')).length,
    quantity: mockOutboundRecords
      .filter((r) => r.createdAt.startsWith('2023-12-23'))
      .reduce((sum, r) => sum + r.totalQuantity, 0),
    amount: mockOutboundRecords
      .filter((r) => r.createdAt.startsWith('2023-12-23'))
      .reduce((sum, r) => sum + r.totalAmount, 0),
    pending: mockOutboundRecords.filter((r) => r.status === 'pending').length,
  };

  return (
    <PageContainer
      header={{
        title: '出库管理',
        subTitle: '管理活禽出库记录',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日出库单" value={todayStats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日出库数量" value={todayStats.quantity} suffix="只" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日销售金额" value={todayStats.amount} precision={0} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待确认" value={todayStats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<OutboundRecord>
          headerTitle="出库记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建出库单
            </Button>,
          ]}
          request={async () => ({
            data: mockOutboundRecords,
            success: true,
            total: mockOutboundRecords.length,
          })}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* 新建出库单弹窗 */}
      <Modal
        title="新建出库单"
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
                name="customerId"
                label="客户"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Select options={customers} placeholder="请选择客户" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="outboundDate" label="出库日期" initialValue={dayjs()}>
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

        <Divider>出库商品明细</Divider>

        <Table
          dataSource={outboundItems}
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
                  options={products.map((p) => ({
                    ...p,
                    label: `${p.label} (库存: ${p.stock})`,
                  }))}
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
              render: (value, record, index) => {
                const product = products.find((p) => p.value === record.productId);
                return (
                  <InputNumber
                    value={value}
                    min={1}
                    max={product?.stock}
                    style={{ width: '100%' }}
                    onChange={(v) => handleItemChange(index, 'quantity', v)}
                  />
                );
              },
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
                  合计金额: <Text strong style={{ color: '#52c41a', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 出库单详情弹窗 */}
      <Modal
        title="出库单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentRecord && (
          <div className={styles.detail}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">出库单号</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>{currentRecord.outboundNo}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">状态</Text>
                <br />
                <Tag color={currentRecord.status === 'completed' ? 'success' : 'warning'}>
                  {currentRecord.status === 'completed' ? '已完成' : '待确认'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">客户</Text>
                <br />
                <Text strong>{currentRecord.customer}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">操作员</Text>
                <br />
                <Text strong>{currentRecord.operator}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">创建时间</Text>
                <br />
                <Text>{currentRecord.createdAt}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">完成时间</Text>
                <br />
                <Text>{currentRecord.completedAt || '-'}</Text>
              </Col>
            </Row>
            <Divider />
            <Title level={5}>商品明细</Title>
            <Table
              dataSource={currentRecord.items}
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
                    <Text strong>{currentRecord.totalQuantity}只</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                  <Table.Summary.Cell index={3}>
                    <Text strong style={{ color: '#52c41a' }}>¥{currentRecord.totalAmount}</Text>
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

export default OutboundPage;

