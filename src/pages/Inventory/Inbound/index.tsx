import {
  CheckCircleOutlined,
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
const { TextArea } = Input;

interface InboundRecord {
  id: string;
  inboundNo: string;
  supplier: string;
  supplierId: string;
  totalQuantity: number;
  totalAmount: number;
  operator: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  remark?: string;
  items: InboundItem[];
}

interface InboundItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  weight?: string;
}

// 模拟入库记录
const mockInboundRecords: InboundRecord[] = [
  {
    id: '1',
    inboundNo: 'IN202312230001',
    supplier: '盐城绿源农场',
    supplierId: 'S001',
    totalQuantity: 120,
    totalAmount: 4320,
    operator: '李四',
    status: 'completed',
    createdAt: '2023-12-23 09:30:00',
    completedAt: '2023-12-23 09:45:00',
    items: [
      { productId: 'P001', productName: '散养土鸡', category: '鸡类', quantity: 80, unitPrice: 32, amount: 2560 },
      { productId: 'P003', productName: '乌鸡', category: '鸡类', quantity: 40, unitPrice: 44, amount: 1760 },
    ],
  },
  {
    id: '2',
    inboundNo: 'IN202312230002',
    supplier: '清远鸡业有限公司',
    supplierId: 'S002',
    totalQuantity: 150,
    totalAmount: 3750,
    operator: '王五',
    status: 'completed',
    createdAt: '2023-12-23 10:15:00',
    completedAt: '2023-12-23 10:30:00',
    items: [
      { productId: 'P002', productName: '三黄鸡', category: '鸡类', quantity: 150, unitPrice: 25, amount: 3750 },
    ],
  },
  {
    id: '3',
    inboundNo: 'IN202312230003',
    supplier: '金华鸽业有限公司',
    supplierId: 'S003',
    totalQuantity: 200,
    totalAmount: 6400,
    operator: '李四',
    status: 'pending',
    createdAt: '2023-12-23 14:00:00',
    items: [
      { productId: 'P006', productName: '肉鸽', category: '鸽类', quantity: 200, unitPrice: 32, amount: 6400 },
    ],
  },
  {
    id: '4',
    inboundNo: 'IN202312220001',
    supplier: '高邮鸭业养殖合作社',
    supplierId: 'S004',
    totalQuantity: 100,
    totalAmount: 2800,
    operator: '张三',
    status: 'completed',
    createdAt: '2023-12-22 08:30:00',
    completedAt: '2023-12-22 08:50:00',
    items: [
      { productId: 'P004', productName: '麻鸭', category: '鸭类', quantity: 60, unitPrice: 28, amount: 1680 },
      { productId: 'P005', productName: '番鸭', category: '鸭类', quantity: 40, unitPrice: 28, amount: 1120 },
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
  { value: 'P003', label: '乌鸡', category: '鸡类', price: 44 },
  { value: 'P004', label: '麻鸭', category: '鸭类', price: 28 },
  { value: 'P005', label: '番鸭', category: '鸭类', price: 36 },
  { value: 'P006', label: '肉鸽', category: '鸽类', price: 32 },
  { value: 'P007', label: '大白鹅', category: '鹅类', price: 95 },
];

const InboundPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InboundRecord | null>(null);
  const [form] = Form.useForm();
  const [inboundItems, setInboundItems] = useState<InboundItem[]>([]);

  const handleAdd = () => {
    form.resetFields();
    setInboundItems([]);
    setModalVisible(true);
  };

  const handleView = (record: InboundRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setInboundItems([
      ...inboundItems,
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
    const newItems = [...inboundItems];
    newItems.splice(index, 1);
    setInboundItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...inboundItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // 自动计算金额
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    // 选择商品时自动填充价格和分类
    if (field === 'productId') {
      const product = products.find((p) => p.value === value);
      if (product) {
        newItems[index].productName = product.label;
        newItems[index].category = product.category;
        newItems[index].unitPrice = product.price;
        newItems[index].amount = newItems[index].quantity * product.price;
      }
    }

    setInboundItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (inboundItems.length === 0) {
        message.error('请至少添加一项入库商品');
        return;
      }
      message.success('入库单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleConfirm = (record: InboundRecord) => {
    Modal.confirm({
      title: '确认入库',
      content: `确定要确认入库单 ${record.inboundNo} 吗？确认后库存将增加。`,
      onOk: () => {
        message.success('入库确认成功');
        actionRef.current?.reload();
      },
    });
  };

  const totalQuantity = inboundItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = inboundItems.reduce((sum, item) => sum + item.amount, 0);

  const columns: ProColumns<InboundRecord>[] = [
    {
      title: '入库单号',
      dataIndex: 'inboundNo',
      key: 'inboundNo',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '入库数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      render: (quantity) => <Text strong>{quantity}只</Text>,
    },
    {
      title: '入库金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{amount?.toLocaleString()}</Text>,
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
              确认入库
            </Button>
          )}
          <Button type="link" icon={<PrinterOutlined />}>
            打印
          </Button>
        </Space>
      ),
    },
  ];

  // 统计数据
  const todayStats = {
    count: mockInboundRecords.filter((r) => r.createdAt.startsWith('2023-12-23')).length,
    quantity: mockInboundRecords
      .filter((r) => r.createdAt.startsWith('2023-12-23'))
      .reduce((sum, r) => sum + r.totalQuantity, 0),
    amount: mockInboundRecords
      .filter((r) => r.createdAt.startsWith('2023-12-23'))
      .reduce((sum, r) => sum + r.totalAmount, 0),
    pending: mockInboundRecords.filter((r) => r.status === 'pending').length,
  };

  return (
    <PageContainer
      header={{
        title: '入库管理',
        subTitle: '管理活禽入库记录',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库单" value={todayStats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库数量" value={todayStats.quantity} suffix="只" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库金额" value={todayStats.amount} precision={0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待确认" value={todayStats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<InboundRecord>
          headerTitle="入库记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建入库单
            </Button>,
          ]}
          request={async () => ({
            data: mockInboundRecords,
            success: true,
            total: mockInboundRecords.length,
          })}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* 新建入库单弹窗 */}
      <Modal
        title="新建入库单"
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
              <Form.Item name="inboundDate" label="入库日期" initialValue={dayjs()}>
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

        <Divider>入库商品明细</Divider>

        <Table
          dataSource={inboundItems}
          rowKey={(_, index) => index!.toString()}
          pagination={false}
          size="small"
          columns={[
            {
              title: '商品',
              dataIndex: 'productId',
              width: 200,
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
                  合计金额: <Text strong style={{ color: '#D4380D', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 入库单详情弹窗 */}
      <Modal
        title="入库单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentRecord && (
          <div className={styles.detail}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">入库单号</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>{currentRecord.inboundNo}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">状态</Text>
                <br />
                <Tag color={currentRecord.status === 'completed' ? 'success' : 'warning'}>
                  {currentRecord.status === 'completed' ? '已完成' : '待确认'}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">供应商</Text>
                <br />
                <Text strong>{currentRecord.supplier}</Text>
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
                    <Text strong style={{ color: '#D4380D' }}>¥{currentRecord.totalAmount}</Text>
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

export default InboundPage;

