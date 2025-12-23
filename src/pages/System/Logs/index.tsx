import {
  ClockCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface LogItem {
  id: string;
  time: string;
  type: 'login' | 'operation' | 'system' | 'error';
  level: 'info' | 'warning' | 'error';
  user: string;
  action: string;
  module: string;
  ip: string;
  detail?: string;
}

const mockLogs: LogItem[] = [
  {
    id: '1',
    time: '2023-12-23 10:30:15',
    type: 'operation',
    level: 'info',
    user: '张三',
    action: '创建销售订单',
    module: '订单管理',
    ip: '192.168.1.100',
    detail: '订单号: ORD202312230001，金额: ¥1575',
  },
  {
    id: '2',
    time: '2023-12-23 10:25:00',
    type: 'operation',
    level: 'info',
    user: '李四',
    action: '入库操作',
    module: '库存管理',
    ip: '192.168.1.101',
    detail: '入库单号: IN202312230001，数量: 120只',
  },
  {
    id: '3',
    time: '2023-12-23 10:00:00',
    type: 'login',
    level: 'info',
    user: '张总',
    action: '用户登录',
    module: '系统',
    ip: '192.168.1.1',
  },
  {
    id: '4',
    time: '2023-12-23 09:45:30',
    type: 'operation',
    level: 'warning',
    user: '王五',
    action: '库存预警触发',
    module: '库存管理',
    ip: '系统',
    detail: '麻鸭库存不足，当前: 18只，预警线: 30只',
  },
  {
    id: '5',
    time: '2023-12-23 09:30:00',
    type: 'login',
    level: 'info',
    user: '张三',
    action: '用户登录',
    module: '系统',
    ip: '192.168.1.100',
  },
  {
    id: '6',
    time: '2023-12-23 09:00:00',
    type: 'system',
    level: 'info',
    user: '系统',
    action: '定时任务执行',
    module: '系统',
    ip: '127.0.0.1',
    detail: '库存预警检查完成',
  },
  {
    id: '7',
    time: '2023-12-23 08:30:00',
    type: 'error',
    level: 'error',
    user: '系统',
    action: '打印服务异常',
    module: '系统',
    ip: '127.0.0.1',
    detail: '打印机连接失败，请检查设备状态',
  },
  {
    id: '8',
    time: '2023-12-22 18:00:00',
    type: 'operation',
    level: 'info',
    user: '赵六',
    action: '财务结算',
    module: '财务管理',
    ip: '192.168.1.102',
    detail: '日结金额: ¥35,800',
  },
  {
    id: '9',
    time: '2023-12-22 17:30:00',
    type: 'operation',
    level: 'info',
    user: '张三',
    action: '修改商品信息',
    module: '商品管理',
    ip: '192.168.1.100',
    detail: '修改商品: 散养土鸡，价格: ¥45 → ¥48',
  },
  {
    id: '10',
    time: '2023-12-22 16:00:00',
    type: 'login',
    level: 'warning',
    user: '未知',
    action: '登录失败',
    module: '系统',
    ip: '192.168.1.200',
    detail: '密码错误，尝试用户: admin',
  },
];

const SystemLogsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<LogItem | null>(null);

  const handleView = (record: LogItem) => {
    setCurrentLog(record);
    setDetailVisible(true);
  };

  const handleClearLogs = () => {
    Modal.confirm({
      title: '清空日志',
      icon: <ExclamationCircleOutlined />,
      content: '确定要清空所有日志吗？此操作不可恢复。',
      onOk: () => {
        message.success('日志已清空');
      },
    });
  };

  const typeMap: Record<string, { text: string; color: string }> = {
    login: { text: '登录', color: 'blue' },
    operation: { text: '操作', color: 'green' },
    system: { text: '系统', color: 'purple' },
    error: { text: '错误', color: 'red' },
  };

  const levelMap: Record<string, { status: 'success' | 'warning' | 'error' }> = {
    info: { status: 'success' },
    warning: { status: 'warning' },
    error: { status: 'error' },
  };

  const columns: ProColumns<LogItem>[] = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 160,
      valueType: 'dateTime',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      valueType: 'select',
      valueEnum: {
        login: { text: '登录' },
        operation: { text: '操作' },
        system: { text: '系统' },
        error: { text: '错误' },
      },
      render: (_, record) => (
        <Tag color={typeMap[record.type]?.color}>{typeMap[record.type]?.text}</Tag>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      valueType: 'select',
      valueEnum: {
        info: { text: '信息', status: 'Success' },
        warning: { text: '警告', status: 'Warning' },
        error: { text: '错误', status: 'Error' },
      },
      render: (_, record) => (
        <Badge status={levelMap[record.level]?.status} text={record.level === 'info' ? '信息' : record.level === 'warning' ? '警告' : '错误'} />
      ),
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      width: 80,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => <Text strong>{action}</Text>,
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      search: false,
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
      search: false,
      render: (detail) => detail || '-',
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      search: false,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleView(record)}>
          详情
        </Button>
      ),
    },
  ];

  // 统计数据
  const todayLogs = mockLogs.filter((l) => l.time.startsWith('2023-12-23'));
  const stats = {
    total: todayLogs.length,
    login: todayLogs.filter((l) => l.type === 'login').length,
    operation: todayLogs.filter((l) => l.type === 'operation').length,
    error: todayLogs.filter((l) => l.level === 'error').length,
  };

  return (
    <PageContainer
      header={{
        title: '系统日志',
        subTitle: '查看系统操作日志',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日日志" value={stats.total} suffix="条" prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="登录日志" value={stats.login} suffix="条" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="操作日志" value={stats.operation} suffix="条" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="错误日志" value={stats.error} suffix="条" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<LogItem>
          headerTitle="日志列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>
              刷新
            </Button>,
            <Button key="export" icon={<DownloadOutlined />}>
              导出
            </Button>,
            <Button key="clear" danger icon={<DeleteOutlined />} onClick={handleClearLogs}>
              清空日志
            </Button>,
          ]}
          request={async (params) => {
            let data = [...mockLogs];
            if (params.type) {
              data = data.filter((l) => l.type === params.type);
            }
            if (params.level) {
              data = data.filter((l) => l.level === params.level);
            }
            if (params.user) {
              data = data.filter((l) => l.user.includes(params.user));
            }
            return {
              data,
              success: true,
              total: data.length,
            };
          }}
          columns={columns}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* 日志详情弹窗 */}
      <Modal
        title="日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={500}
      >
        {currentLog && (
          <div className={styles.logDetail}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">时间</Text>
                <br />
                <Text strong>{currentLog.time}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">类型</Text>
                <br />
                <Tag color={typeMap[currentLog.type]?.color}>{typeMap[currentLog.type]?.text}</Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">级别</Text>
                <br />
                <Badge status={levelMap[currentLog.level]?.status} text={currentLog.level === 'info' ? '信息' : currentLog.level === 'warning' ? '警告' : '错误'} />
              </Col>
              <Col span={12}>
                <Text type="secondary">用户</Text>
                <br />
                <Text strong>{currentLog.user}</Text>
              </Col>
              <Col span={24}>
                <Text type="secondary">操作</Text>
                <br />
                <Text strong>{currentLog.action}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">模块</Text>
                <br />
                <Text>{currentLog.module}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">IP地址</Text>
                <br />
                <Text>{currentLog.ip}</Text>
              </Col>
              {currentLog.detail && (
                <Col span={24}>
                  <Text type="secondary">详情</Text>
                  <br />
                  <div className={styles.detailBox}>
                    <Text>{currentLog.detail}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default SystemLogsPage;

