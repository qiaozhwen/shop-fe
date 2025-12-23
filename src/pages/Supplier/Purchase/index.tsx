import {
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  PrinterOutlined,
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
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { purchaseApi, supplierApi, productApi, PurchaseOrder } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

interface PurchaseItem {
  productId: number | string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const PurchasePage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [form] = Form.useForm();
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ count: 0, quantity: 0, amount: 0, pending: 0 });

  const fetchSuppliers = async () => {
    try {
      const data = await supplierApi.getActive();
      setSuppliers((data || []).map((s: any) => ({ value: s.id, label: s.name })));
    } catch (error) {
      console.error('获取供应商失败:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await productApi.getActive();
      setProducts((data || []).map((p: any) => ({
        value: p.id,
        label: p.name,
        category: p.category?.name || '',
        price: p.costPrice || p.price || 0,
      })));
    } catch (error) {
      console.error('获取商品失败:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setPurchaseItems([]);
    setModalVisible(true);
  };

  const handleView = (record: PurchaseOrder) => {
    setCurrentOrder(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: '',
        productName: '',
        category: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...purchaseItems];
    newItems.splice(index, 1);
    setPurchaseItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    if (field === 'productId') {
      const product = products.find((p) => p.value === value);
      if (product) {
        newItems[index].productName = product.label;
        newItems[index].category = product.category;
        newItems[index].unitPrice = product.price;
        newItems[index].amount = newItems[index].quantity * product.price;
      }
    }

    setPurchaseItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (purchaseItems.length === 0) {
        message.error('请至少添加一项采购商品');
        return;
      }
      await purchaseApi.create({
        supplierId: values.supplierId,
        expectedAt: values.expectedDate?.format('YYYY-MM-DD'),
        remark: values.remark,
        items: purchaseItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      message.success('采购单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleApprove = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '审批采购单',
      content: `确定要审批通过采购单 ${record.purchaseNo} 吗？`,
      onOk: async () => {
        try {
          await purchaseApi.confirm(record.id);
          message.success('审批通过');
          actionRef.current?.reload();
        } catch (error) {
          message.error('审批失败');
        }
      },
    });
  };

  const handleComplete = (record: PurchaseOrder) => {
    Modal.confirm({
      title: '确认到货',
      content: `确定采购单 ${record.purchaseNo} 已到货入库吗？`,
      onOk: async () => {
        try {
          await purchaseApi.receive(record.id, record.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })));
          message.success('采购完成');
          actionRef.current?.reload();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const totalQuantity = purchaseItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);

  const statusMap: Record<string, { text: string; color: string }> = {
    draft: { text: '草稿', color: 'default' },
    pending: { text: '待审批', color: 'warning' },
    approved: { text: '已审批', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
    cancelled: { text: '已取消', color: 'default' },
  };

  const columns: ProColumns<PurchaseOrder>[] = [
    {
      title: '采购单号',
      dataIndex: 'purchaseNo',
      key: 'purchaseNo',
      render: (text) => <Text strong style={{ color: '#52c41a' }}>{text}</Text>,
    },
    {
      title: '供应商',
      key: 'supplier',
      render: (_, record) => record.supplier?.name || '-',
    },
    {
      title: '采购数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      search: false,
      render: (quantity) => `${quantity}只`,
    },
    {
      title: '采购金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      sorter: true,
      render: (amount) => <Text strong style={{ color: '#1890ff' }}>¥{amount?.toLocaleString()}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        pending: { text: '待审批', status: 'Warning' },
        approved: { text: '已审批', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Default' },
      },
    },
    {
      title: '付款状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      search: false,
      valueEnum: {
        unpaid: { text: '未付款', status: 'Error' },
        partial: { text: '部分付款', status: 'Warning' },
        paid: { text: '已付款', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" onClick={() => handleComplete(record)}>
              确认到货
            </Button>
          )}
          <Button type="link" size="small" icon={<PrinterOutlined />}>
            打印
          </Button>
        </Space>
      ),
    },
  ];

  const todayStats = stats;

  return (
    <PageContainer
      header={{
        title: '采购管理',
        subTitle: '管理采购订单',
      }}
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日采购单" value={todayStats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="采购数量" value={todayStats.quantity} suffix="只" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="采购金额" value={todayStats.amount} precision={0} prefix="¥" valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="待审批" value={todayStats.pending} suffix="单" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<PurchaseOrder>
          headerTitle="采购订单"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建采购单
            </Button>,
          ]}
          request={async (params) => {
            setLoading(true);
            try {
              const result = await purchaseApi.getAll({
                page: params.current,
                pageSize: params.pageSize,
                status: params.status,
              });
              const list = result?.list || [];
              // 计算统计
              const todayStr = new Date().toISOString().split('T')[0];
              const todayOrders = list.filter((o: any) => o.createdAt?.startsWith(todayStr));
              setStats({
                count: todayOrders.length,
                quantity: todayOrders.reduce((sum: number, o: any) => sum + (o.totalQuantity || 0), 0),
                amount: todayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
                pending: list.filter((o: any) => o.status === 'pending').length,
              });
              return {
                data: list,
                success: true,
                total: result?.total || 0,
              };
            } catch (error) {
              console.error('获取采购单失败:', error);
              return { data: [], success: false, total: 0 };
            } finally {
              setLoading(false);
            }
          }}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      {/* 新建采购单弹窗 */}
      <Modal
        title="新建采购单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select options={suppliers} placeholder="请选择供应商" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="expectedDate" label="预计到货日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider>采购商品明细</Divider>

        <Table
          dataSource={purchaseItems}
          rowKey={(_, index) => index!.toString()}
          pagination={false}
          size="small"
          columns={[
            {
              title: '商品',
              dataIndex: 'productId',
              width: 180,
              render: (value, _, index) => (
                <Select
                  value={value}
                  options={products}
                  placeholder="选择商品"
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'productId', v)}
                />
              ),
            },
            {
              title: '分类',
              dataIndex: 'category',
              width: 80,
            },
            {
              title: '数量(只)',
              dataIndex: 'quantity',
              width: 120,
              render: (value, _, index) => (
                <InputNumber
                  value={value}
                  min={1}
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'quantity', v)}
                />
              ),
            },
            {
              title: '单价(元)',
              dataIndex: 'unitPrice',
              width: 120,
              render: (value, _, index) => (
                <InputNumber
                  value={value}
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'unitPrice', v)}
                />
              ),
            },
            {
              title: '金额',
              dataIndex: 'amount',
              width: 100,
              render: (amount) => <Text strong>¥{amount?.toFixed(2)}</Text>,
            },
            {
              title: '操作',
              width: 60,
              render: (_, __, index) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(index)}
                />
              ),
            },
          ]}
          footer={() => (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                添加商品
              </Button>
              <Space size="large">
                <Text>
                  合计数量: <Text strong>{totalQuantity}只</Text>
                </Text>
                <Text>
                  合计金额: <Text strong style={{ color: '#1890ff', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 采购单详情弹窗 */}
      <Modal
        title="采购单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={750}
      >
        {currentOrder && (
          <div className={styles.orderDetail}>
            <Steps
              current={
                currentOrder.status === 'pending' ? 0 :
                currentOrder.status === 'confirmed' ? 1 :
                currentOrder.status === 'received' ? 2 : 0
              }
              items={[
                { title: '待确认' },
                { title: '已确认' },
                { title: '已到货' },
              ]}
              style={{ marginBottom: 24 }}
            />

            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="采购单号" span={2}>
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{currentOrder.purchaseNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="供应商">{currentOrder.supplier?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[currentOrder.status]?.color}>
                  {statusMap[currentOrder.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="采购数量">{currentOrder.totalQuantity}只</Descriptions.Item>
              <Descriptions.Item label="采购金额">¥{currentOrder.totalAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="到货时间">{currentOrder.receivedAt || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={5}>采购明细</Title>
            <Table
              dataSource={currentOrder.items}
              rowKey="productId"
              pagination={false}
              size="small"
              columns={[
                { title: '商品', dataIndex: 'productName' },
                { title: '分类', dataIndex: 'category' },
                { title: '数量', dataIndex: 'quantity', render: (q) => `${q}只` },
                { title: '单价', dataIndex: 'unitPrice', render: (p) => `¥${p}` },
                { title: '金额', dataIndex: 'amount', render: (a) => <Text strong>¥{a}</Text> },
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
                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                      ¥{currentOrder.totalAmount.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default PurchasePage;

