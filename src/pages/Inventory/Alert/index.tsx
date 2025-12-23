import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  ReloadOutlined,
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
  Space,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { inventoryApi, InventoryAlert } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

const InventoryAlertPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryAlert | null>(null);
  const [stats, setStats] = useState({ critical: 0, warning: 0, handled: 0 });
  const [form] = Form.useForm();

  const handlePurchase = (record: InventoryAlert) => {
    setSelectedItem(record);
    form.setFieldsValue({
      productName: record.product?.name,
      quantity: (record.minStock * 2) - record.currentStock,
    });
    setPurchaseVisible(true);
  };

  const handleMarkHandled = async (record: InventoryAlert) => {
    try {
      await inventoryApi.handleAlert(record.id);
      message.success('已标记为已处理');
      actionRef.current?.reload();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmitPurchase = async () => {
    try {
      await form.validateFields();
      message.success('采购订单已创建');
      setPurchaseVisible(false);
      if (selectedItem) {
        await handleMarkHandled(selectedItem);
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const columns: ProColumns<InventoryAlert>[] = [
    {
      title: '商品信息',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.product?.name || '未知商品'}</Text>
          <br />
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.productId}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      width: 180,
      render: (_, record) => {
        const ratio = Math.round((record.currentStock / record.minStock) * 100);
        return (
          <div className={styles.stockStatus}>
            <div className={styles.stockNumbers}>
              <Text strong style={{ 
                color: record.alertLevel === 'critical' ? '#ff4d4f' : '#faad14' 
              }}>
                {record.currentStock}只
              </Text>
              <Text type="secondary"> / {record.minStock}只(警戒)</Text>
            </div>
            <Progress
              percent={ratio}
              size="small"
              status={record.alertLevel === 'critical' ? 'exception' : 'normal'}
              strokeColor={record.alertLevel === 'critical' ? '#ff4d4f' : '#faad14'}
              format={(p) => `${p}%`}
            />
          </div>
        );
      },
    },
    {
      title: '预警等级',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: 100,
      valueType: 'select',
      valueEnum: {
        critical: { text: '紧急', status: 'Error' },
        warning: { text: '预警', status: 'Warning' },
      },
      render: (_, record) => {
        const config = record.alertLevel === 'critical' 
          ? { color: 'error', text: '紧急', icon: <AlertOutlined /> }
          : { color: 'warning', text: '预警', icon: <BellOutlined /> };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '处理状态',
      dataIndex: 'handled',
      key: 'handled',
      width: 100,
      render: (handled) => (
        <Tag color={handled ? 'success' : 'default'}>
          {handled ? '已处理' : '待处理'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      search: false,
      render: (_, record) => (
        <Space>
          {!record.handled && (
            <>
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
              <Tooltip title="标记已处理">
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleMarkHandled(record)}
                >
                  已处理
                </Button>
              </Tooltip>
            </>
          )}
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
        <Col xs={12} sm={8}>
          <Card bordered={false} className={`${styles.statCard} ${styles.critical}`}>
            <Statistic
              title={<span><AlertOutlined /> 紧急预警</span>}
              value={stats.critical}
              suffix="项"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} className={`${styles.statCard} ${styles.warning}`}>
            <Statistic
              title={<span><BellOutlined /> 预警提醒</span>}
              value={stats.warning}
              suffix="项"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="已处理"
              value={stats.handled}
              suffix="项"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<InventoryAlert>
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
          ]}
          request={async (params) => {
            try {
              const data = await inventoryApi.getAlerts(params.handled);
              // 计算统计
              setStats({
                critical: data.filter((a: InventoryAlert) => a.alertLevel === 'critical' && !a.handled).length,
                warning: data.filter((a: InventoryAlert) => a.alertLevel === 'warning' && !a.handled).length,
                handled: data.filter((a: InventoryAlert) => a.handled).length,
              });
              return {
                data: data || [],
                success: true,
                total: data?.length || 0,
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

      {/* 快速采购弹窗 */}
      <Modal
        title="快速采购"
        open={purchaseVisible}
        onOk={handleSubmitPurchase}
        onCancel={() => setPurchaseVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="商品名称">
            <Text strong style={{ fontSize: 16 }}>{selectedItem?.product?.name}</Text>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="当前库存">
                <Text strong style={{ color: '#ff4d4f' }}>{selectedItem?.currentStock}只</Text>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="警戒库存">
                <Text strong>{selectedItem?.minStock}只</Text>
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
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default InventoryAlertPage;
