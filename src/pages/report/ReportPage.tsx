import { Card, Col, Row, Statistic, Table, Tabs, Tag, Progress } from 'antd';
import { useDashboard } from '@/hooks/usePeople';
import { useSalesOrders } from '@/hooks/useSalesOrders';
import { useInventory } from '@/hooks/useInventory';
import { useLosses } from '@/hooks/useBiz';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/types/order';
import { LOSS_REASON_LABEL } from '@/types/biz';

export default function ReportPage() {
  const { data: ds } = useDashboard();
  const { data: orders } = useSalesOrders({ pageSize: 100 });
  const { data: inv } = useInventory({ pageSize: 100 });
  const { data: losses } = useLosses({ pageSize: 100 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={16}>
        <Col xs={24} sm={6}><Card><Statistic title="今日销售额" value={ds?.todaySales ?? 0} prefix="¥" precision={2} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="订单数" value={orders?.total ?? 0} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="库存(只)" value={inv?.list.reduce((s, i) => s + i.quantity, 0) ?? 0} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="损耗(只)" value={losses?.list.reduce((s, l) => s + l.quantity, 0) ?? 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs
          items={[
            {
              key: 'sales',
              label: '销售明细',
              children: (
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={orders?.list}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: '订单号', dataIndex: 'orderNo', width: 160 },
                    { title: '门店', dataIndex: 'storeName' },
                    { title: '应收', dataIndex: 'payable', render: (v) => `¥${v.toFixed(2)}` },
                    { title: '状态', dataIndex: 'status', render: (s) => <Tag color={ORDER_STATUS_COLOR[s as keyof typeof ORDER_STATUS_COLOR]}>{ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL]}</Tag> },
                    { title: '时间', dataIndex: 'createdAt' },
                  ]}
                />
              ),
            },
            {
              key: 'inv',
              label: '库存明细',
              children: (
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={inv?.list}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: '门店', dataIndex: 'storeName' },
                    { title: '品类', dataIndex: 'categoryName' },
                    { title: '批次', dataIndex: 'batchNo' },
                    { title: '只数', dataIndex: 'quantity' },
                    { title: '总重(斤)', dataIndex: 'totalWeight' },
                    {
                      title: '占比',
                      render: (_, r) => {
                        const total = inv?.list.reduce((s, x) => s + x.quantity, 0) || 1;
                        return <Progress percent={Math.round((r.quantity / total) * 100)} />;
                      },
                    },
                  ]}
                />
              ),
            },
            {
              key: 'loss',
              label: '损耗明细',
              children: (
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={losses?.list}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: '门店', dataIndex: 'storeName' },
                    { title: '品类', dataIndex: 'categoryName' },
                    { title: '只数', dataIndex: 'quantity' },
                    { title: '原因', dataIndex: 'reason', render: (v) => LOSS_REASON_LABEL[v as keyof typeof LOSS_REASON_LABEL] },
                    { title: '处理方式', dataIndex: 'disposeMethod' },
                    { title: '处理人', dataIndex: 'handler' },
                    { title: '时间', dataIndex: 'occurredAt' },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
