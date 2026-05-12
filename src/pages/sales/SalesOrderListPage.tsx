import { useState } from 'react';
import { Card, Table, Tag, Button, Input, Select, Space, App as AntdApp } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSalesOrders, useSalesOrderMutations } from '@/hooks/useSalesOrders';
import type { OrderStatus } from '@/types/order';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, PAY_METHOD_LABEL } from '@/types/order';

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const { data, isLoading } = useSalesOrders({ page, pageSize, keyword, status });
  const { updateStatus } = useSalesOrderMutations();

  return (
    <Card title="销售订单" extra={
      <Space>
        <Input
          allowClear
          placeholder="订单号 / 门店 / 客户手机"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          style={{ width: 240 }}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 120 }}
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((k) => ({ value: k, label: ORDER_STATUS_LABEL[k] }))}
        />
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        columns={[
          { title: '订单号', dataIndex: 'orderNo', width: 160 },
          { title: '门店', dataIndex: 'storeName', width: 140 },
          {
            title: '商品摘要',
            render: (_, r) => r.items.map((i: any) => `${i.categoryName}×${i.quantity}`).join(', '),
          },
          { title: '收银员', dataIndex: 'cashierName', width: 100 },
          { title: '客户', dataIndex: 'customerPhone', width: 120 },
          { title: '应收', dataIndex: 'payable', width: 100, render: (v: number) => <span style={{ color: '#d4380d' }}>¥{v.toFixed(2)}</span> },
          { title: '支付', dataIndex: 'payMethod', width: 80, render: (v) => v ? PAY_METHOD_LABEL[v as keyof typeof PAY_METHOD_LABEL] : '-' },
          {
            title: '状态', dataIndex: 'status', width: 100,
            render: (s: OrderStatus) => <Tag color={ORDER_STATUS_COLOR[s]}>{ORDER_STATUS_LABEL[s]}</Tag>,
          },
          { title: '下单时间', dataIndex: 'createdAt', width: 160 },
          {
            title: '操作', width: 200, fixed: 'right',
            render: (_, r) => (
              <Space size={4}>
                <Button size="small" type="link" onClick={() => navigate(`/sales/orders/${r.id}`)}>详情</Button>
                {r.status === 'PENDING' && (
                  <Button size="small" type="link" onClick={() => updateStatus.mutate({ id: r.id, status: 'PAID' }, { onSuccess: () => message.success('已标记为已付款') })}>
                    收款
                  </Button>
                )}
                {(r.status === 'PAID' || r.status === 'PROCESSING' || r.status === 'READY') && (
                  <Button size="small" type="link" onClick={() => updateStatus.mutate({ id: r.id, status: 'COMPLETED' }, { onSuccess: () => message.success('已完成') })}>
                    完成
                  </Button>
                )}
                {r.status !== 'COMPLETED' && r.status !== 'CANCELED' && (
                  <Button size="small" type="link" danger onClick={() => modal.confirm({
                    title: '确认取消订单？',
                    onOk: () => updateStatus.mutate({ id: r.id, status: 'CANCELED' }),
                  })}>
                    取消
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
