import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
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
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { staffApi, Staff } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '店长' },
  { value: 'cashier', label: '收银员' },
  { value: 'warehouse', label: '仓管员' },
];

const roleMap: Record<string, string> = {
  admin: '管理员',
  manager: '店长',
  cashier: '收银员',
  warehouse: '仓管员',
};

const StaffPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await staffApi.getAll();
      setStaffList(data || []);
    } catch (error) {
      console.error('获取员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Staff) => {
    setEditingStaff(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleResetPassword = (record: Staff) => {
    setCurrentStaff(record);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await staffApi.delete(id);
      message.success('删除成功');
      fetchStaff();
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingStaff) {
        await staffApi.update(editingStaff.id, values);
        message.success('更新成功');
      } else {
        await staffApi.create(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchStaff();
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      if (currentStaff) {
        await staffApi.update(currentStaff.id, { password: values.newPassword });
        message.success('密码重置成功');
      }
      setPasswordModalVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const columns: ProColumns<Staff>[] = [
    {
      title: '员工信息',
      key: 'info',
      width: 200,
      render: (_, record) => (
        <div className={styles.staffInfo}>
          <Avatar size={40} style={{ backgroundColor: '#D4380D' }}>
            {record.name?.charAt(0) || record.username?.charAt(0)}
          </Avatar>
          <div className={styles.staffMeta}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      search: false,
      render: (phone) => phone || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        admin: { text: '管理员' },
        manager: { text: '店长' },
        cashier: { text: '收银员' },
        warehouse: { text: '仓管员' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          manager: 'blue',
          cashier: 'green',
          warehouse: 'orange',
        };
        return <Tag color={colorMap[record.role] || 'default'}>{roleMap[record.role] || record.role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        true: { text: '在职', status: 'Success' },
        false: { text: '离职', status: 'Default' },
      },
      render: (_, record) => (
        <Switch
          checked={record.status}
          checkedChildren="在职"
          unCheckedChildren="离职"
          size="small"
          onChange={async (checked) => {
            try {
              await staffApi.update(record.id, { status: checked });
              message.success(checked ? '已启用' : '已禁用');
              fetchStaff();
            } catch (error) {
              message.error('操作失败');
            }
          }}
        />
      ),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 160,
      search: false,
      render: (lastLoginAt) => lastLoginAt || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      search: false,
      render: (createdAt: any) => createdAt ? new Date(createdAt).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleResetPassword(record)}>
            重置密码
          </Button>
          <Popconfirm title="确定要删除该员工吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const stats = {
    total: staffList.length,
    active: staffList.filter((s) => s.status).length,
    cashier: staffList.filter((s) => s.role === 'cashier').length,
    todayOnline: staffList.filter((s) => s.lastLoginAt?.startsWith(todayStr)).length,
  };

  return (
    <PageContainer
      header={{
        title: '员工管理',
        subTitle: '管理系统用户与权限',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="员工总数" value={stats.total} suffix="人" prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="在职员工" value={stats.active} suffix="人" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
          <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="收银人员" value={stats.cashier} suffix="人" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日在线" value={stats.todayOnline} suffix="人" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<Staff>
          headerTitle="员工列表"
          actionRef={actionRef}
          rowKey="id"
          loading={loading}
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增员工
            </Button>,
          ]}
          request={async (params) => {
            let data = [...staffList];
            if (params.role) {
              data = data.filter((s) => s.role === params.role);
            }
            if (params.status !== undefined) {
              data = data.filter((s) => String(s.status) === params.status);
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

      {/* 新增/编辑员工弹窗 */}
      <Modal
        title={editingStaff ? '编辑员工' : '新增员工'}
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
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" disabled={!!editingStaff} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select
                  options={roleOptions}
                  placeholder="请选择角色"
                />
              </Form.Item>
            </Col>
          </Row>
          {!editingStaff && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => setPasswordModalVisible(false)}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="员工">
            <Text strong>{currentStaff?.name}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>@{currentStaff?.username}</Text>
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[{ required: true, message: '请确认密码' }]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StaffPage;

