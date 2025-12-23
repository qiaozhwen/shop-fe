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
  InputNumber,
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
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import { customerApi, Customer } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;

const CustomerListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [creditLogs, setCreditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, vip: 0, newCustomer: 0, totalAmount: 0 });
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    form.setFieldsValue({
      ...record,
      status: record.status,
    });
    setModalVisible(true);
  };

  const handleView = async (record: Customer) => {
    setCurrentCustomer(record);
    try {
      const logs = await customerApi.getCreditLogs(record.id);
      setCreditLogs(logs || []);
    } catch (error) {
      setCreditLogs([]);
    }
    setDetailVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await customerApi.delete(id);
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
      
      if (editingCustomer) {
        await customerApi.update(editingCustomer.id, data);
        message.success('更新成功');
      } else {
        await customerApi.create(data);
        message.success('添加成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const levelMap: Record<string, { text: string; color: string }> = {
    normal: { text: '普通', color: 'default' },
    vip: { text: 'VIP', color: 'gold' },
    svip: { text: 'SVIP', color: 'purple' },
  };

  const typeMap: Record<string, string> = {
    restaurant: '餐饮',
    retail: '零售',
    wholesale: '批发',
    personal: '个人',
  };

  const columns: ProColumns<Customer>[] = [
    {
      title: '客户信息',
      key: 'info',
      width: 250,
      render: (_, record) => (
        <div className={styles.customerInfo}>
          <Avatar size={48} style={{ backgroundColor: '#D4380D' }}>
            {record.name?.charAt(0)}
          </Avatar>
          <div className={styles.customerMeta}>
            <Space>
              <Text strong style={{ fontSize: 15 }}>{record.name}</Text>
              <Tag color={levelMap[record.level]?.color || 'default'}>
                {levelMap[record.level]?.text || record.level}
              </Tag>
            </Space>
            <Text type="secondary">{record.contactName} · {record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      valueType: 'select',
      valueEnum: {
        restaurant: { text: '餐饮' },
        retail: { text: '零售' },
        wholesale: { text: '批发' },
        personal: { text: '个人' },
      },
      render: (_, record) => <Tag>{typeMap[record.type] || record.type}</Tag>,
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
          <Text>可用: <Text strong style={{ color: '#52c41a' }}>¥{(record.creditLimit - record.creditBalance).toLocaleString()}</Text></Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            总额: ¥{(record.creditLimit || 0).toLocaleString()} / 已用: ¥{(record.creditBalance || 0).toLocaleString()}
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
      render: (orders) => `${orders || 0}单`,
    },
    {
      title: '累计消费',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{(amount || 0).toLocaleString()}</Text>,
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
        <Tag color={record.status ? 'success' : 'default'}>
          {record.status ? '正常' : '停用'}
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
          <Popconfirm title="确定要删除该客户吗？" onConfirm={() => handleDelete(record.id)}>
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
            try {
              const res = await customerApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                keyword: params.name,
                type: params.type,
                level: params.level,
              });
              // 更新统计
              setStats({
                total: res.total || 0,
                vip: (res.list || []).filter((c: Customer) => c.level === 'vip' || c.level === 'svip').length,
                newCustomer: (res.list || []).filter((c: Customer) => c.totalOrders <= 3).length,
                totalAmount: (res.list || []).reduce((sum: number, c: Customer) => sum + (c.totalAmount || 0), 0),
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
                    { value: 'restaurant', label: '餐饮' },
                    { value: 'retail', label: '零售' },
                    { value: 'wholesale', label: '批发' },
                    { value: 'personal', label: '个人' },
                  ]}
                  placeholder="请选择"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="客户等级"
                initialValue="normal"
              >
                <Select
                  options={[
                    { value: 'normal', label: '普通' },
                    { value: 'vip', label: 'VIP' },
                    { value: 'svip', label: 'SVIP' },
                  ]}
                />
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="联系人">
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="creditLimit" label="信用额度">
                <InputNumber style={{ width: '100%' }} min={0} precision={2} addonBefore="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
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
                    {currentCustomer.name?.charAt(0)}
                  </Avatar>
                  <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>{currentCustomer.name}</Title>
                  <Tag color={levelMap[currentCustomer.level]?.color || 'default'}>
                    {levelMap[currentCustomer.level]?.text || currentCustomer.level}
                  </Tag>
                </div>
                <Divider />
                <div className={styles.contactInfo}>
                  <p><PhoneOutlined /> {currentCustomer.phone}</p>
                  <p><UserOutlined /> {currentCustomer.contactName || '-'}</p>
                  <p>{currentCustomer.address || '-'}</p>
                </div>
                <Divider />
                <div className={styles.creditInfo}>
                  <Statistic 
                    title="可用信用额度" 
                    value={(currentCustomer.creditLimit || 0) - (currentCustomer.creditBalance || 0)} 
                    prefix="¥" 
                    valueStyle={{ color: '#52c41a' }} 
                  />
                  <div style={{ marginTop: 12 }}>
                    <Text type="secondary">总额度: ¥{(currentCustomer.creditLimit || 0).toLocaleString()}</Text>
                    <br />
                    <Text type="secondary">已使用: ¥{(currentCustomer.creditBalance || 0).toLocaleString()}</Text>
                  </div>
                </div>
              </Col>
              <Col span={16}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card bordered={false} className={styles.miniCard}>
                      <Statistic title="累计订单" value={currentCustomer.totalOrders || 0} suffix="单" />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card bordered={false} className={styles.miniCard}>
                      <Statistic title="累计消费" value={currentCustomer.totalAmount || 0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
                    </Card>
                  </Col>
                </Row>
                <Card title="最近信用记录" bordered={false} style={{ marginTop: 16 }}>
                  <Table
                    dataSource={creditLogs.slice(0, 5)}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: '暂无记录' }}
                    columns={[
                      { title: '类型', dataIndex: 'type', render: (t) => t === 'increase' ? '增加' : '减少' },
                      { title: '金额', dataIndex: 'amount', render: (a, r: any) => (
                        <Text style={{ color: r.type === 'increase' ? '#ff4d4f' : '#52c41a' }}>
                          {r.type === 'increase' ? '+' : '-'}¥{a}
                        </Text>
                      )},
                      { title: '说明', dataIndex: 'remark' },
                      { title: '时间', dataIndex: 'createdAt' },
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
