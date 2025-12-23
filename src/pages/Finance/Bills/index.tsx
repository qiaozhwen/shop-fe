import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  DatePicker,
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
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Bill {
  id: string;
  billNo: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  relatedOrder?: string;
  paymentMethod: string;
  description: string;
  operator: string;
  createdAt: string;
  remark?: string;
}

const mockBills: Bill[] = [
  {
    id: '1',
    billNo: 'B202312230001',
    type: 'income',
    category: '销售收入',
    amount: 1575,
    relatedOrder: 'ORD202312230001',
    paymentMethod: '微信',
    description: '王府酒家购买土鸡20只、肉鸽15只',
    operator: '张三',
    createdAt: '2023-12-23 08:32:00',
  },
  {
    id: '2',
    billNo: 'B202312230002',
    type: 'income',
    category: '销售收入',
    amount: 2400,
    relatedOrder: 'ORD202312230002',
    paymentMethod: '支付宝',
    description: '福满楼购买三黄鸡30只、麻鸭20只',
    operator: '张三',
    createdAt: '2023-12-23 09:18:00',
  },
  {
    id: '3',
    billNo: 'B202312230003',
    type: 'expense',
    category: '采购成本',
    amount: 7600,
    relatedOrder: 'PO202312230001',
    paymentMethod: '银行转账',
    description: '采购土鸡120只、乌鸡80只',
    operator: '李四',
    createdAt: '2023-12-23 10:00:00',
  },
  {
    id: '4',
    billNo: 'B202312230004',
    type: 'expense',
    category: '物流配送',
    amount: 380,
    paymentMethod: '现金',
    description: '今日配送费用',
    operator: '王五',
    createdAt: '2023-12-23 11:30:00',
  },
  {
    id: '5',
    billNo: 'B202312230005',
    type: 'income',
    category: '配送费',
    amount: 150,
    paymentMethod: '现金',
    description: '配送服务费收入',
    operator: '张三',
    createdAt: '2023-12-23 12:00:00',
  },
  {
    id: '6',
    billNo: 'B202312220001',
    type: 'expense',
    category: '人工成本',
    amount: 1200,
    paymentMethod: '银行转账',
    description: '临时工工资结算',
    operator: '李四',
    createdAt: '2023-12-22 18:00:00',
  },
  {
    id: '7',
    billNo: 'B202312220002',
    type: 'expense',
    category: '水电杂费',
    amount: 580,
    paymentMethod: '银行转账',
    description: '12月上旬水电费',
    operator: '李四',
    createdAt: '2023-12-22 14:00:00',
  },
];

const incomeCategories = ['销售收入', '配送费', '加工费', '其他收入'];
const expenseCategories = ['采购成本', '人工成本', '物流配送', '水电杂费', '设备维护', '其他支出'];
const paymentMethods = ['现金', '微信', '支付宝', '银行转账', '挂账'];

const FinanceBillsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [billType, setBillType] = useState<'income' | 'expense'>('income');
  const [form] = Form.useForm();

  const handleAdd = (type: 'income' | 'expense') => {
    setBillType(type);
    form.resetFields();
    form.setFieldsValue({ type });
    setModalVisible(true);
  };

  const handleView = (record: Bill) => {
    setCurrentBill(record);
    setDetailVisible(true);
  };

  const handleDelete = (id: string) => {
    message.success('删除成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      message.success('账单记录成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const columns: ProColumns<Bill>[] = [
    {
      title: '账单号',
      dataIndex: 'billNo',
      key: 'billNo',
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
          {record.type === 'income' ? '+' : '-'}¥{amount?.toLocaleString()}
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
      title: '关联单据',
      dataIndex: 'relatedOrder',
      key: 'relatedOrder',
      width: 150,
      search: false,
      render: (order) => order ? <Text type="secondary">{order}</Text> : '-',
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
      search: false,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Popconfirm title="确定要删除该账单吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计数据
  const todayBills = mockBills.filter((b) => b.createdAt.startsWith('2023-12-23'));
  const stats = {
    income: todayBills.filter((b) => b.type === 'income').reduce((sum, b) => sum + b.amount, 0),
    expense: todayBills.filter((b) => b.type === 'expense').reduce((sum, b) => sum + b.amount, 0),
    count: todayBills.length,
  };

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
        <ProTable<Bill>
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
            let data = [...mockBills];
            if (params.type) {
              data = data.filter((b) => b.type === params.type);
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
          <Form.Item name="relatedOrder" label="关联单据（可选）">
            <Input placeholder="输入关联的订单号或采购单号" />
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
                {currentBill.type === 'income' ? '+' : '-'}¥{currentBill.amount.toLocaleString()}
              </Title>
              <Tag color={currentBill.type === 'income' ? 'success' : 'error'} style={{ marginTop: 8 }}>
                {currentBill.type === 'income' ? '收入' : '支出'}
              </Tag>
            </div>
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="账单号">{currentBill.billNo}</Descriptions.Item>
              <Descriptions.Item label="分类">{currentBill.category}</Descriptions.Item>
              <Descriptions.Item label="支付方式">{currentBill.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="描述">{currentBill.description}</Descriptions.Item>
              {currentBill.relatedOrder && (
                <Descriptions.Item label="关联单据">{currentBill.relatedOrder}</Descriptions.Item>
              )}
              <Descriptions.Item label="操作员">{currentBill.operator}</Descriptions.Item>
              <Descriptions.Item label="时间">{currentBill.createdAt}</Descriptions.Item>
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

