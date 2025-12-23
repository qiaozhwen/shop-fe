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
import { inventoryApi, customerApi, productApi, InventoryOutbound, Customer, Product } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

interface OutboundItem {
  productId: number;
  productName: string;
  quantity: number;
  weight?: number;
  unitPrice: number;
  amount: number;
}

const OutboundPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InventoryOutbound | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form] = Form.useForm();
  const [outboundItems, setOutboundItems] = useState<OutboundItem[]>([]);
  const [stats, setStats] = useState({ count: 0, quantity: 0, amount: 0 });

  useEffect(() => {
    loadBaseData();
  }, []);

  const loadBaseData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerApi.getAll({ pageSize: 1000 }),
        productApi.getActive(),
      ]);
      setCustomers(customersRes.list || []);
      setProducts(productsRes || []);
    } catch (error) {
      console.error('加载基础数据失败:', error);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setOutboundItems([]);
    setModalVisible(true);
  };

  const handleView = (record: InventoryOutbound) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleAddItem = () => {
    setOutboundItems([
      ...outboundItems,
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
    const newItems = [...outboundItems];
    newItems.splice(index, 1);
    setOutboundItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...outboundItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].productName = product.name;
        newItems[index].unitPrice = product.price;
        newItems[index].amount = newItems[index].quantity * product.price;
      }
    }

    setOutboundItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (outboundItems.length === 0) {
        message.error('请至少添加一项出库商品');
        return;
      }
      
      // 逐个创建出库记录
      for (const item of outboundItems) {
        await inventoryApi.createOutbound({
          productId: item.productId,
          quantity: item.quantity,
          weight: item.weight,
          type: 'sale',
          reason: values.remark,
        });
      }
      
      message.success('出库单创建成功');
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('创建失败:', error);
      message.error('创建出库单失败');
    }
  };

  const totalQuantity = outboundItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = outboundItems.reduce((sum, item) => sum + item.amount, 0);

  const columns: ProColumns<InventoryOutbound>[] = [
    {
      title: '出库单号',
      dataIndex: 'outboundNo',
      key: 'outboundNo',
      render: (text) => <Text strong style={{ color: '#D4380D' }}>{text}</Text>,
    },
    {
      title: '商品',
      key: 'product',
      search: false,
      render: (_, record) => <Text>{record.product?.name || '-'}</Text>,
    },
    {
      title: '出库数量',
      dataIndex: 'quantity',
      key: 'quantity',
      search: false,
      render: (quantity) => <Text strong>{quantity}只</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      valueType: 'select',
      valueEnum: {
        sale: { text: '销售出库', status: 'Success' },
        loss: { text: '损耗', status: 'Error' },
        adjust: { text: '调整出库', status: 'Default' },
      },
    },
    {
      title: '出库时间',
      dataIndex: 'outboundAt',
      key: 'outboundAt',
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
        title: '出库管理',
        subTitle: '管理活禽出库记录',
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日出库单" value={stats.count} suffix="单" />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日出库数量" value={stats.quantity} suffix="只" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic title="今日销售金额" value={stats.amount} precision={0} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <ProTable<InventoryOutbound>
          headerTitle="出库记录"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新建出库单
            </Button>,
          ]}
          request={async (params) => {
            try {
              const res = await inventoryApi.getOutbounds({
                page: params.current,
                pageSize: params.pageSize,
                type: params.type,
              });
              // 更新统计
              const today = dayjs().format('YYYY-MM-DD');
              const todayRecords = (res.list || []).filter((r: InventoryOutbound) => 
                dayjs(r.outboundAt).format('YYYY-MM-DD') === today
              );
              setStats({
                count: todayRecords.length,
                quantity: todayRecords.reduce((sum: number, r: InventoryOutbound) => sum + r.quantity, 0),
                amount: 0, // 出库没有金额
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

      {/* 新建出库单弹窗 */}
      <Modal
        title="新建出库单"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={900}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="outboundDate" label="出库日期" initialValue={dayjs()}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="remark" label="备注/原因">
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Divider>出库商品明细</Divider>

        <Table
          dataSource={outboundItems}
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
                  合计金额: <Text strong style={{ color: '#52c41a', fontSize: 18 }}>¥{totalAmount.toFixed(2)}</Text>
                </Text>
              </Space>
            </div>
          )}
        />
      </Modal>

      {/* 出库单详情弹窗 */}
      <Modal
        title="出库单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <div className={styles.detail}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text type="secondary">出库单号</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>{currentRecord.outboundNo}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">商品</Text>
                <br />
                <Text strong>{currentRecord.product?.name || '-'}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">出库数量</Text>
                <br />
                <Text strong>{currentRecord.quantity}只</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">类型</Text>
                <br />
                <Tag color="error">{currentRecord.type}</Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">出库时间</Text>
                <br />
                <Text>{currentRecord.outboundAt}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">原因</Text>
                <br />
                <Text>{currentRecord.reason || '-'}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OutboundPage;
