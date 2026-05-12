import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Select, Input, Modal, Form, InputNumber, App as AntdApp, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useInventory, useInventoryMutations } from '@/hooks/useInventory';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { HealthStatus } from '@/types/inventory';

const HEALTH_LABEL: Record<HealthStatus, string> = { HEALTHY: '健康', OBSERVED: '观察', SICK: '患病', QUARANTINE: '隔离' };
const HEALTH_COLOR: Record<HealthStatus, string> = { HEALTHY: 'green', OBSERVED: 'gold', SICK: 'orange', QUARANTINE: 'red' };

export default function InventoryPage() {
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [storeId, setStoreId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const { data, isLoading } = useInventory({ page, pageSize, keyword, storeId, categoryId });
  const { create, adjust, remove } = useInventoryMutations();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();

  const [open, setOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState<{ id: number } | null>(null);
  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ inStockAt: dayjs(), quantity: 50, avgWeight: 3, health: 'HEALTHY' });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const store = stores?.find((s) => s.id === v.storeId);
    const cat = cats?.find((c) => c.id === v.categoryId);
    await create.mutateAsync({
      ...v,
      inStockAt: v.inStockAt.format('YYYY-MM-DD HH:mm:ss'),
      storeName: store?.name ?? '',
      categoryName: cat?.name ?? '',
    });
    message.success('已入栏');
    setOpen(false);
  };

  const submitAdjust = async () => {
    const v = await adjustForm.validateFields();
    await adjust.mutateAsync({ id: adjustOpen!.id, delta: v.delta, reason: v.reason });
    message.success('已调整');
    setAdjustOpen(null);
  };

  return (
    <Card title="活禽存栏" extra={
      <Space wrap>
        <Select allowClear placeholder="门店" style={{ width: 160 }} value={storeId} onChange={(v) => { setStoreId(v); setPage(1); }}
          options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
        <Select allowClear placeholder="品类" style={{ width: 140 }} value={categoryId} onChange={(v) => { setCategoryId(v); setPage(1); }}
          options={(cats ?? []).map((c) => ({ value: c.id, label: c.name }))} />
        <Input allowClear placeholder="批次/品类" prefix={<SearchOutlined />} style={{ width: 180 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增入栏</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        scroll={{ x: 1100 }}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '门店', dataIndex: 'storeName' },
          { title: '品类', dataIndex: 'categoryName' },
          { title: '批次号', dataIndex: 'batchNo', width: 140 },
          { title: '只数', dataIndex: 'quantity', width: 80 },
          { title: '平均重量(斤)', dataIndex: 'avgWeight', width: 110 },
          { title: '总重(斤)', dataIndex: 'totalWeight', width: 100 },
          { title: '健康', dataIndex: 'health', width: 80, render: (v: HealthStatus) => <Tag color={HEALTH_COLOR[v]}>{HEALTH_LABEL[v]}</Tag> },
          { title: '入栏时间', dataIndex: 'inStockAt', width: 160 },
          { title: '供应商', dataIndex: 'supplierName', width: 140 },
          {
            title: '操作', width: 180, fixed: 'right',
            render: (_, r) => (
              <Space size={4}>
                <Button size="small" type="link" icon={<SwapOutlined />}
                  onClick={() => { setAdjustOpen({ id: r.id }); adjustForm.resetFields(); }}>调整</Button>
                <Button size="small" type="link" danger icon={<DeleteOutlined />}
                  onClick={() => modal.confirm({ title: '确认清栏？', onOk: () => remove.mutateAsync(r.id).then(() => message.success('已清栏')) })}>清栏</Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title="新增入栏" confirmLoading={create.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label="门店" rules={[{ required: true }]}>
            <Select options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="品类" rules={[{ required: true }]}>
            <Select options={(cats ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号" rules={[{ required: true }]}><Input placeholder="如 B20260508-01" /></Form.Item>
          <Form.Item name="quantity" label="只数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="avgWeight" label="平均重量(斤)" rules={[{ required: true }]}><InputNumber min={0.1} step={0.1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="health" label="健康状态" rules={[{ required: true }]}>
            <Select options={(Object.keys(HEALTH_LABEL) as HealthStatus[]).map((k) => ({ value: k, label: HEALTH_LABEL[k] }))} />
          </Form.Item>
          <Form.Item name="inStockAt" label="入栏时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商"><Input /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Modal open={!!adjustOpen} onCancel={() => setAdjustOpen(null)} onOk={submitAdjust} title="库存调整" confirmLoading={adjust.isPending}>
        <Form form={adjustForm} layout="vertical">
          <Form.Item name="delta" label="变动只数 (正为入栏，负为出栏)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="原因" rules={[{ required: true }]}>
            <Input placeholder="如：补货 / 调拨 / 损耗" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
