import {
  DeleteOutlined,
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
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';
import { inventoryApi, supplierApi, productApi, InventoryInbound, Supplier, Product } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

interface InboundItem {
  productId: number;
  productName: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  amount: number;
}

const InboundPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InventoryInbound | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form] = Form.useForm();
  const [inboundItems, setInboundItems] = useState<InboundItem[]>([]);
  const [stats, setStats] = useState({ count: 0, quantity: 0, amount: 0 });

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        supplierApi.getActive(),
        productApi.getActive(),
      ]);
      setSuppliers(suppliersRes || []);
      setProducts(productsRes || []);
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setInboundItems([]);
    setModalVisible(true);
  };

  const handleView = (record: InventoryInbound) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setInboundItems([
      ...inboundItems,
      {
        productId: 0,
        productName: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...inboundItems];
    newItems.splice(index, 1);
    setInboundItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...inboundItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.costPrice || 0;
        newItems[index].amount = newItems[index].quantity * (product.costPrice || 0);
      }
    }

    setInboundItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (inboundItems.length === 0) {
        message.error('请至少添加一项入库商品');
        return;
      }
      
      // 逐个创建入库记录
      for (const item of inboundItems) {
        await inventoryApi.createInbound({
          supplierId: values.supplierId,
          productId: item.productId,
          quantity: item.quantity,
          weight: item.weight,
          unitPrice: item.unitPrice,
          totalAmount: item.amount,
          type: 'purchase',
          remark: values.remark,
        });
      }
      
      message.success('入库单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('创建失败:', error);
      message.error('创建入库单失败');
    }
  };

  const totalQuantity = inboundItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = inboundItems.reduce((sum, item) => sum + item.amount, 0);

  const columns: ProColumns<InventoryInbound>[] = [
    {
      title: '入库单号',
      dataIndex: 'inboundNo',
      key: 'inboundNo',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
      title: '商品',
      key: 'product',
      search: false,
      render: (_, record) => <Text>{record.product?.name || '-'}</Text>,
    },
    {
      title: '入库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      search: false,
      render: (quantity) => <Text strong>{quantity}只</Text>,
    },
    {
      title: '入库金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      search: false,
      render: (amount) => <Text strong style={{ color: '#D4380D' }}>¥{(amount || 0).toLocaleString()}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      valueType: 'select',
      valueEnum: {
        purchase: { text: '采购入库', status: 'Success' },
        return: { text: '退货入库', status: 'Warning' },
        adjust: { text: '调整入库', status: 'Default' },
      },
    },
    {
      title: '入库时间',
      dataIndex: 'inboundAt',
      key: 'inboundAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      search: false,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" icon={<PrinterOutlined />}>
            打印
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '入库管理',
        subTitle: '管理活禽入库记录',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库单" value={stats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库数量" value={stats.quantity} suffix="只" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日入库金额" value={stats.amount} precision={0} prefix="¥" valueStyle={{ color: '#D4380D' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<InventoryInbound>
          headerTitle="入库记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建入库单
            </Button>,
          ]}
          request={async (params) => {
            try {
              const res = await inventoryApi.getInbounds({
                page: params.current,
                pageSize: params.pageSize,
                type: params.type,
              });
              // 更新统计
              const today = dayjs().format('YYYY-MM-DD');
              const todayRecords = (res.list || []).filter((r: InventoryInbound) => 
                dayjs(r.inboundAt).format('YYYY-MM-DD') === today
              );
              setStats({
                count: todayRecords.length,
                quantity: todayRecords.reduce((sum: number, r: InventoryInbound) => sum + r.quantity, 0),
                amount: todayRecords.reduce((sum: number, r: InventoryInbound) => sum + (r.totalAmount || 0), 0),
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
          }}
        />
      </Card>

      {/* 新建入库单弹窗 */}
      <Modal
        title="新建入库单"
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
                <Select 
                  options={suppliers.map(s => ({ label: s.name, value: s.id }))} 
                  placeholder="请选择供应商" 
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="inboundDate" label="入库日期" initialValue={dayjs()}>
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

        <Divider>入库商品明细</Divider>

        <Table
          dataSource={inboundItems}
          rowKey={(_, index) => index!.toString()}
          pagination={false}
          size="small"
          columns={[
            {
              title: '商品',
              dataIndex: 'productId',
              width: 200,
              render: (value, _, index) => (
                <Select
                  value={value || undefined}
                  options={products.map(p => ({ label: p.name, value: p.id }))}
                  placeholder="选择商品"
                  style={{ width: '100%' }}
                  onChange={(v) => handleItemChange(index, 'productId', v)}
                />
              ),
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
                  onChange={(v) => handleItemChange(index, 'quantity', v || 0)}
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
                  onChange={(v) => handleItemChange(index, 'unitPrice', v || 0)}
                />
              ),
            },
            {
              title: '金额',
              dataIndex: 'amount',
              width: 100,
              render: (amount) => <Text strong>¥{(amount || 0).toFixed(2)}</Text>,
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
                  合计金额: <Text strong style={{ color: '#D4380D', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 入库单详情弹窗 */}
      <Modal
        title="入库单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <div className={styles.detail}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">入库单号</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>{currentRecord.inboundNo}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">商品</Text>
                <br />
                <Text strong>{currentRecord.product?.name || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">入库数量</Text>
                <br />
                <Text strong>{currentRecord.quantity}只</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">入库金额</Text>
                <br />
                <Text strong style={{ color: '#D4380D' }}>¥{currentRecord.totalAmount || 0}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">入库时间</Text>
                <br />
                <Text>{currentRecord.inboundAt}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">类型</Text>
                <br />
                <Tag color="success">{currentRecord.type}</Tag>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default InboundPage;
