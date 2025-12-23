import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface ProductItem {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  costPrice: number;
  unit: string;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  origin: string;
  supplier: string;
  weight: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  sales: number;
}

// 模拟数据
const mockProducts: ProductItem[] = [
  {
    id: 'P001',
    name: '散养土鸡',
    category: '鸡类',
    categoryId: 'C001',
    price: 45,
    costPrice: 32,
    unit: '只',
    stock: 156,
    minStock: 50,
    status: 'active',
    origin: '江苏盐城',
    supplier: '盐城绿源农场',
    weight: '2.5-3kg',
    description: '散养180天以上土鸡，肉质紧实，营养丰富',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=100&h=100&fit=crop',
    createdAt: '2023-06-15',
    updatedAt: '2023-12-20',
    sales: 1250,
  },
  {
    id: 'P002',
    name: '三黄鸡',
    category: '鸡类',
    categoryId: 'C001',
    price: 35,
    costPrice: 25,
    unit: '只',
    stock: 280,
    minStock: 80,
    status: 'active',
    origin: '广东清远',
    supplier: '清远鸡业有限公司',
    weight: '1.8-2.2kg',
    description: '正宗清远三黄鸡，皮脆肉滑',
    image: 'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=100&h=100&fit=crop',
    createdAt: '2023-06-18',
    updatedAt: '2023-12-19',
    sales: 850,
  },
  {
    id: 'P003',
    name: '乌鸡',
    category: '鸡类',
    categoryId: 'C001',
    price: 58,
    costPrice: 42,
    unit: '只',
    stock: 42,
    minStock: 40,
    status: 'active',
    origin: '江西泰和',
    supplier: '泰和乌鸡养殖场',
    weight: '1.5-2kg',
    description: '泰和乌鸡，药膳首选，滋补养生',
    image: 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=100&h=100&fit=crop',
    createdAt: '2023-07-01',
    updatedAt: '2023-12-18',
    sales: 450,
  },
  {
    id: 'P004',
    name: '麻鸭',
    category: '鸭类',
    categoryId: 'C002',
    price: 38,
    costPrice: 28,
    unit: '只',
    stock: 18,
    minStock: 30,
    status: 'out_of_stock',
    origin: '江苏高邮',
    supplier: '高邮鸭业养殖合作社',
    weight: '2-2.5kg',
    description: '高邮麻鸭，肉质鲜嫩',
    image: 'https://images.unsplash.com/photo-1459682687441-7761439a709d?w=100&h=100&fit=crop',
    createdAt: '2023-06-20',
    updatedAt: '2023-12-20',
    sales: 980,
  },
  {
    id: 'P005',
    name: '番鸭',
    category: '鸭类',
    categoryId: 'C002',
    price: 48,
    costPrice: 36,
    unit: '只',
    stock: 95,
    minStock: 40,
    status: 'active',
    origin: '福建漳州',
    supplier: '漳州番鸭养殖基地',
    weight: '2.8-3.5kg',
    description: '正宗番鸭，红烧首选',
    image: 'https://images.unsplash.com/photo-1555852372-576f9c67f7c7?w=100&h=100&fit=crop',
    createdAt: '2023-07-05',
    updatedAt: '2023-12-17',
    sales: 620,
  },
  {
    id: 'P006',
    name: '肉鸽',
    category: '鸽类',
    categoryId: 'C003',
    price: 45,
    costPrice: 32,
    unit: '只',
    stock: 65,
    minStock: 60,
    status: 'active',
    origin: '浙江金华',
    supplier: '金华鸽业有限公司',
    weight: '0.5-0.6kg',
    description: '优质肉鸽，高蛋白低脂肪',
    image: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=100&h=100&fit=crop',
    createdAt: '2023-07-10',
    updatedAt: '2023-12-16',
    sales: 520,
  },
  {
    id: 'P007',
    name: '大白鹅',
    category: '鹅类',
    categoryId: 'C004',
    price: 128,
    costPrice: 95,
    unit: '只',
    stock: 35,
    minStock: 20,
    status: 'active',
    origin: '安徽皖西',
    supplier: '皖西白鹅养殖场',
    weight: '4-5kg',
    description: '皖西大白鹅，肉质细腻',
    image: 'https://images.unsplash.com/photo-1498598457418-36ef20772bb9?w=100&h=100&fit=crop',
    createdAt: '2023-07-15',
    updatedAt: '2023-12-15',
    sales: 280,
  },
  {
    id: 'P008',
    name: '珍珠鸡',
    category: '鸡类',
    categoryId: 'C001',
    price: 68,
    costPrice: 50,
    unit: '只',
    stock: 0,
    minStock: 20,
    status: 'inactive',
    origin: '山东临沂',
    supplier: '临沂珍禽养殖场',
    weight: '1.2-1.5kg',
    description: '珍珠鸡，高档宴席首选',
    image: 'https://images.unsplash.com/photo-1569396116180-210c182bedb8?w=100&h=100&fit=crop',
    createdAt: '2023-08-01',
    updatedAt: '2023-12-10',
    sales: 120,
  },
];

const categories = [
  { value: 'C001', label: '鸡类' },
  { value: 'C002', label: '鸭类' },
  { value: 'C003', label: '鸽类' },
  { value: 'C004', label: '鹅类' },
  { value: 'C005', label: '其他禽类' },
];

const ProductListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: ProductItem) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId,
    });
    setModalVisible(true);
  };

  const handleView = (record: ProductItem) => {
    setCurrentProduct(record);
    setDetailVisible(true);
  };

  const handleDelete = (id: string) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
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

  const columns: ProColumns<ProductItem>[] = [
    {
      title: '商品信息',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div className={styles.productInfo}>
          <Avatar
            shape="square"
            size={64}
            src={record.image}
            className={styles.productImage}
          />
          <div className={styles.productMeta}>
            <Text strong className={styles.productName}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>编号: {record.id}</Text>
            <Tag color="blue">{record.category}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin',
      width: 120,
      search: false,
    },
    {
      title: '规格',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      search: false,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      search: false,
      render: (price) => <Text type="secondary">¥{price}/{mockProducts[0].unit}</Text>,
    },
    {
      title: '销售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price, record) => <Text strong style={{ color: '#D4380D' }}>¥{price}/{record.unit}</Text>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      search: false,
      render: (stock, record) => {
        const isLow = stock <= record.minStock;
        return (
          <Badge status={isLow ? 'error' : 'success'}>
            <Text strong style={{ color: isLow ? '#ff4d4f' : '#52c41a' }}>
              {stock}{record.unit}
            </Text>
          </Badge>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        active: { text: '在售', status: 'Success' },
        inactive: { text: '下架', status: 'Default' },
        out_of_stock: { text: '缺货', status: 'Error' },
      },
    },
    {
      title: '累计销量',
      dataIndex: 'sales',
      key: 'sales',
      width: 100,
      search: false,
      sorter: true,
      render: (sales) => <Text>{sales}只</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该商品吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const stats = {
    total: mockProducts.length,
    active: mockProducts.filter((p) => p.status === 'active').length,
    lowStock: mockProducts.filter((p) => p.stock <= p.minStock).length,
    outOfStock: mockProducts.filter((p) => p.status === 'out_of_stock' || p.stock === 0).length,
  };

  return (
    <PageContainer
      header={{
        title: '活禽列表',
        subTitle: '管理所有活禽商品信息',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="商品总数" value={stats.total} suffix="种" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="在售商品" value={stats.active} suffix="种" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="库存预警" value={stats.lowStock} suffix="种" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="缺货商品" value={stats.outOfStock} suffix="种" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<ProductItem>
          headerTitle="商品列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增商品
            </Button>,
          ]}
          request={async (params) => {
            // 模拟搜索过滤
            let data = [...mockProducts];
            if (params.name) {
              data = data.filter((item) =>
                item.name.includes(params.name) || item.id.includes(params.name)
              );
            }
            if (params.status) {
              data = data.filter((item) => item.status === params.status);
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className={styles.productForm}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="商品分类"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select options={categories} placeholder="请选择分类" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="成本价(元)"
                rules={[{ required: true, message: '请输入成本价' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="销售价(元)"
                rules={[{ required: true, message: '请输入销售价' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit"
                label="单位"
                rules={[{ required: true, message: '请输入单位' }]}
                initialValue="只"
              >
                <Input placeholder="如：只、kg" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="weight" label="规格/重量">
                <Input placeholder="如：2.5-3kg" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="origin" label="产地">
                <Input placeholder="请输入产地" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minStock" label="最低库存预警">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplier" label="供应商">
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="在售" unCheckedChildren="下架" defaultChecked />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 商品详情弹窗 */}
      <Modal
        title="商品详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentProduct && (
          <div className={styles.productDetail}>
            <div className={styles.detailHeader}>
              <Avatar shape="square" size={120} src={currentProduct.image} />
              <div className={styles.detailMeta}>
                <Title level={4}>{currentProduct.name}</Title>
                <Space>
                  <Tag color="blue">{currentProduct.category}</Tag>
                  <Tag color={currentProduct.status === 'active' ? 'green' : 'red'}>
                    {currentProduct.status === 'active' ? '在售' : currentProduct.status === 'inactive' ? '下架' : '缺货'}
                  </Tag>
                </Space>
                <Text type="secondary">{currentProduct.description}</Text>
              </div>
            </div>
            <Row gutter={[16, 16]} className={styles.detailInfo}>
              <Col span={8}><Text type="secondary">商品编号</Text><br /><Text strong>{currentProduct.id}</Text></Col>
              <Col span={8}><Text type="secondary">产地</Text><br /><Text strong>{currentProduct.origin}</Text></Col>
              <Col span={8}><Text type="secondary">规格</Text><br /><Text strong>{currentProduct.weight}</Text></Col>
              <Col span={8}><Text type="secondary">成本价</Text><br /><Text strong>¥{currentProduct.costPrice}</Text></Col>
              <Col span={8}><Text type="secondary">销售价</Text><br /><Text strong style={{ color: '#D4380D' }}>¥{currentProduct.price}</Text></Col>
              <Col span={8}><Text type="secondary">当前库存</Text><br /><Text strong>{currentProduct.stock}{currentProduct.unit}</Text></Col>
              <Col span={8}><Text type="secondary">最低库存</Text><br /><Text strong>{currentProduct.minStock}{currentProduct.unit}</Text></Col>
              <Col span={8}><Text type="secondary">累计销量</Text><br /><Text strong>{currentProduct.sales}只</Text></Col>
              <Col span={8}><Text type="secondary">供应商</Text><br /><Text strong>{currentProduct.supplier}</Text></Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProductListPage;
