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
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Rate,
  Row,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import { supplierApi, Supplier } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;

const SupplierListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, totalAmount: 0, avgRating: 0 });
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Supplier) => {
    setEditingSupplier(record);
    form.setFieldsValue({
      ...record,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleView = (record: Supplier) => {
    setCurrentSupplier(record);
    setDetailVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await supplierApi.delete(id);
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
        status: values.status ?? true,
      };
      
      if (editingSupplier) {
        await supplierApi.update(editingSupplier.id, data);
        message.success('更新成功');
      } else {
        await supplierApi.create(data);
        message.success('添加成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('操作失败:', error);
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
              <Rate disabled value={record.rating || 0} style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>({record.rating || 0}分)</Text>
            </Space>
            <Text type="secondary">{record.contactName} · {record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '供货品类',
      dataIndex: 'supplyProducts',
      key: 'supplyProducts',
      width: 180,
      search: false,
      render: (text) => text || '-',
    },
    {
      title: '累计采购',
      dataIndex: 'totalPurchase',
      key: 'totalPurchase',
      width: 120,
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#52c41a' }}>¥{(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: '未付金额',
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 120,
      search: false,
      render: (amount) => <Text strong style={{ color: amount > 0 ? '#ff4d4f' : '#52c41a' }}>¥{(amount || 0).toLocaleString()}</Text>,
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
        <Tag color={record.status ? 'success' : 'default'}>
          {record.status ? '合作中' : '已停用'}
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
          request={async (params) => {
            try {
              const res = await supplierApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                keyword: params.name,
              });
              // 更新统计
              const list = res.list || [];
              setStats({
                total: res.total || 0,
                active: list.filter((s: Supplier) => s.status).length,
                totalAmount: list.reduce((sum: number, s: Supplier) => sum + (s.totalPurchase || 0), 0),
                avgRating: list.length > 0 ? list.reduce((sum: number, s: Supplier) => sum + (s.rating || 0), 0) / list.length : 0,
              });
              return {
                data: list,
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
              <Form.Item name="supplyProducts" label="供货品类">
                <Input placeholder="如：土鸡、乌鸡" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="联系人">
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
              <Form.Item name="bankName" label="开户银行">
                <Input placeholder="请输入开户银行" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="bankAccount" label="银行账号">
                <Input placeholder="请输入银行账号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="rating" label="评分" initialValue={5}>
                <Rate />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="合作中" unCheckedChildren="已停用" />
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
                <Rate disabled value={currentSupplier.rating || 0} />
                <Text type="secondary" style={{ marginLeft: 8 }}>({currentSupplier.rating || 0}分)</Text>
              </div>
            </div>
            <Divider />
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="联系人">{currentSupplier.contactName || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined /> {currentSupplier.phone}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                <EnvironmentOutlined /> {currentSupplier.address || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="供货品类" span={2}>
                {currentSupplier.supplyProducts || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="累计采购">
                <Text strong style={{ color: '#52c41a' }}>¥{(currentSupplier.totalPurchase || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="未付金额">
                <Text strong style={{ color: (currentSupplier.unpaidAmount || 0) > 0 ? '#ff4d4f' : '#52c41a' }}>
                  ¥{(currentSupplier.unpaidAmount || 0).toLocaleString()}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="开户银行">{currentSupplier.bankName || '-'}</Descriptions.Item>
              <Descriptions.Item label="银行账号">{currentSupplier.bankAccount || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>{currentSupplier.createdAt}</Descriptions.Item>
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

