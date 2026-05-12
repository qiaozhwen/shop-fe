import { useState } from 'react';
import { Card, Table, Tag, InputNumber, App as AntdApp, Button, Space } from 'antd';
import { usePricing, usePricingMutations } from '@/hooks/usePeople';
import type { PricingItem } from '@/types/people';

export default function PricingPage() {
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading } = usePricing({ page, pageSize });
  const { update } = usePricingMutations();
  const [draft, setDraft] = useState<Record<number, Partial<PricingItem>>>({});

  const save = async (row: PricingItem) => {
    const patch = draft[row.id];
    if (!patch) return;
    await update.mutateAsync({ id: row.id, ...patch });
    message.success(`${row.categoryName} 价格已更新`);
    setDraft((d) => { const next = { ...d }; delete next[row.id]; return next; });
  };

  return (
    <Card title="价格管理（每日单价）" extra={<Tag color="orange">直接修改单元格后点击保存</Tag>}>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '日期', dataIndex: 'date', width: 110 },
          { title: '品类', dataIndex: 'categoryName' },
          {
            title: '当日单价 (元)', dataIndex: 'price', width: 160,
            render: (v, r) => (
              <InputNumber min={0} step={0.1} defaultValue={v}
                onChange={(val) => setDraft((d) => ({ ...d, [r.id]: { ...(d[r.id] || {}), price: val ?? 0 } }))} />
            ),
          },
          {
            title: '加工费 (元/只)', dataIndex: 'processingFee', width: 160,
            render: (v, r) => (
              <InputNumber min={0} step={0.1} defaultValue={v}
                onChange={(val) => setDraft((d) => ({ ...d, [r.id]: { ...(d[r.id] || {}), processingFee: val ?? 0 } }))} />
            ),
          },
          {
            title: '促销价', dataIndex: 'promotionPrice', width: 140,
            render: (v, r) => (
              <InputNumber min={0} step={0.1} defaultValue={v}
                placeholder="无" onChange={(val) => setDraft((d) => ({ ...d, [r.id]: { ...(d[r.id] || {}), promotionPrice: val ?? undefined } }))} />
            ),
          },
          {
            title: '操作', width: 100,
            render: (_, r) => (
              <Space>
                <Button size="small" type="primary" disabled={!draft[r.id]} onClick={() => save(r)}>保存</Button>
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );
}
