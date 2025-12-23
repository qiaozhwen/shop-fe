import {
  DeleteOutlined,
  EditOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  type: 'VIP' | '普通' | '新客户';
  creditLimit: number;
  creditUsed: number;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  status: boolean;
  remark?: string;
  createdAt: string;
}

interface OrderHistory {
  orderNo: string;
  date: string;
  amount: number;
  quantity: number;
  status: string;
}

const mockCustomers: Customer[] = [
  {
    id: 'C001',
    name: '王府酒家',
    contactPerson: '王总',
    phone: '13800138001',
    address: '上海市浦东新区陆家嘴环路1000号',
    type: 'VIP',
    creditLimit: 100000,
    creditUsed: 28500,
    totalOrders: 156,
    totalAmount: 285600,
    lastOrderDate: '2023-12-23',
    status: true,
    remark: '老客户，优先供货',
    createdAt: '2022-03-15',
  },
  {
    id: 'C002',
    name: '福满楼',
    contactPerson: '陈经理',
    phone: '13800138002',
    address: '上海市黄浦区南京东路300号',
    type: 'VIP',
    creditLimit: 80000,
    creditUsed: 15200,
    totalOrders: 98,
    totalAmount: 168500,
    lastOrderDate: '2023-12-23',
    status: true,
    createdAt: '2022-05-20',
  },
  {
    id: 'C003',
    name: '李氏餐馆',
    contactPerson: '李老板',
    phone: '13800138003',
    address: '上海市静安区南京西路1688号',
    type: 'VIP',
    creditLimit: 50000,
    creditUsed: 8600,
    totalOrders: 75,
    totalAmount: 125800,
    lastOrderDate: '2023-12-22',
    status: true,
    createdAt: '2022-08-10',
  },
  {
    id: 'C004',
    name: '张记酒楼',
    contactPerson: '张师傅',
    phone: '13800138004',
    address: '上海市徐汇区淮海中路1500号',
    type: '普通',
    creditLimit: 30000,
    creditUsed: 10200,
    totalOrders: 45,
    totalAmount: 85600,
    lastOrderDate: '2023-12-21',
    status: true,
    createdAt: '2023-01-05',
  },
  {
    id: 'C005',
    name: '赵家菜馆',
    contactPerson: '赵姐',
    phone: '13800138005',
    address: '上海市长宁区延安西路2000号',
    type: '普通',
    creditLimit: 20000,
    creditUsed: 5800,
    totalOrders: 32,
    totalAmount: 52300,
    lastOrderDate: '2023-12-20',
    status: true,
    createdAt: '2023-03-18',
  },
  {
    id: 'C006',
    name: '鼎香园',
    contactPerson: '刘总',
    phone: '13800138006',
    address: '上海市普陀区中山北路3000号',
    type: '新客户',
    creditLimit: 10000,
    creditUsed: 0,
    totalOrders: 5,
    totalAmount: 8500,
    lastOrderDate: '2023-12-19',
    status: true,
    createdAt: '2023-11-20',
  },
];

const orderHistory: OrderHistory[] = [
  { orderNo: 'ORD202312230001', date: '2023-12-23 08:30', amount: 1575, quantity: 35, status: '已完成' },
  { orderNo: 'ORD202312220002', date: '2023-12-22 10:15', amount: 2280, quantity: 52, status: '已完成' },
  { orderNo: 'ORD202312200001', date: '2023-12-20 09:00', amount: 1850, quantity: 42, status: '已完成' },
  { orderNo: 'ORD202312180003', date: '2023-12-18 11:30', amount: 3200, quantity: 68, status: '已完成' },
  { orderNo: 'ORD202312150002', date: '2023-12-15 14:20', amount: 980, quantity: 22, status: '已完成' },
];

const CustomerListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record: Customer) => {
    setCurrentCustomer(record);
    setDetailVisible(true);
  };

  const handleDelete = (id: string) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (editingCustomer) {
        message.success('更新成功');
      } else {
        message.success('添加成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const columns: ProColumns<Customer>[] = [
    {
      title: '客户信息',
      key: 'info',
      width: 250,
      render: (_, record) => (
        <div className={styles.customerInfo}>
          <Avatar size={48} style={{ backgroundColor: '#D4380D' }}>
            {record.name.charAt(0)}
          </Avatar>
          <div className={styles.customerMeta}>
            <Space>
              <Text strong style={{ fontSize: 15 }}>{record.name}</Text>
              <Tag color={record.type === 'VIP' ? 'gold' : record.type === '新客户' ? 'green' : 'default'}>
                {record.type}
              </Tag>
            </Space>
            <Text type="secondary">{record.contactPerson} · {record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      search: false,
    },
    {
      title: '信用额度',
      key: 'credit',
      width: 160,
      search: false,
      render: (_, record) => (
        <div>
          <Text>可用: <Text strong style={{ color: '#52c41a' }}>¥{(record.creditLimit - record.creditUsed).toLocaleString()}</Text></Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            总额: ¥{record.creditLimit.toLocaleString()} / 已用: ¥{record.creditUsed.toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: '累计订单',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 100,
      search: false,
      sorter: true,
      render: (orders) => `${orders}单`,
    },
    {
      title: '累计消费',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '最近下单',
      dataIndex: 'lastOrderDate',
      key: 'lastOrderDate',
      width: 110,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        true: { text: '正常', status: 'Success' },
        false: { text: '停用', status: 'Default' },
      },
      render: (_, record) => (
        <Switch
          checked={record.status}
          size="small"
          onChange={(checked) => message.success(checked ? '已启用' : '已停用')}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除该客户吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const stats = {
    total: mockCustomers.length,
    vip: mockCustomers.filter((c) => c.type === 'VIP').length,
    newCustomer: mockCustomers.filter((c) => c.type === '新客户').length,
    totalAmount: mockCustomers.reduce((sum, c) => sum + c.totalAmount, 0),
  };

  return (
    <PageContainer
      header={{
        title: '客户列表',
        subTitle: '管理所有客户信息',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="客户总数" value={stats.total} suffix="家" prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="VIP客户" value={stats.vip} suffix="家" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="新客户" value={stats.newCustomer} suffix="家" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="累计消费" value={stats.totalAmount} precision={0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<Customer>
          headerTitle="客户列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增客户
            </Button>,
          ]}
          request={async (params) => {
            let data = [...mockCustomers];
            if (params.status !== undefined) {
              data = data.filter((c) => String(c.status) === params.status);
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
          }}
        />
      </Card>

      {/* 新增/编辑客户弹窗 */}
      <Modal
        title={editingCustomer ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input placeholder="如：王府酒家" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="客户类型"
                rules={[{ required: true, message: '请选择客户类型' }]}
              >
                <Select
                  options={[
                    { value: 'VIP', label: 'VIP客户' },
                    { value: '普通', label: '普通客户' },
                    { value: '新客户', label: '新客户' },
                  ]}
                  placeholder="请选择"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="联系人"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="creditLimit" label="信用额度">
            <Input type="number" placeholder="请输入信用额度" addonBefore="¥" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 客户详情弹窗 */}
      <Modal
        title="客户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentCustomer && (
          <div className={styles.customerDetail}>
            <Row gutter={24}>
              <Col span={8}>
                <div className={styles.detailHeader}>
                  <Avatar size={80} style={{ backgroundColor: '#D4380D' }}>
                    {currentCustomer.name.charAt(0)}
                  </Avatar>
                  <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>{currentCustomer.name}</Title>
                  <Tag color={currentCustomer.type === 'VIP' ? 'gold' : 'default'}>{currentCustomer.type}</Tag>
                </div>
                <Divider />
                <div className={styles.contactInfo}>
                  <p><PhoneOutlined /> {currentCustomer.phone}</p>
                  <p><UserOutlined /> {currentCustomer.contactPerson}</p>
                  <p>{currentCustomer.address}</p>
                </div>
                <Divider />
                <div className={styles.creditInfo}>
                  <Statistic title="可用信用额度" value={currentCustomer.creditLimit - currentCustomer.creditUsed} prefix="¥" valueStyle={{ color: '#52c41a' }} />
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">总额度: ¥{currentCustomer.creditLimit.toLocaleString()}</Text>
                    <br />
                    <Text type="secondary">已使用: ¥{currentCustomer.creditUsed.toLocaleString()}</Text>
                  </div>
                </div>
              </Col>
              <Col span={16}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card bordered={false} className={styles.miniCard}>
                      <Statistic title="累计订单" value={currentCustomer.totalOrders} suffix="单" />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} className={styles.miniCard}>
                      <Statistic title="累计消费" value={currentCustomer.totalAmount} prefix="¥" valueStyle={{ color: '#D4380D' }} />
                    </Card>
                  </Col>
                </Row>
                <Card title="最近订单" bordered={false} style={{ marginTop: 16 }}>
                  <Table
                    dataSource={orderHistory}
                    rowKey="orderNo"
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '订单号', dataIndex: 'orderNo' },
                      { title: '时间', dataIndex: 'date' },
                      { title: '数量', dataIndex: 'quantity', render: (q) => `${q}只` },
                      { title: '金额', dataIndex: 'amount', render: (a) => <Text strong>¥{a}</Text> },
                      { title: '状态', dataIndex: 'status', render: (s) => <Tag color="success">{s}</Tag> },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default CustomerListPage;

