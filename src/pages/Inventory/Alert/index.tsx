import {
  AlertOutlined,
  BellOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface AlertItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  ratio: number;
  status: 'critical' | 'warning' | 'normal';
  supplier: string;
  supplierPhone: string;
  lastPurchaseDate: string;
  avgDailySales: number;
  daysToStockout: number;
  autoAlert: boolean;
}

const mockAlertItems: AlertItem[] = [
  {
    id: '1',
    productId: 'P004',
    productName: '麻鸭',
    category: '鸭类',
    currentStock: 18,
    minStock: 30,
    maxStock: 100,
    ratio: 60,
    status: 'critical',
    supplier: '高邮鸭业养殖合作社',
    supplierPhone: '13800138001',
    lastPurchaseDate: '2023-12-18',
    avgDailySales: 12,
    daysToStockout: 1.5,
    autoAlert: true,
  },
  {
    id: '2',
    productId: 'P001',
    productName: '散养土鸡',
    category: '鸡类',
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    ratio: 50,
    status: 'critical',
    supplier: '盐城绿源农场',
    supplierPhone: '13800138002',
    lastPurchaseDate: '2023-12-20',
    avgDailySales: 15,
    daysToStockout: 1.7,
    autoAlert: true,
  },
  {
    id: '3',
    productId: 'P003',
    productName: '乌鸡',
    category: '鸡类',
    currentStock: 42,
    minStock: 40,
    maxStock: 120,
    ratio: 105,
    status: 'warning',
    supplier: '泰和乌鸡养殖场',
    supplierPhone: '13800138003',
    lastPurchaseDate: '2023-12-19',
    avgDailySales: 8,
    daysToStockout: 5.25,
    autoAlert: true,
  },
  {
    id: '4',
    productId: 'P006',
    productName: '肉鸽',
    category: '鸽类',
    currentStock: 65,
    minStock: 60,
    maxStock: 200,
    ratio: 108,
    status: 'warning',
    supplier: '金华鸽业有限公司',
    supplierPhone: '13800138004',
    lastPurchaseDate: '2023-12-21',
    avgDailySales: 10,
    daysToStockout: 6.5,
    autoAlert: true,
  },
  {
    id: '5',
    productId: 'P007',
    productName: '大白鹅',
    category: '鹅类',
    currentStock: 35,
    minStock: 20,
    maxStock: 80,
    ratio: 175,
    status: 'normal',
    supplier: '皖西白鹅养殖场',
    supplierPhone: '13800138005',
    lastPurchaseDate: '2023-12-22',
    avgDailySales: 5,
    daysToStockout: 7,
    autoAlert: false,
  },
  {
    id: '6',
    productId: 'P002',
    productName: '三黄鸡',
    category: '鸡类',
    currentStock: 280,
    minStock: 80,
    maxStock: 400,
    ratio: 350,
    status: 'normal',
    supplier: '清远鸡业有限公司',
    supplierPhone: '13800138006',
    lastPurchaseDate: '2023-12-23',
    avgDailySales: 20,
    daysToStockout: 14,
    autoAlert: true,
  },
];

const InventoryAlertPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [settingVisible, setSettingVisible] = useState(false);
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AlertItem | null>(null);
  const [form] = Form.useForm();

  const handlePurchase = (record: AlertItem) => {
    setSelectedItem(record);
    form.setFieldsValue({
      productName: record.productName,
      supplier: record.supplier,
      quantity: record.maxStock - record.currentStock,
    });
    setPurchaseVisible(true);
  };

  const handleContact = (record: AlertItem) => {
    message.info(`正在拨打供应商电话: ${record.supplierPhone}`);
  };

  const handleSubmitPurchase = async () => {
    try {
      await form.validateFields();
      message.success('采购订单已创建');
      setPurchaseVisible(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const stats = {
    critical: mockAlertItems.filter((i) => i.status === 'critical').length,
    warning: mockAlertItems.filter((i) => i.status === 'warning').length,
    normal: mockAlertItems.filter((i) => i.status === 'normal').length,
    autoAlert: mockAlertItems.filter((i) => i.autoAlert).length,
  };

  const columns: ProColumns<AlertItem>[] = [
    {
      title: '商品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.productName}</Text>
          <br />
          <Space size={4}>
            <Tag color="blue">{record.category}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.productId}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 180,
      render: (_, record) => (
        <div className={styles.stockStatus}>
          <div className={styles.stockNumbers}>
            <Text strong style={{ 
              color: record.status === 'critical' ? '#ff4d4f' : 
                     record.status === 'warning' ? '#faad14' : '#52c41a' 
            }}>
              {record.currentStock}只
            </Text>
            <Text type="secondary"> / {record.minStock}只(警戒)</Text>
          </div>
          <Progress
            percent={record.ratio}
            size="small"
            status={record.status === 'critical' ? 'exception' : record.status === 'warning' ? 'normal' : 'success'}
            strokeColor={record.status === 'critical' ? '#ff4d4f' : record.status === 'warning' ? '#faad14' : '#52c41a'}
            format={(p) => `${p}%`}
          />
        </div>
      ),
    },
    {
      title: '预警等级',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        critical: { text: '紧急', status: 'Error' },
        warning: { text: '预警', status: 'Warning' },
        normal: { text: '正常', status: 'Success' },
      },
      render: (_, record) => {
        const statusConfig: any = {
          critical: { color: 'error', text: '紧急', icon: <AlertOutlined /> },
          warning: { color: 'warning', text: '预警', icon: <BellOutlined /> },
          normal: { color: 'success', text: '正常', icon: null },
        };
        const config = statusConfig[record.status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '日均销量',
      dataIndex: 'avgDailySales',
      key: 'avgDailySales',
      width: 100,
      search: false,
      render: (sales) => <Text>{sales}只/天</Text>,
    },
    {
      title: '预计断货',
      dataIndex: 'daysToStockout',
      key: 'daysToStockout',
      width: 120,
      search: false,
      sorter: (a, b) => a.daysToStockout - b.daysToStockout,
      render: (days, record) => (
        <Text strong style={{ 
          color: days <= 2 ? '#ff4d4f' : days <= 5 ? '#faad14' : '#52c41a' 
        }}>
          {days <= 1 ? '即将断货' : `${days}天后`}
        </Text>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 160,
      search: false,
      render: (supplier, record) => (
        <div>
          <Text>{supplier}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.supplierPhone}</Text>
        </div>
      ),
    },
    {
      title: '上次采购',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
      width: 110,
      search: false,
    },
    {
      title: '自动预警',
      dataIndex: 'autoAlert',
      key: 'autoAlert',
      width: 100,
      search: false,
      render: (autoAlert, record) => (
        <Switch
          checked={autoAlert}
          size="small"
          onChange={(checked) => {
            message.success(checked ? '已开启自动预警' : '已关闭自动预警');
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      search: false,
      render: (_, record) => (
        <Space>
          <Tooltip title="快速采购">
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => handlePurchase(record)}
            >
              采购
            </Button>
          </Tooltip>
          <Tooltip title="联系供应商">
            <Button
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => handleContact(record)}
            >
              联系
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '库存预警',
        subTitle: '实时监控库存预警信息',
      }}
    >
      {/* 预警统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={`${styles.statCard} ${styles.critical}`}>
            <Statistic
              title={<span><AlertOutlined /> 紧急预警</span>}
              value={stats.critical}
              suffix="项"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={`${styles.statCard} ${styles.warning}`}>
            <Statistic
              title={<span><BellOutlined /> 预警提醒</span>}
              value={stats.warning}
              suffix="项"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="库存正常"
              value={stats.normal}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="自动预警开启"
              value={stats.autoAlert}
              suffix="项"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 紧急预警卡片 */}
      {stats.critical > 0 && (
        <Card
          bordered={false}
          className={styles.urgentCard}
          style={{ marginBottom: 16 }}
        >
          <div className={styles.urgentHeader}>
            <div>
              <AlertOutlined style={{ fontSize: 24, color: '#ff4d4f', marginRight: 12 }} />
              <Title level={5} style={{ display: 'inline', margin: 0 }}>
                紧急预警 - 以下商品即将断货，请尽快补货！
              </Title>
            </div>
          </div>
          <Row gutter={16} style={{ marginTop: 16 }}>
            {mockAlertItems
              .filter((item) => item.status === 'critical')
              .map((item) => (
                <Col xs={24} sm={12} lg={8} key={item.id}>
                  <div className={styles.urgentItem}>
                    <div className={styles.urgentItemHeader}>
                      <Text strong style={{ fontSize: 16 }}>{item.productName}</Text>
                      <Badge status="error" text="紧急" />
                    </div>
                    <div className={styles.urgentItemBody}>
                      <div>
                        <Text type="secondary">当前库存</Text>
                        <br />
                        <Text strong style={{ fontSize: 24, color: '#ff4d4f' }}>{item.currentStock}只</Text>
                      </div>
                      <div>
                        <Text type="secondary">预计断货</Text>
                        <br />
                        <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                          {item.daysToStockout <= 1 ? '今日' : `${item.daysToStockout}天后`}
                        </Text>
                      </div>
                    </div>
                    <div className={styles.urgentItemFooter}>
                      <Text type="secondary">{item.supplier}</Text>
                      <Button type="primary" size="small" onClick={() => handlePurchase(item)}>
                        立即采购
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        </Card>
      )}

      <Card bordered={false}>
        <ProTable<AlertItem>
          headerTitle="库存预警列表"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>
              刷新
            </Button>,
            <Button key="setting" icon={<SettingOutlined />} onClick={() => setSettingVisible(true)}>
              预警设置
            </Button>,
          ]}
          request={async (params) => {
            let data = [...mockAlertItems];
            if (params.status) {
              data = data.filter((item) => item.status === params.status);
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

      {/* 快速采购弹窗 */}
      <Modal
        title="快速采购"
        open={purchaseVisible}
        onOk={handleSubmitPurchase}
        onCancel={() => setPurchaseVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="productName" label="商品名称">
            <Text strong style={{ fontSize: 16 }}>{selectedItem?.productName}</Text>
          </Form.Item>
          <Form.Item name="supplier" label="供应商">
            <Text>{selectedItem?.supplier}</Text>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="当前库存">
                <Text strong style={{ color: '#ff4d4f' }}>{selectedItem?.currentStock}只</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="建议补货至">
                <Text strong style={{ color: '#52c41a' }}>{selectedItem?.maxStock}只</Text>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="quantity"
            label="采购数量"
            rules={[{ required: true, message: '请输入采购数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} addonAfter="只" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Text type="secondary">采购单将自动发送至供应商</Text>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预警设置弹窗 */}
      <Modal
        title="预警设置"
        open={settingVisible}
        onOk={() => {
          message.success('设置已保存');
          setSettingVisible(false);
        }}
        onCancel={() => setSettingVisible(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="预警通知方式">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>系统消息通知</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>短信通知</Text>
                <Switch />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>邮件通知</Text>
                <Switch />
              </div>
            </Space>
          </Form.Item>
          <Form.Item label="预警检查频率">
            <Select
              defaultValue="realtime"
              style={{ width: '100%' }}
              options={[
                { value: 'realtime', label: '实时检查' },
                { value: 'hourly', label: '每小时' },
                { value: 'daily', label: '每天' },
              ]}
            />
          </Form.Item>
          <Form.Item label="紧急预警阈值(库存/警戒线)">
            <InputNumber
              defaultValue={80}
              min={0}
              max={100}
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default InventoryAlertPage;

