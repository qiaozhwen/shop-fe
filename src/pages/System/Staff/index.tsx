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
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface Staff {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: string;
  department: string;
  status: boolean;
  lastLogin?: string;
  createdAt: string;
}

const mockStaff: Staff[] = [
  {
    id: '1',
    name: '张三',
    username: 'zhangsan',
    phone: '13800138001',
    role: '销售员',
    department: '销售部',
    status: true,
    lastLogin: '2023-12-23 08:30:00',
    createdAt: '2022-03-15',
  },
  {
    id: '2',
    name: '李四',
    username: 'lisi',
    phone: '13800138002',
    role: '仓管员',
    department: '仓储部',
    status: true,
    lastLogin: '2023-12-23 07:45:00',
    createdAt: '2022-05-20',
  },
  {
    id: '3',
    name: '王五',
    username: 'wangwu',
    phone: '13800138003',
    role: '销售员',
    department: '销售部',
    status: true,
    lastLogin: '2023-12-22 18:00:00',
    createdAt: '2022-08-10',
  },
  {
    id: '4',
    name: '赵六',
    username: 'zhaoliu',
    phone: '13800138004',
    role: '财务',
    department: '财务部',
    status: true,
    lastLogin: '2023-12-23 09:00:00',
    createdAt: '2023-01-05',
  },
  {
    id: '5',
    name: '张总',
    username: 'admin',
    phone: '13800138000',
    role: '管理员',
    department: '管理层',
    status: true,
    lastLogin: '2023-12-23 10:00:00',
    createdAt: '2022-01-01',
  },
  {
    id: '6',
    name: '小刘',
    username: 'xiaoliu',
    phone: '13800138005',
    role: '配送员',
    department: '配送部',
    status: false,
    lastLogin: '2023-11-15 12:00:00',
    createdAt: '2023-06-01',
  },
];

const roles = ['管理员', '销售员', '仓管员', '财务', '配送员'];
const departments = ['管理层', '销售部', '仓储部', '财务部', '配送部'];

const StaffPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

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

  const handleDelete = (id: string) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (editingStaff) {
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

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      message.success('密码重置成功');
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
            {record.name.charAt(0)}
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
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      valueType: 'select',
      valueEnum: {
        '管理员': { text: '管理员' },
        '销售员': { text: '销售员' },
        '仓管员': { text: '仓管员' },
        '财务': { text: '财务' },
        '配送员': { text: '配送员' },
      },
      render: (_, record) => {
        const colorMap: Record<string, string> = {
          '管理员': 'red',
          '销售员': 'blue',
          '仓管员': 'green',
          '财务': 'purple',
          '配送员': 'orange',
        };
        return <Tag color={colorMap[record.role]}>{record.role}</Tag>;
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
      search: false,
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
          onChange={(checked) => message.success(checked ? '已启用' : '已禁用')}
        />
      ),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 160,
      search: false,
      render: (lastLogin) => lastLogin || '-',
    },
    {
      title: '入职时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      search: false,
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

  const stats = {
    total: mockStaff.length,
    active: mockStaff.filter((s) => s.status).length,
    sales: mockStaff.filter((s) => s.role === '销售员').length,
    todayOnline: mockStaff.filter((s) => s.lastLogin?.startsWith('2023-12-23')).length,
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
            <Statistic title="销售人员" value={stats.sales} suffix="人" valueStyle={{ color: '#1890ff' }} />
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
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增员工
            </Button>,
          ]}
          request={async (params) => {
            let data = [...mockStaff];
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
                rules={[{ required: true, message: '请输入联系电话' }]}
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
                  options={roles.map((r) => ({ value: r, label: r }))}
                  placeholder="请选择角色"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select
              options={departments.map((d) => ({ value: d, label: d }))}
              placeholder="请选择部门"
            />
          </Form.Item>
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

