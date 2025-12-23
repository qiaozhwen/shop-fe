import {
  ClearOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: string;
  credit: number;
}

// 商品数据
const products: Product[] = [
  { id: 'P001', name: '散养土鸡', category: '鸡类', price: 45, stock: 156, unit: '只', image: '🐔' },
  { id: 'P002', name: '三黄鸡', category: '鸡类', price: 35, stock: 280, unit: '只', image: '🐔' },
  { id: 'P003', name: '乌鸡', category: '鸡类', price: 58, stock: 42, unit: '只', image: '🐔' },
  { id: 'P004', name: '麻鸭', category: '鸭类', price: 38, stock: 18, unit: '只', image: '🦆' },
  { id: 'P005', name: '番鸭', category: '鸭类', price: 48, stock: 95, unit: '只', image: '🦆' },
  { id: 'P006', name: '肉鸽', category: '鸽类', price: 45, stock: 165, unit: '只', image: '🕊️' },
  { id: 'P007', name: '大白鹅', category: '鹅类', price: 128, stock: 85, unit: '只', image: '🦢' },
  { id: 'P008', name: '珍珠鸡', category: '鸡类', price: 68, stock: 35, unit: '只', image: '🐔' },
];

const customers: Customer[] = [
  { id: 'C001', name: '王府酒家', phone: '13800138001', type: 'VIP', credit: 50000 },
  { id: 'C002', name: '福满楼', phone: '13800138002', type: '普通', credit: 20000 },
  { id: 'C003', name: '李氏餐馆', phone: '13800138003', type: 'VIP', credit: 80000 },
  { id: 'C004', name: '张记酒楼', phone: '13800138004', type: '普通', credit: 30000 },
  { id: 'C005', name: '赵家菜馆', phone: '13800138005', type: 'VIP', credit: 100000 },
];

const categories = ['全部', '鸡类', '鸭类', '鸽类', '鹅类'];

