import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PlusOutlined,
  ShopOutlined,
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
  Rate,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string[];
  rating: number;
  totalPurchases: number;
  totalAmount: number;
  lastPurchaseDate: string;
  deliveryDays: number;
  status: boolean;
  remark?: string;
  createdAt: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: 'S001',
    name: '盐城绿源农场',
    contactPerson: '孙总',
    phone: '13800138101',
    address: '江苏省盐城市亭湖区绿源路88号',
    category: ['土鸡', '乌鸡'],
    rating: 5,
    totalPurchases: 85,
    totalAmount: 186500,
    lastPurchaseDate: '2023-12-23',
    deliveryDays: 1,
    status: true,
    remark: '优质供应商，货源稳定',
    createdAt: '2022-01-15',
  },
  {
    id: 'S002',
    name: '清远鸡业有限公司',
    contactPerson: '陈经理',
    phone: '13800138102',
    address: '广东省清远市清城区鸡业大道168号',
    category: ['三黄鸡'],
    rating: 4,
    totalPurchases: 62,
    totalAmount: 125800,
    lastPurchaseDate: '2023-12-22',
    deliveryDays: 2,
    status: true,
    createdAt: '2022-03-20',
  },
  {
    id: 'S003',
    name: '金华鸽业有限公司',
    contactPerson: '王总',
    phone: '13800138103',
    address: '浙江省金华市婺城区鸽业路66号',
    category: ['肉鸽'],
    rating: 5,
    totalPurchases: 48,
    totalAmount: 96800,
    lastPurchaseDate: '2023-12-21',
    deliveryDays: 1,
    status: true,
    createdAt: '2022-05-10',
  },
  {
    id: 'S004',
    name: '高邮鸭业养殖合作社',
    contactPerson: '张老板',
    phone: '13800138104',
    address: '江苏省高邮市高邮镇鸭业路100号',
    category: ['麻鸭', '番鸭'],
    rating: 4,
    totalPurchases: 55,
    totalAmount: 88600,
    lastPurchaseDate: '2023-12-20',
    deliveryDays: 1,
    status: true,
    createdAt: '2022-06-15',
  },
  {
    id: 'S005',
    name: '皖西白鹅养殖场',
    contactPerson: '李师傅',
    phone: '13800138105',
    address: '安徽省六安市裕安区白鹅路200号',
    category: ['大白鹅'],
    rating: 5,
    totalPurchases: 32,
    totalAmount: 128000,
    lastPurchaseDate: '2023-12-19',
    deliveryDays: 2,
    status: true,
    createdAt: '2022-08-20',
  },
  {
    id: 'S006',
    name: '泰和乌鸡养殖场',
    contactPerson: '赵经理',
    phone: '13800138106',
    address: '江西省吉安市泰和县乌鸡路88号',
    category: ['乌鸡'],
    rating: 4,
    totalPurchases: 28,
    totalAmount: 58800,
    lastPurchaseDate: '2023-12-18',
    deliveryDays: 2,
    status: true,
    createdAt: '2023-01-10',
  },
];

const categoryOptions = [
  { value: '土鸡', label: '土鸡' },
  { value: '三黄鸡', label: '三黄鸡' },
  { value: '乌鸡', label: '乌鸡' },
  { value: '麻鸭', label: '麻鸭' },
  { value: '番鸭', label: '番鸭' },
  { value: '肉鸽', label: '肉鸽' },
  { value: '大白鹅', label: '大白鹅' },
];

const SupplierListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record: Supplier) => {
    setCurrentSupplier(record);
    setDetailVisible(true);
  };

  const handleDelete = (id: string) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (editingSupplier) {
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

  const columns: ProColumns<Supplier>[] = [
    {
      title: '供应商信息',
      key: 'info',
      width: 280,
      render: (_, record) => (
        <div className={styles.supplierInfo}>
          <Avatar size={48} style={{ backgroundColor: '#52c41a' }} icon={<ShopOutlined />} />
          <div className={styles.supplierMeta}>
            <Text strong style={{ fontSize: 15 }}>{record.name}</Text>
            <Space size={4}>
              <Rate disabled value={record.rating} style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>({record.rating}分)</Text>
            </Space>
            <Text type="secondary">{record.contactPerson} · {record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '供货品类',
      dataIndex: 'category',
      key: 'category',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.category.map((cat) => (
            <Tag key={cat} color="blue">{cat}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '累计采购',
      dataIndex: 'totalPurchases',
      key: 'totalPurchases',
      width: 100,
      search: false,
      sorter: true,
      render: (purchases) => `${purchases}次`,
    },
    {
      title: '采购金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#52c41a' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '供货周期',
      dataIndex: 'deliveryDays',
      key: 'deliveryDays',
      width: 100,
      search: false,
      render: (days) => `${days}天`,
    },
    {
      title: '最近采购',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
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
        true: { text: '合作中', status: 'Success' },
        false: { text: '已停用', status: 'Default' },
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
          <Popconfirm title="确定要删除该供应商吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: mockSuppliers.length,
    active: mockSuppliers.filter((s) => s.status).length,
    totalAmount: mockSuppliers.reduce((sum, s) => sum + s.totalAmount, 0),
    avgRating: (mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length).toFixed(1),
  };

  return (
    <PageContainer
      header={{
        title: '供应商列表',
        subTitle: '管理所有供应商信息',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="供应商总数" value={stats.total} suffix="家" prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="合作中" value={stats.active} suffix="家" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="累计采购额" value={stats.totalAmount} precision={0} prefix="¥" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="平均评分" value={stats.avgRating} suffix="分" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<Supplier>
          headerTitle="供应商列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增供应商
            </Button>,
          ]}
          request={async () => ({
            data: mockSuppliers,
            success: true,
            total: mockSuppliers.length,
          })}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* 新增/编辑供应商弹窗 */}
      <Modal
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
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
                label="供应商名称"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="如：盐城绿源农场" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="供货品类"
                rules={[{ required: true, message: '请选择供货品类' }]}
              >
                <Select mode="multiple" options={categoryOptions} placeholder="请选择" />
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deliveryDays" label="供货周期(天)">
                <Input type="number" placeholder="如：1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rating" label="评分">
                <Rate />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 供应商详情弹窗 */}
      <Modal
        title="供应商详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {currentSupplier && (
          <div className={styles.supplierDetail}>
            <div className={styles.detailHeader}>
              <Avatar size={64} style={{ backgroundColor: '#52c41a' }} icon={<ShopOutlined />} />
              <div className={styles.headerInfo}>
                <Title level={4} style={{ marginBottom: 4 }}>{currentSupplier.name}</Title>
                <Rate disabled value={currentSupplier.rating} />
                <Text type="secondary" style={{ marginLeft: 8 }}>({currentSupplier.rating}分)</Text>
              </div>
            </div>
            <Divider />
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="联系人">{currentSupplier.contactPerson}</Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined /> {currentSupplier.phone}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                <EnvironmentOutlined /> {currentSupplier.address}
              </Descriptions.Item>
              <Descriptions.Item label="供货品类" span={2}>
                <Space size={4}>
                  {currentSupplier.category.map((cat) => (
                    <Tag key={cat} color="blue">{cat}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="累计采购">{currentSupplier.totalPurchases}次</Descriptions.Item>
              <Descriptions.Item label="采购金额">
                <Text strong style={{ color: '#52c41a' }}>¥{currentSupplier.totalAmount.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="供货周期">{currentSupplier.deliveryDays}天</Descriptions.Item>
              <Descriptions.Item label="最近采购">{currentSupplier.lastPurchaseDate}</Descriptions.Item>
              <Descriptions.Item label="合作时间" span={2}>{currentSupplier.createdAt}</Descriptions.Item>
              {currentSupplier.remark && (
                <Descriptions.Item label="备注" span={2}>{currentSupplier.remark}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default SupplierListPage;

