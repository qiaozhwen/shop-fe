import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
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
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { financeApi, FinanceRecord } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;

const incomeCategories = ['销售收入', '配送费', '加工费', '其他收入'];
const expenseCategories = ['采购成本', '人工成本', '物流配送', '水电杂费', '设备维护', '其他支出'];
const paymentMethods = ['现金', '微信', '支付宝', '银行转账', '挂账'];

const FinanceBillsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<FinanceRecord | null>(null);
  const [billType, setBillType] = useState<'income' | 'expense'>('income');
  const [stats, setStats] = useState({ income: 0, expense: 0, count: 0 });
  const [form] = Form.useForm();

  const handleAdd = (type: 'income' | 'expense') => {
    setBillType(type);
    form.resetFields();
    form.setFieldsValue({ type });
    setModalVisible(true);
  };

  const handleView = async (record: FinanceRecord) => {
    try {
      const detail = await financeApi.getById(record.id);
      setCurrentBill(detail || record);
    } catch {
      setCurrentBill(record);
    }
    setDetailVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        type: billType,
        recordAt: dayjs().toISOString(),
      };
      await financeApi.create(data);
      message.success('账单记录成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const columns: ProColumns<FinanceRecord>[] = [
    {
      title: '账单号',
      dataIndex: 'recordNo',
      key: 'recordNo',
      render: (text, record) => (
        <Text strong style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      valueType: 'select',
      valueEnum: {
        income: { text: '收入', status: 'Success' },
        expense: { text: '支出', status: 'Error' },
      },
      render: (_, record) => (
        <Tag color={record.type === 'income' ? 'success' : 'error'}>
          {record.type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      sorter: true,
      render: (amount, record) => (
        <Text strong style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'income' ? '+' : '-'}¥{(amount || 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '时间',
      dataIndex: 'recordAt',
      key: 'recordAt',
      width: 160,
      valueType: 'dateTime',
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      search: false,
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '账单明细',
        subTitle: '管理所有收支账单',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日收入" value={stats.income} precision={0} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日支出" value={stats.expense} precision={0} prefix="¥" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日净收入" value={stats.income - stats.expense} precision={0} prefix="¥" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="账单笔数" value={stats.count} suffix="笔" />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<FinanceRecord>
          headerTitle="账单列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="income" type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('income')} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              记录收入
            </Button>,
            <Button key="expense" type="primary" danger icon={<PlusOutlined />} onClick={() => handleAdd('expense')}>
              记录支出
            </Button>,
            <Button key="export" icon={<DownloadOutlined />}>
              导出
            </Button>,
          ]}
          request={async (params) => {
            try {
              const res = await financeApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                type: params.type,
                category: params.category,
              });
              // 更新统计
              const today = dayjs().format('YYYY-MM-DD');
              const todayBills = (res.list || []).filter((b: FinanceRecord) => 
                dayjs(b.recordAt).format('YYYY-MM-DD') === today
              );
              setStats({
                income: todayBills.filter((b: FinanceRecord) => b.type === 'income').reduce((sum: number, b: FinanceRecord) => sum + b.amount, 0),
                expense: todayBills.filter((b: FinanceRecord) => b.type === 'expense').reduce((sum: number, b: FinanceRecord) => sum + b.amount, 0),
                count: todayBills.length,
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

      {/* 新增账单弹窗 */}
      <Modal
        title={billType === 'income' ? '记录收入' : '记录支出'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={(billType === 'income' ? incomeCategories : expenseCategories).map((c) => ({
                value: c,
                label: c,
              }))}
              placeholder="请选择分类"
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              prefix="¥"
              placeholder="请输入金额"
            />
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="支付方式"
            rules={[{ required: true, message: '请选择支付方式' }]}
          >
            <Select
              options={paymentMethods.map((m) => ({ value: m, label: m }))}
              placeholder="请选择支付方式"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={2} placeholder="请输入账单描述" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 账单详情弹窗 */}
      <Modal
        title="账单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={500}
      >
        {currentBill && (
          <div className={styles.billDetail}>
            <div className={styles.detailHeader}>
              <Text type="secondary">账单金额</Text>
              <Title level={2} style={{ margin: 0, color: currentBill.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
                {currentBill.type === 'income' ? '+' : '-'}¥{(currentBill.amount || 0).toLocaleString()}
              </Title>
              <Tag color={currentBill.type === 'income' ? 'success' : 'error'} style={{ marginTop: 8 }}>
                {currentBill.type === 'income' ? '收入' : '支出'}
              </Tag>
            </div>
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="账单号">{currentBill.recordNo}</Descriptions.Item>
              <Descriptions.Item label="分类">{currentBill.category}</Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentBill.paymentMethod || '-'}</Descriptions.Item>
              <Descriptions.Item label="描述">{currentBill.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="时间">{currentBill.recordAt}</Descriptions.Item>
              {currentBill.remark && (
                <Descriptions.Item label="备注">{currentBill.remark}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default FinanceBillsPage;
