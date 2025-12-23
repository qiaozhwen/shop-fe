import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
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
import React, { useEffect, useState } from 'react';
import { categoryApi, Category } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

interface CategoryWithStats extends Category {
  productCount?: number;
  stockCount?: number;
  salesRatio?: number;
}

const ProductCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const [allCategories, statistics] = await Promise.all([
        categoryApi.getAll(),
        categoryApi.getStatistics().catch(() => []),
      ]);
      
      // 合并统计数据
      const categoriesWithStats = (allCategories || []).map((cat: Category) => {
        const stat = statistics?.find((s: any) => s.categoryId === cat.id) || {};
        return {
          ...cat,
          productCount: stat.productCount || cat.products?.length || 0,
          stockCount: stat.stockCount || 0,
          salesRatio: stat.salesRatio || 0,
        };
      });
      
      setCategories(categoriesWithStats);
    } catch (error) {
      message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CategoryWithStats) => {
    setEditingCategory(record);
    form.setFieldsValue({
      ...record,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await categoryApi.delete(id);
      message.success('删除成功');
      loadCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        status: values.status ?? true,
      };
      
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, data);
        message.success('更新成功');
      } else {
        await categoryApi.create(data);
        message.success('添加成功');
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleStatusChange = async (id: number, checked: boolean) => {
    try {
      await categoryApi.update(id, { status: checked });
      message.success(checked ? '已启用' : '已禁用');
      loadCategories();
    } catch (error) {
      message.error('操作失败');
    }
  };

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
              loading={loading}
            >
              <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>{category.icon || '📦'}</span>
                <Tag color={category.status ? 'green' : 'default'}>
                  {category.status ? '启用' : '禁用'}
                </Tag>
              </div>
              <Title level={5} style={{ marginBottom: 8 }}>{category.name}</Title>
              <div className={styles.categoryStats}>
                <div className={styles.statItem}>
                  <Text type="secondary">商品数</Text>
                  <Text strong>{category.productCount || 0}种</Text>
                </div>
                <div className={styles.statItem}>
                  <Text type="secondary">库存</Text>
                  <Text strong>{category.stockCount || 0}只</Text>
                </div>
              </div>
              <div className={styles.salesRatio}>
                <Text type="secondary" style={{ fontSize: 12 }}>销售占比</Text>
                <Progress
                  percent={category.salesRatio || 0}
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
          loading={loading}
          pagination={false}
          columns={[
            {
              title: '分类信息',
              key: 'info',
              render: (_, record) => (
                <Space>
                  <span style={{ fontSize: 32 }}>{record.icon || '📦'}</span>
                  <div>
                    <Text strong style={{ fontSize: 16 }}>{record.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.id}</Text>
                  </div>
                </Space>
              ),
            },
            {
              title: '商品数',
              dataIndex: 'productCount',
              key: 'productCount',
              width: 100,
              render: (count) => <Text>{count || 0}种</Text>,
            },
            {
              title: '库存总量',
              dataIndex: 'stockCount',
              key: 'stockCount',
              width: 100,
              render: (count) => <Text>{count || 0}只</Text>,
            },
            {
              title: '销售占比',
              dataIndex: 'salesRatio',
              key: 'salesRatio',
              width: 150,
              render: (ratio) => (
                <Progress
                  percent={ratio || 0}
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
              sorter: (a, b) => (a.sort || 0) - (b.sort || 0),
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
              <Form.Item name="icon" label="图标">
                <Input placeholder="输入emoji图标，如：🐔" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="sort" label="排序" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
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
