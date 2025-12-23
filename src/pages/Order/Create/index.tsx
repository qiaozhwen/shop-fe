import {
  ClearOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
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
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { productApi, customerApi, orderApi, Product, Customer } from '@/services/api';
import styles from './index.less';

const { Text, Title } = Typography;

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

const OrderCreatePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchText, setSearchText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'wechat' | 'alipay'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, customersRes] = await Promise.all([
        productApi.getActive(),
        customerApi.getAll({ pageSize: 1000 }),
      ]);
      setProducts(productsRes || []);
      setCustomers(customersRes.list || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  // 获取分类列表
  const categories = ['全部', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // 过滤商品
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === '全部' || p.category?.name === selectedCategory;
    const matchSearch = !searchText || 
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(searchText.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // 添加到购物车
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.price }]);
    }
  };

  // 更新购物车数量
  const updateQuantity = (productId: number, quantity: number) => {
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
  const removeFromCart = (productId: number) => {
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
  const handlePayment = async () => {
    if (paymentMethod === 'cash' && receivedAmount < totalAmount) {
      message.error('收款金额不足');
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomer) {
      message.error('请先选择客户');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || '散客',
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.price,
          amount: item.subtotal,
        })),
        totalQuantity,
        totalAmount,
        actualAmount: totalAmount,
        paymentMethod,
        remark: '',
      };

      const order = await orderApi.create(orderData);
      
      // 如果不是挂账，直接支付
      if (paymentMethod !== 'credit') {
        await orderApi.pay(order.id, {
          paymentMethod,
          amount: totalAmount,
          receivedAmount: paymentMethod === 'cash' ? receivedAmount : totalAmount,
        });
      }

      message.success('订单创建成功！');
      setPaymentModalVisible(false);
      setCart([]);
      setSelectedCustomer(null);
      
      // 显示成功信息
      Modal.success({
        title: '支付成功',
        content: (
          <div>
            <p>订单号: {order.orderNo}</p>
            <p>实收: ¥{receivedAmount}</p>
            {paymentMethod === 'cash' && receivedAmount > totalAmount && (
              <p>找零: ¥{(receivedAmount - totalAmount).toFixed(2)}</p>
            )}
          </div>
        ),
      });
    } catch (error) {
      message.error('创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 购物车列表列
  const cartColumns = [
    {
      title: '商品',
      key: 'product',
      render: (_: any, record: CartItem) => (
        <Space>
          <Avatar shape="square" size="small" src={record.imageUrl}>
            {record.name?.charAt(0)}
          </Avatar>
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
                      onClick={() => setSelectedCategory(cat as string)}
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
                    className={`${styles.productItem} ${!product.isActive ? styles.outOfStock : ''}`}
                    onClick={() => product.isActive && addToCart(product)}
                  >
                    <div className={styles.productImage}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        product.name?.charAt(0)
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <Text strong className={styles.productName}>{product.name}</Text>
                      <div className={styles.productMeta}>
                        <Text strong style={{ color: '#D4380D', fontSize: 16 }}>¥{product.price}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{product.unit}</Text>
                      </div>
                    </div>
                    {!product.isActive && (
                      <div className={styles.stockoutMask}>
                        <Tag color="error">已下架</Tag>
                      </div>
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
                          <Tag color={selectedCustomer.level === 'vip' ? 'gold' : selectedCustomer.level === 'svip' ? 'purple' : 'default'}>
                            {selectedCustomer.level?.toUpperCase() || '普通'}
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
              <Tag color={customer.level === 'vip' ? 'gold' : customer.level === 'svip' ? 'purple' : 'default'}>
                {customer.level?.toUpperCase() || '普通'}
              </Tag>
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
        confirmLoading={loading}
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
                  <Text strong style={{ color: '#52c41a' }}>¥{(selectedCustomer.creditLimit || 0).toLocaleString()}</Text>
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