const OrderCreatePage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'wechat' | 'alipay'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [form] = Form.useForm();

  // 过滤商品
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === '全部' || p.category === selectedCategory;
    const matchSearch = !searchText || 
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.id.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 添加到购物车
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        message.warning('库存不足');
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      if (product.stock === 0) {
        message.warning('该商品已无库存');
        return;
      }
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  // 更新购物车数量
  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      message.warning('库存不足');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    );
  };

  // 从购物车移除
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // 清空购物车
  const clearCart = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空购物车吗？',
      onOk: () => {
        setCart([]);
        setSelectedCustomer(null);
      },
    });
  };

  // 计算总计
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // 结算
  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('购物车为空');
      return;
    }
    setReceivedAmount(totalAmount);
    setPaymentModalVisible(true);
  };

  // 确认支付
  const handlePayment = () => {
    if (paymentMethod === 'cash' && receivedAmount < totalAmount) {
      message.error('收款金额不足');
      return;
    }
    message.success('订单创建成功！');
    setPaymentModalVisible(false);
    setCart([]);
    setSelectedCustomer(null);
    // 打印小票逻辑
    Modal.success({
      title: '支付成功',
      content: (
        <div>
          <p>订单号: ORD{Date.now()}</p>
          <p>实收: ¥{receivedAmount}</p>
          {paymentMethod === 'cash' && receivedAmount > totalAmount && (
            <p>找零: ¥{(receivedAmount - totalAmount).toFixed(2)}</p>
          )}
        </div>
      ),
    });
  };

  // 购物车列表列
  const cartColumns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <Space>
          <span style={{ fontSize: 24 }}>{record.image}</span>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>¥{record.price}/{record.unit}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '数量',
      key: 'quantity',
      width: 140,
      render: (_: any, record: CartItem) => (
        <Space>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(record.id, record.quantity - 1)}
          />
          <InputNumber
            size="small"
            min={1}
            max={record.stock}
            value={record.quantity}
            style={{ width: 50 }}
            onChange={(v) => updateQuantity(record.id, v || 1)}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(record.id, record.quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 80,
      render: (_: any, record: CartItem) => (
        <Text strong style={{ color: '#D4380D' }}>¥{record.subtotal}</Text>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: '销售开单',
        subTitle: '快速创建销售订单',
      }}
    >
      <div className={styles.orderCreate}>
        <Row gutter={16}>
          {/* 左侧商品选择区 */}
          <Col xs={24} lg={14} xl={15}>
            <Card bordered={false} className={styles.productCard}>
              {/* 搜索和分类 */}
              <div className={styles.productHeader}>
                <Input
                  placeholder="搜索商品名称或编号"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
                <div className={styles.categoryTabs}>
                  {categories.map((cat) => (
                    <Tag
                      key={cat}
                      className={`${styles.categoryTag} ${selectedCategory === cat ? styles.active : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* 商品网格 */}
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`${styles.productItem} ${product.stock === 0 ? styles.outOfStock : ''}`}
                    onClick={() => addToCart(product)}
                  >
                    <div className={styles.productImage}>{product.image}</div>
                    <div className={styles.productInfo}>
                      <Text strong className={styles.productName}>{product.name}</Text>
                      <div className={styles.productMeta}>
                        <Text strong style={{ color: '#D4380D', fontSize: 16 }}>¥{product.price}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>库存: {product.stock}</Text>
                      </div>
                    </div>
                    {product.stock === 0 && (
                      <div className={styles.stockoutMask}>
                        <Tag color="error">已售罄</Tag>
                      </div>
                    )}
                    {product.stock > 0 && product.stock <= 20 && (
                      <Badge.Ribbon text="库存紧张" color="orange" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* 右侧购物车区 */}
          <Col xs={24} lg={10} xl={9}>
            <Card 
              bordered={false} 
              className={styles.cartCard}
              title={
                <div className={styles.cartHeader}>
                  <Space>
                    <ShoppingCartOutlined style={{ fontSize: 18 }} />
                    <Title level={5} style={{ margin: 0 }}>购物车</Title>
                    <Badge count={totalQuantity} style={{ backgroundColor: '#D4380D' }} />
                  </Space>
                  {cart.length > 0 && (
                    <Button type="text" icon={<ClearOutlined />} onClick={clearCart}>
                      清空
                    </Button>
                  )}
                </div>
              }
            >
              {/* 客户选择 */}
              <div className={styles.customerSection}>
                {selectedCustomer ? (
                  <div className={styles.selectedCustomer}>
                    <Space>
                      <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#D4380D' }} />
                      <div>
                        <Text strong>{selectedCustomer.name}</Text>
                        <br />
                        <Space size={4}>
                          <Tag color={selectedCustomer.type === 'VIP' ? 'gold' : 'default'}>
                            {selectedCustomer.type}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedCustomer.phone}
                          </Text>
                        </Space>
                      </div>
                    </Space>
                    <Button size="small" onClick={() => setCustomerModalVisible(true)}>
                      更换
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="dashed"
                    block
                    icon={<UserOutlined />}
                    onClick={() => setCustomerModalVisible(true)}
                  >
                    选择客户（可选）
                  </Button>
                )}
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* 购物车列表 */}
              <div className={styles.cartList}>
                {cart.length === 0 ? (
                  <Empty description="购物车是空的" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    dataSource={cart}
                    columns={cartColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ y: 300 }}
                  />
                )}
              </div>

              {/* 结算区域 */}
              <div className={styles.checkoutSection}>
                <div className={styles.totalInfo}>
                  <div className={styles.totalRow}>
                    <Text>商品数量</Text>
                    <Text strong>{totalQuantity}只</Text>
                  </div>
                  <div className={styles.totalRow}>
                    <Text>商品金额</Text>
                    <Text strong>¥{totalAmount.toFixed(2)}</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div className={styles.totalRow}>
                    <Title level={5} style={{ margin: 0 }}>应付金额</Title>
                    <Title level={3} style={{ margin: 0, color: '#D4380D' }}>
                      ¥{totalAmount.toFixed(2)}
                    </Title>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  className={styles.checkoutBtn}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  结算 ({totalQuantity}只，¥{totalAmount.toFixed(2)})
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 客户选择弹窗 */}
      <Modal
        title="选择客户"
        open={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={500}
      >
        <Input
          placeholder="搜索客户名称或电话"
          prefix={<SearchOutlined />}
          style={{ marginBottom: 16 }}
        />
        <div className={styles.customerList}>
          {customers.map((customer) => (
            <div
              key={customer.id}
              className={styles.customerItem}
              onClick={() => {
                setSelectedCustomer(customer);
                setCustomerModalVisible(false);
              }}
            >
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong>{customer.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{customer.phone}</Text>
                </div>
              </Space>
              <Tag color={customer.type === 'VIP' ? 'gold' : 'default'}>{customer.type}</Tag>
            </div>
          ))}
        </div>
      </Modal>

      {/* 支付弹窗 */}
      <Modal
        title="确认收款"
        open={paymentModalVisible}
        onOk={handlePayment}
        onCancel={() => setPaymentModalVisible(false)}
        okText="确认收款"
        width={500}
      >
        <div className={styles.paymentModal}>
          <div className={styles.paymentAmount}>
            <Text type="secondary">应收金额</Text>
            <Title level={2} style={{ margin: 0, color: '#D4380D' }}>
              ¥{totalAmount.toFixed(2)}
            </Title>
          </div>

          <Divider />

          <Form layout="vertical">
            <Form.Item label="支付方式">
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="cash">现金</Radio.Button>
                <Radio.Button value="wechat">微信</Radio.Button>
                <Radio.Button value="alipay">支付宝</Radio.Button>
                <Radio.Button value="credit">挂账</Radio.Button>
              </Radio.Group>
            </Form.Item>

            {paymentMethod === 'cash' && (
              <>
                <Form.Item label="实收金额">
                  <InputNumber
                    value={receivedAmount}
                    onChange={(v) => setReceivedAmount(v || 0)}
                    style={{ width: '100%' }}
                    size="large"
                    precision={2}
                    prefix="¥"
                  />
                </Form.Item>
                <div className={styles.quickAmount}>
                  {[50, 100, 200, 500].map((amount) => (
                    <Button key={amount} onClick={() => setReceivedAmount(amount)}>
                      ¥{amount}
                    </Button>
                  ))}
                  <Button onClick={() => setReceivedAmount(totalAmount)}>
                    刚好
                  </Button>
                </div>
                {receivedAmount >= totalAmount && (
                  <div className={styles.changeAmount}>
                    <Text type="secondary">找零</Text>
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                      ¥{(receivedAmount - totalAmount).toFixed(2)}
                    </Title>
                  </div>
                )}
              </>
            )}

            {paymentMethod === 'credit' && selectedCustomer && (
              <div className={styles.creditInfo}>
                <Text>
                  客户 <Text strong>{selectedCustomer.name}</Text> 当前信用额度：
                  <Text strong style={{ color: '#52c41a' }}>¥{selectedCustomer.credit.toLocaleString()}</Text>
                </Text>
              </div>
            )}

            {paymentMethod === 'credit' && !selectedCustomer && (
              <div className={styles.creditWarning}>
                <Text type="warning">请先选择客户才能使用挂账</Text>
              </div>
            )}
          </Form>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default OrderCreatePage;

