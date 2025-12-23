import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
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
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { productApi, categoryApi, Category, Product } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

const ProductListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, lowStock: 0, outOfStock: 0 });
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getActive();
      setCategories(res || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId,
      status: record.isActive,
    });
    setModalVisible(true);
  };

  const handleView = (record: Product) => {
    setCurrentProduct(record);
    setDetailVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        isActive: values.status ?? true,
      };
      delete data.status;
      
      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
        message.success('更新成功');
      } else {
        await productApi.create(data);
        message.success('添加成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const columns: ProColumns<Product>[] = [
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
            src={record.imageUrl}
            className={styles.productImage}
          >
            {record.name?.charAt(0)}
          </Avatar>
          <div className={styles.productMeta}>
            <Text strong className={styles.productName}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>编号: {record.code || record.id}</Text>
            <Tag color="blue">{record.category?.name || '未分类'}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      hideInTable: true,
      valueType: 'select',
      fieldProps: {
        options: categories.map(c => ({ label: c.name, value: c.id })),
      },
    },
    {
      title: '规格',
      dataIndex: 'weightAvg',
      key: 'weightAvg',
      width: 100,
      search: false,
      render: (_, record) => record.weightAvg ? `${record.weightAvg}kg` : '-',
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      search: false,
      render: (price, record) => <Text type="secondary">¥{price || 0}/{record.unit}</Text>,
    },
    {
      title: '销售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price, record) => <Text strong style={{ color: '#D4380D' }}>¥{price}/{record.unit}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: { text: '在售', status: 'Success' },
        false: { text: '下架', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'default'}>
          {record.isActive ? '在售' : '下架'}
        </Tag>
      ),
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
        <ProTable<Product>
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
            try {
              const res = await productApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                keyword: params.name,
                categoryId: params.categoryId,
                isActive: params.isActive,
              });
              // 更新统计数据
              const allProducts = res.list || [];
              setStats({
                total: res.total || 0,
                active: allProducts.filter((p: Product) => p.isActive).length,
                lowStock: 0, // 需要从库存接口获取
                outOfStock: allProducts.filter((p: Product) => !p.isActive).length,
              });
              return {
                data: res.list || [],
                success: true,
                total: res.total || 0,
              };
            } catch (error) {
              return { data: [], success: false, total: 0 };
            }
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
                <Select 
                  options={categories.map(c => ({ label: c.name, value: c.id }))} 
                  placeholder="请选择分类" 
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="costPrice"
                label="成本价(元)"
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
              <Form.Item name="weightAvg" label="平均重量(kg)">
                <InputNumber min={0} precision={2} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label="商品编码">
                <Input placeholder="请输入商品编码" />
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
              <Form.Item name="imageUrl" label="商品图片URL">
                <Input placeholder="请输入图片链接" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
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
              <Avatar shape="square" size={120} src={currentProduct.imageUrl}>
                {currentProduct.name?.charAt(0)}
              </Avatar>
              <div className={styles.detailMeta}>
                <Title level={4}>{currentProduct.name}</Title>
                <Space>
                  <Tag color="blue">{currentProduct.category?.name || '未分类'}</Tag>
                  <Tag color={currentProduct.isActive ? 'green' : 'red'}>
                    {currentProduct.isActive ? '在售' : '下架'}
                  </Tag>
                </Space>
                <Text type="secondary">{currentProduct.description || '暂无描述'}</Text>
              </div>
            </div>
            <Row gutter={[16, 16]} className={styles.detailInfo}>
              <Col span={8}><Text type="secondary">商品编号</Text><br /><Text strong>{currentProduct.code || currentProduct.id}</Text></Col>
              <Col span={8}><Text type="secondary">单位</Text><br /><Text strong>{currentProduct.unit}</Text></Col>
              <Col span={8}><Text type="secondary">平均重量</Text><br /><Text strong>{currentProduct.weightAvg || '-'}kg</Text></Col>
              <Col span={8}><Text type="secondary">成本价</Text><br /><Text strong>¥{currentProduct.costPrice || 0}</Text></Col>
              <Col span={8}><Text type="secondary">销售价</Text><br /><Text strong style={{ color: '#D4380D' }}>¥{currentProduct.price}</Text></Col>
              <Col span={8}><Text type="secondary">最低库存</Text><br /><Text strong>{currentProduct.minStock}{currentProduct.unit}</Text></Col>
              <Col span={24}><Text type="secondary">创建时间</Text><br /><Text strong>{currentProduct.createdAt}</Text></Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProductListPage;
