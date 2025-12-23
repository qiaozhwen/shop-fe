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
import React, { useEffect, useRef, useState } from 'react';
import { systemLogApi, SystemLog } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface LogItem extends SystemLog {
  type?: string;
  level?: string;
  user?: string;
  time?: string;
  detail?: string;
}

const SystemLogsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<LogItem | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [statistics, setStatistics] = useState<any>({ total: 0, login: 0, operation: 0, error: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (params?: any) => {
    setLoading(true);
    try {
      const result = await systemLogApi.getAll(params);
      const logList = (result?.list || []).map((log: SystemLog) => ({
        ...log,
        time: log.createdAt,
        user: log.staffName || '系统',
        detail: log.content,
        type: log.module === '系统' ? 'system' : log.action?.includes('登录') ? 'login' : 'operation',
        level: 'info',
      }));
      setLogs(logList);
      return { data: logList, success: true, total: result?.total || 0 };
    } catch (error) {
      console.error('获取日志失败:', error);
      return { data: [], success: false, total: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await systemLogApi.getStatistics();
      setStatistics(stats || { total: 0, login: 0, operation: 0, error: 0 });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleView = (record: LogItem) => {
    setCurrentLog(record);
    setDetailVisible(true);
  };

  const handleClearLogs = () => {
    Modal.confirm({
      title: '清空日志',
      icon: <ExclamationCircleOutlined />,
      content: '确定要清空30天前的日志吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await systemLogApi.clean(30);
          message.success('日志已清空');
          actionRef.current?.reload();
          fetchStatistics();
        } catch (error) {
          message.error('清空日志失败');
        }
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
      dataIndex: 'createdAt',
      key: 'createdAt',
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
        <Tag color={typeMap[record.type || 'operation']?.color}>{typeMap[record.type || 'operation']?.text}</Tag>
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
        <Badge status={levelMap[record.level || 'info']?.status} text={record.level === 'error' ? '错误' : record.level === 'warning' ? '警告' : '信息'} />
      ),
    },
    {
      title: '用户',
      dataIndex: 'staffName',
      key: 'staffName',
      width: 80,
      render: (_, record) => record.staffName || '系统',
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
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      search: false,
      render: (content) => content || '-',
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
      key: 'actions',
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
  const stats = statistics;

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
          loading={loading}
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
            const query: any = {
              page: params.current,
              pageSize: params.pageSize,
            };
            if (params.module) {
              query.module = params.module;
            }
            if (params.action) {
              query.action = params.action;
            }
            return fetchLogs(query);
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
                <Text strong>{currentLog.createdAt}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">类型</Text>
                <br />
                <Tag color={typeMap[currentLog.type || 'operation']?.color}>{typeMap[currentLog.type || 'operation']?.text}</Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">级别</Text>
                <br />
                <Badge status={levelMap[currentLog.level || 'info']?.status} text={currentLog.level === 'error' ? '错误' : currentLog.level === 'warning' ? '警告' : '信息'} />
              </Col>
              <Col span={12}>
                <Text type="secondary">用户</Text>
                <br />
                <Text strong>{currentLog.staffName || '系统'}</Text>
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
                <Text>{currentLog.ip || '-'}</Text>
              </Col>
              {currentLog.content && (
                <Col span={24}>
                  <Text type="secondary">详情</Text>
                  <br />
                  <div className={styles.detailBox}>
                    <Text>{currentLog.content}</Text>
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

