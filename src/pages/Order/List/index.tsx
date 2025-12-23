import {
  DownloadOutlined,
  EyeOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import { orderApi, Order } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

const OrderListPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ count: 0, quantity: 0, amount: 0, completed: 0, pending: 0 });

  const handleView = async (record: Order) => {
    try {
      const detail = await orderApi.getById(record.id);
      setCurrentOrder(detail);
      setDetailVisible(true);
    } catch (error) {
      setCurrentOrder(record);
      setDetailVisible(true);
    }
  };

  const handleCancel = async (record: Order) => {
    try {
      await orderApi.cancel(record.id);
      message.success('订单已取消');
      actionRef.current?.reload();
    } catch (error) {
      message.error('取消失败');
    }
  };

  const handlePrint = (record: Order) => {
    message.info('正在打印订单...');
  };

  const paymentMethodMap: Record<string, { text: string; color: string }> = {
    cash: { text: '现金', color: 'green' },
    wechat: { text: '微信', color: 'success' },
    alipay: { text: '支付宝', color: 'blue' },
    card: { text: '银行卡', color: 'purple' },
    credit: { text: '挂账', color: 'orange' },
  };

  const statusMap: Record<string, { text: string; status: 'default' | 'processing' | 'success' | 'error' | 'warning' }> = {
    pending: { text: '待处理', status: 'warning' },
    processing: { text: '处理中', status: 'processing' },
    completed: { text: '已完成', status: 'success' },
    cancelled: { text: '已取消', status: 'default' },
  };

  const columns: ProColumns<Order>[] = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      copyable: true,
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: '客户',
      key: 'customer',
      width: 160,
      render: (_, record) => (
        <div>
          <Text strong>{record.customerName || record.customer?.name || '散客'}</Text>
        </div>
      ),
    },
    {
      title: '商品数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      width: 100,
      render: (quantity) => <Text>{quantity}只</Text>,
    },
    {
      title: '订单金额',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      search: false,
      width: 120,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      valueType: 'select',
      valueEnum: {
        cash: { text: '现金' },
        wechat: { text: '微信' },
        alipay: { text: '支付宝' },
        card: { text: '银行卡' },
        credit: { text: '挂账' },
      },
      render: (_, record) => {
        const method = paymentMethodMap[record.paymentMethod];
        return <Tag color={method?.color}>{method?.text || record.paymentMethod}</Tag>;
      },
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 100,
      valueType: 'select',
      valueEnum: {
        unpaid: { text: '未支付', status: 'Warning' },
        partial: { text: '部分支付', status: 'Processing' },
        paid: { text: '已支付', status: 'Success' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待处理', status: 'Warning' },
        processing: { text: '处理中', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
      },
    },
    {
      title: '下单时间',
      dataIndex: 'orderAt',
      key: 'orderAt',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
            打印
          </Button>
          {record.status === 'pending' && (
            <Popconfirm title="确定要取消此订单吗？" onConfirm={() => handleCancel(record)}>
              <Button type="link" size="small" danger>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '订单列表',
        subTitle: '管理所有销售订单',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日订单" value={stats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="销售数量" value={stats.quantity} suffix="只" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="销售金额" value={stats.amount} precision={0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="已完成" value={stats.completed} suffix="单" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待处理" value={stats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic 
              title="平均客单价" 
              value={stats.count > 0 ? Math.round(stats.amount / stats.count) : 0} 
              prefix="¥" 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<Order>
          headerTitle="订单记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="export" icon={<DownloadOutlined />}>
              导出
            </Button>,
          ]}
          request={async (params) => {
            try {
              const res = await orderApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                status: params.status,
                paymentStatus: params.paymentStatus,
                paymentMethod: params.paymentMethod,
                orderNo: params.orderNo,
              });
              // 更新统计
              const today = dayjs().format('YYYY-MM-DD');
              const todayOrders = (res.list || []).filter((o: Order) => 
                dayjs(o.orderAt).format('YYYY-MM-DD') === today
              );
              setStats({
                count: todayOrders.length,
                quantity: todayOrders.reduce((sum: number, o: Order) => sum + o.totalQuantity, 0),
                amount: todayOrders.reduce((sum: number, o: Order) => sum + o.actualAmount, 0),
                completed: todayOrders.filter((o: Order) => o.status === 'completed').length,
                pending: todayOrders.filter((o: Order) => o.status === 'pending').length,
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

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => handlePrint(currentOrder!)}>
            打印小票
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentOrder && (
          <div className={styles.orderDetail}>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="订单号" span={2}>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>{currentOrder.orderNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="客户">{currentOrder.customerName || currentOrder.customer?.name || '散客'}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{currentOrder.orderAt}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{currentOrder.completedAt || '-'}</Descriptions.Item>
              <Descriptions.Item label="支付方式">
                <Tag color={paymentMethodMap[currentOrder.paymentMethod]?.color}>
                  {paymentMethodMap[currentOrder.paymentMethod]?.text || currentOrder.paymentMethod}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态" span={2}>
                <Badge status={statusMap[currentOrder.status]?.status} text={statusMap[currentOrder.status]?.text || currentOrder.status} />
              </Descriptions.Item>
              {currentOrder.remark && (
                <Descriptions.Item label="备注" span={2}>{currentOrder.remark}</Descriptions.Item>
              )}
            </Descriptions>

            <Divider />
            <Title level={5}>商品明细</Title>
            <Table
              dataSource={currentOrder.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '商品', dataIndex: 'productName' },
                { title: '单位', dataIndex: 'unit' },
                { title: '数量', dataIndex: 'quantity', render: (q, r) => `${q}${r.unit || '只'}` },
                { title: '单价', dataIndex: 'unitPrice', render: (p) => `¥${p}` },
                { title: '小计', dataIndex: 'amount', render: (a) => <Text strong>¥{a}</Text> },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>合计</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{currentOrder.totalQuantity}只</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                  <Table.Summary.Cell index={3}>
                    <Text strong style={{ color: '#D4380D', fontSize: 18 }}>
                      ¥{currentOrder.actualAmount}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">应付金额</Text>
                <br />
                <Title level={4} style={{ margin: 0 }}>¥{currentOrder.totalAmount}</Title>
              </Col>
              <Col span={8}>
                <Text type="secondary">优惠金额</Text>
                <br />
                <Title level={4} style={{ margin: 0, color: '#faad14' }}>¥{currentOrder.discountAmount || 0}</Title>
              </Col>
              <Col span={8}>
                <Text type="secondary">实付金额</Text>
                <br />
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>¥{currentOrder.paidAmount}</Title>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderListPage;
