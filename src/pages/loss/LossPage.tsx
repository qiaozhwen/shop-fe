import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Modal, Form, Select, InputNumber, DatePicker, App as AntdApp } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLosses, useLossMutations } from '@/hooks/useBiz';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { LossReason } from '@/types/biz';
import { LOSS_REASON_LABEL } from '@/types/biz';

const COLOR: Record<LossReason, string> = { DEAD: 'red', SICK: 'orange', INJURY: 'gold', ESCAPED: 'default', OTHER: 'default' };

export default function LossPage() {
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useLosses({ page, pageSize, keyword });
  const { create } = useLossMutations();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const submit = async () => {
    const v = await form.validateFields();
    const st = stores?.find((s) => s.id === v.storeId);
    const cat = cats?.find((c) => c.id === v.categoryId);
    await create.mutateAsync({
      ...v,
      storeName: st?.name ?? '',
      categoryName: cat?.name ?? '',
      occurredAt: v.occurredAt.format('YYYY-MM-DD HH:mm:ss'),
    });
    message.success('已记录');
    setOpen(false);
    form.resetFields();
  };

  return (
    <Card title="损耗记录" extra={
      <Space>
        <Input allowClear placeholder="门店/品类/处理人" prefix={<SearchOutlined />} style={{ width: 220 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); form.setFieldsValue({ occurredAt: dayjs(), reason: 'DEAD' }); setOpen(true); }}>新增损耗</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '门店', dataIndex: 'storeName' },
          { title: '品类', dataIndex: 'categoryName' },
          { title: '批次', dataIndex: 'batchNo' },
          { title: '只数', dataIndex: 'quantity', width: 80 },
          { title: '原因', dataIndex: 'reason', width: 100, render: (v: LossReason) => <Tag color={COLOR[v]}>{LOSS_REASON_LABEL[v]}</Tag> },
          { title: '处理人', dataIndex: 'handler', width: 100 },
          { title: '处理方式', dataIndex: 'disposeMethod', width: 120 },
          { title: '发生时间', dataIndex: 'occurredAt', width: 160 },
        ]}
      />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title="新增损耗记录" confirmLoading={create.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="storeId" label="门店" rules={[{ required: true }]}>
            <Select options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="品类" rules={[{ required: true }]}>
            <Select options={(cats ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="batchNo" label="批次号"><Input /></Form.Item>
          <Form.Item name="quantity" label="损耗只数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="reason" label="原因" rules={[{ required: true }]}>
            <Select options={(Object.keys(LOSS_REASON_LABEL) as LossReason[]).map((k) => ({ value: k, label: LOSS_REASON_LABEL[k] }))} />
          </Form.Item>
          <Form.Item name="handler" label="处理人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="disposeMethod" label="处理方式" rules={[{ required: true }]}>
            <Select options={['无害化处理', '焚烧', '深埋', '隔离观察'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="occurredAt" label="发生时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
