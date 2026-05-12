import { useMemo, useState } from 'react';
import {
  Card, Row, Col, List, Avatar, Button, InputNumber, Select, Input,
  Divider, Tag, Space, App as AntdApp, Empty, Statistic, Radio,
} from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, PrinterOutlined } from '@ant-design/icons';
import { useAllPoultry } from '@/hooks/usePoultry';
import { useSalesOrderMutations } from '@/hooks/useSalesOrders';
import { useAppStore } from '@/store/useAppStore';
import { useAllStores } from '@/hooks/useStores';
import type { ProcessMethod } from '@/types/poultry';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';
import type { PayMethod } from '@/types/order';
import { PAY_METHOD_LABEL } from '@/types/order';

interface CartItem {
  categoryId: number;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  weight: number;
  processMethod: ProcessMethod;
  processFee: number;
  processFeePerPiece: number;
}

const PROCESS_OPTIONS: ProcessMethod[] = ['ALIVE', 'SLAUGHTER', 'EVISCERATE', 'CHOP', 'TRIM_HEAD_FEET', 'PACK'];

export default function PosPage() {
  const { message } = AntdApp.useApp();
  const { data: cats } = useAllPoultry();
  const { data: stores } = useAllStores();
  const { currentStoreId, setCurrentStore } = useAppStore();
  const { create } = useSalesOrderMutations();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>('CASH');
  const [phone, setPhone] = useState('');

  const total = useMemo(() => cart.reduce((s, c) => s + c.weight * c.unitPrice + c.processFee, 0), [cart]);
  const payable = Math.max(0, total - discount);

  const addToCart = (id: number) => {
    const cat = cats?.find((c) => c.id === id);
    if (!cat) return;
    if (cart.find((c) => c.categoryId === id)) {
      message.info('已在购物车中');
      return;
    }
    setCart([...cart, {
      categoryId: cat.id,
      categoryName: cat.name,
      unitPrice: cat.basePrice,
      quantity: 1,
      weight: cat.avgWeight,
      processMethod: 'SLAUGHTER',
      processFeePerPiece: cat.processingFee,
      processFee: cat.processingFee,
    }]);
  };

  const update = (idx: number, patch: Partial<CartItem>) => {
    setCart((arr) => arr.map((c, i) => {
      if (i !== idx) return c;
      const next = { ...c, ...patch };
      // 重新计算加工费：活禽不收费
      next.processFee = next.processMethod === 'ALIVE' ? 0 : next.processFeePerPiece * next.quantity;
      return next;
    }));
  };

  const remove = (idx: number) => setCart((arr) => arr.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!currentStoreId) return message.warning('请先选择门店');
    if (cart.length === 0) return message.warning('请添加商品');
    try {
      const order = await create.mutateAsync({
        storeId: currentStoreId,
        customerPhone: phone || undefined,
        payMethod,
        discount,
        items: cart.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          quantity: c.quantity,
          weight: c.weight,
          unitPrice: c.unitPrice,
          processMethod: c.processMethod,
          processFee: c.processFee,
          subtotal: c.weight * c.unitPrice + c.processFee,
        })),
      });
      message.success(`下单成功：${order.orderNo}`);
      setCart([]);
      setDiscount(0);
      setPhone('');
    } catch {
      // intercepted
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={14}>
        <Card title="选择活禽品类" size="small" extra={
          <Space>
            <span>门店：</span>
            <Select
              size="small"
              style={{ minWidth: 160 }}
              value={currentStoreId ?? undefined}
              onChange={setCurrentStore}
              options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))}
            />
          </Space>
        }>
          <Row gutter={[12, 12]}>
            {(cats ?? []).filter((c) => c.enabled).map((c) => (
              <Col xs={12} sm={8} md={6} key={c.id}>
                <Card
                  hoverable
                  size="small"
                  onClick={() => addToCart(c.id)}
                  style={{ textAlign: 'center' }}
                >
                  <Avatar size={48} style={{ background: '#fff2e8', color: '#d4380d', fontSize: 24 }}>
                    {c.species[0]}
                  </Avatar>
                  <div style={{ marginTop: 8, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ color: '#d4380d' }}>
                    ¥{c.basePrice.toFixed(2)}/{c.unit === 'JIN' ? '斤' : c.unit === 'KG' ? '千克' : '只'}
                  </div>
                  <div style={{ color: '#999', fontSize: 12 }}>加工费 ¥{c.processingFee}/只</div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={10}>
        <Card
          title={<><ShoppingCartOutlined /> 当前订单 ({cart.length} 项)</>}
          size="small"
          extra={cart.length > 0 && <Button size="small" danger onClick={() => setCart([])}>清空</Button>}
        >
          {cart.length === 0 ? <Empty description="请从左侧选择品类" /> : (
            <List
              dataSource={cart}
              rowKey={(r) => r.categoryId}
              renderItem={(item, idx) => (
                <List.Item style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong>{item.categoryName}</strong>
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(idx)} />
                  </div>
                  <Space wrap style={{ marginTop: 8 }}>
                    <span>只数</span>
                    <InputNumber min={1} value={item.quantity} onChange={(v) => update(idx, { quantity: v ?? 1 })} style={{ width: 80 }} />
                    <span>净重(斤)</span>
                    <InputNumber min={0.1} step={0.1} value={item.weight} onChange={(v) => update(idx, { weight: v ?? 0 })} style={{ width: 90 }} />
                    <span>单价</span>
                    <InputNumber min={0} step={0.1} value={item.unitPrice} onChange={(v) => update(idx, { unitPrice: v ?? 0 })} style={{ width: 90 }} />
                  </Space>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ marginRight: 8 }}>加工方式：</span>
                    <Radio.Group
                      size="small"
                      value={item.processMethod}
                      onChange={(e) => update(idx, { processMethod: e.target.value })}
                    >
                      {PROCESS_OPTIONS.map((p) => (
                        <Radio.Button key={p} value={p}>{PROCESS_METHOD_LABEL[p]}</Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                  <div style={{ marginTop: 6, color: '#d4380d', textAlign: 'right' }}>
                    小计：¥{(item.weight * item.unitPrice + item.processFee).toFixed(2)}
                    {item.processFee > 0 && <span style={{ color: '#999', marginLeft: 6, fontSize: 12 }}>(含加工费 ¥{item.processFee})</span>}
                  </div>
                </List.Item>
              )}
            />
          )}

          <Divider style={{ margin: '12px 0' }} />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="客户手机号（可选）"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
            />
            <div>
              <span style={{ marginRight: 8 }}>优惠：</span>
              <InputNumber min={0} max={total} value={discount} onChange={(v) => setDiscount(v ?? 0)} style={{ width: 120 }} addonAfter="元" />
            </div>
            <div>
              <span style={{ marginRight: 8 }}>支付方式：</span>
              <Radio.Group value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {(Object.keys(PAY_METHOD_LABEL) as PayMethod[]).map((p) => (
                  <Radio.Button key={p} value={p}>{PAY_METHOD_LABEL[p]}</Radio.Button>
                ))}
              </Radio.Group>
            </div>
            <Statistic title="应收" value={payable} precision={2} prefix="¥" valueStyle={{ color: '#d4380d', fontSize: 28 }} />
            <Tag color="default">合计 ¥{total.toFixed(2)}　优惠 ¥{discount.toFixed(2)}</Tag>
            <Space style={{ width: '100%' }} styles={{ item: { flex: 1 } }}>
              <Button type="primary" size="large" block icon={<PrinterOutlined />} loading={create.isPending} onClick={submit}>
                结算并出单
              </Button>
            </Space>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
