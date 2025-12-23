import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface CategoryItem {
  id: string;
  name: string;
  code: string;
  icon: string;
  productCount: number;
  stockCount: number;
  salesRatio: number;
  status: boolean;
  sort: number;
  description: string;
  createdAt: string;
}

const mockCategories: CategoryItem[] = [
  {
    id: 'C001',
    name: '鸡类',
    code: 'CHICKEN',
    icon: '🐔',
    productCount: 5,
    stockCount: 478,
    salesRatio: 45,
    status: true,
    sort: 1,
    description: '包含土鸡、三黄鸡、乌鸡、珍珠鸡等各类鸡禽',
    createdAt: '2023-01-01',
  },
  {
    id: 'C002',
    name: '鸭类',
    code: 'DUCK',
    icon: '🦆',
    productCount: 3,
    stockCount: 213,
    salesRatio: 28,
    status: true,
    sort: 2,
    description: '包含麻鸭、番鸭、北京鸭等各类鸭禽',
    createdAt: '2023-01-01',
  },
  {
    id: 'C003',
    name: '鸽类',
    code: 'PIGEON',
    icon: '🕊️',
    productCount: 2,
    stockCount: 165,
    salesRatio: 15,
    status: true,
    sort: 3,
    description: '包含肉鸽、信鸽等各类鸽禽',
    createdAt: '2023-01-01',
  },
  {
    id: 'C004',
    name: '鹅类',
    code: 'GOOSE',
    icon: '🦢',
    productCount: 2,
    stockCount: 85,
    salesRatio: 8,
    status: true,
    sort: 4,
    description: '包含大白鹅、灰鹅等各类鹅禽',
    createdAt: '2023-01-01',
  },
  {
    id: 'C005',
    name: '其他禽类',
    code: 'OTHER',
    icon: '🦃',
    productCount: 1,
    stockCount: 42,
    salesRatio: 4,
    status: true,
    sort: 5,
    description: '包含火鸡、珍禽等其他禽类',
    createdAt: '2023-01-01',
  },
];

const ProductCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(mockCategories);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CategoryItem) => {
    setEditingCategory(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id ? { ...c, ...values } : c
          )
        );
        message.success('更新成功');
      } else {
        const newCategory: CategoryItem = {
          id: `C00${categories.length + 1}`,
          ...values,
          productCount: 0,
          stockCount: 0,
          salesRatio: 0,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCategories([...categories, newCategory]);
        message.success('添加成功');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, status: checked } : c
      )
    );
    message.success(checked ? '已启用' : '已禁用');
  };

  const totalStock = categories.reduce((sum, c) => sum + c.stockCount, 0);
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <PageContainer
      header={{
        title: '商品分类',
        subTitle: '管理活禽商品分类',
      }}
    >
      {/* 分类概览卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {categories.map((category) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={category.id}>
            <Card
              className={styles.categoryCard}
              bordered={false}
              hoverable
            >
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{category.icon}</span>
                <Tag color={category.status ? 'green' : 'default'}>
                  {category.status ? '启用' : '禁用'}
                </Tag>
              </div>
              <Title level={5} style={{ marginBottom: 8 }}>{category.name}</Title>
              <div className={styles.categoryStats}>
                <div className={styles.statItem}>
                  <Text type="secondary">商品数</Text>
                  <Text strong>{category.productCount}种</Text>
                </div>
                <div className={styles.statItem}>
                  <Text type="secondary">库存</Text>
                  <Text strong>{category.stockCount}只</Text>
                </div>
              </div>
              <div className={styles.salesRatio}>
                <Text type="secondary" style={{ fontSize: 12 }}>销售占比</Text>
                <Progress
                  percent={category.salesRatio}
                  size="small"
                  strokeColor={{
                    '0%': '#D4380D',
                    '100%': '#FA8C16',
                  }}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 分类列表 */}
      <Card
        title="分类列表"
        bordered={false}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增分类
          </Button>
        }
      >
        <Table
          dataSource={categories}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '分类信息',
              key: 'info',
              render: (_, record) => (
                <Space>
                  <span style={{ fontSize: 32 }}>{record.icon}</span>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{record.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>编码: {record.code}</Text>
                  </div>
                </Space>
              ),
            },
            {
              title: '描述',
              dataIndex: 'description',
              key: 'description',
              ellipsis: true,
            },
            {
              title: '商品数',
              dataIndex: 'productCount',
              key: 'productCount',
              width: 100,
              render: (count) => <Text>{count}种</Text>,
            },
            {
              title: '库存总量',
              dataIndex: 'stockCount',
              key: 'stockCount',
              width: 100,
              render: (count) => <Text>{count}只</Text>,
            },
            {
              title: '销售占比',
              dataIndex: 'salesRatio',
              key: 'salesRatio',
              width: 150,
              render: (ratio) => (
                <Progress
                  percent={ratio}
                  size="small"
                  strokeColor="#D4380D"
                  style={{ width: 100 }}
                />
              ),
            },
            {
              title: '排序',
              dataIndex: 'sort',
              key: 'sort',
              width: 80,
              sorter: (a, b) => a.sort - b.sort,
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status, record) => (
                <Switch
                  checked={status}
                  checkedChildren="启用"
                  unCheckedChildren="禁用"
                  onChange={(checked) => handleStatusChange(record.id, checked)}
                />
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 150,
              render: (_, record) => (
                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定要删除该分类吗？"
                    description="删除后该分类下的商品将无法正常显示"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="分类名称"
                rules={[{ required: true, message: '请输入分类名称' }]}
              >
                <Input placeholder="如：鸡类" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="分类编码"
                rules={[{ required: true, message: '请输入分类编码' }]}
              >
                <Input placeholder="如：CHICKEN" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="icon" label="图标">
                <Input placeholder="输入emoji图标，如：🐔" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sort" label="排序" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="分类描述">
            <Input.TextArea rows={3} placeholder="请输入分类描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ProductCategoryPage;
