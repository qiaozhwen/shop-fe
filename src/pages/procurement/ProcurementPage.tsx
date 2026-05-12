import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Modal, Form, Select, InputNumber, App as AntdApp } from 'antd';
import { PlusOutlined, CheckOutlined, SearchOutlined } from '@ant-design/icons';
import { usePurchases, usePurchaseMutations, useAllSuppliers } from '@/hooks/useBiz';
import { useAllStores } from '@/hooks/useStores';
import { useAllPoultry } from '@/hooks/usePoultry';
import type { PurchaseStatus } from '@/types/biz';
import { PURCHASE_STATUS_LABEL } from '@/types/biz';

const COLOR: Record<PurchaseStatus, string> = { DRAFT: 'default', SUBMITTED: 'blue', RECEIVED: 'green', CANCELED: 'red' };

export default function ProcurementPage() {
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = usePurchases({ page, pageSize, keyword });
  const { create, receive } = usePurchaseMutations();
  const { data: suppliers } = useAllSuppliers();
  const { data: stores } = useAllStores();
  const { data: cats } = useAllPoultry();

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const submit = async () => {
    const v = await form.validateFields();
    const sup = suppliers?.find((s) => s.id === v.supplierId);
    const st = stores?.find((s) => s.id === v.storeId);
    const cat = cats?.find((c) => c.id === v.categoryId);
    await create.mutateAsync({
      supplierId: v.supplierId,
      supplierName: sup?.name ?? '',
      storeId: v.storeId,
      storeName: st?.name ?? '',
      categoryName: cat?.name ?? '',
      quantity: v.quantity,
      totalWeight: v.totalWeight,
      unitPrice: v.unitPrice,
      batchNo: v.batchNo,
      remark: v.remark,
    } as any);
    message.success('已创建采购单');
    setOpen(false);
    form.resetFields();
  };

  return (
    <Card title="采购入库" extra={
      <Space>
        <Input allowClear placeholder="单号/供应商/品类" prefix={<SearchOutlined />} style={{ width: 220 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>新增采购单</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        scroll={{ x: 1200 }}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '单号', dataIndex: 'orderNo', width: 160 },
          { title: '供应商', dataIndex: 'supplierName' },
          { title: '门店', dataIndex: 'storeName' },
          { title: '品类', dataIndex: 'categoryName' },
          { title: '只数', dataIndex: 'quantity', width: 80 },
          { title: '总重(斤)', dataIndex: 'totalWeight', width: 100 },
          { title: '单价/斤', dataIndex: 'unitPrice', width: 100, render: (v) => `¥${v}` },
          { title: '金额', dataIndex: 'amount', width: 110, render: (v) => <span style={{ color: '#d4380d' }}>¥{v.toFixed(2)}</span> },
          { title: '批次', dataIndex: 'batchNo', width: 130 },
          { title: '状态', dataIndex: 'status', width: 90, render: (s: PurchaseStatus) => <Tag color={COLOR[s]}>{PURCHASE_STATUS_LABEL[s]}</Tag> },
          { title: '创建时间', dataIndex: 'createdAt', width: 160 },
          {
            title: '操作', width: 100, fixed: 'right',
            render: (_, r) => r.status === 'SUBMITTED' && (
              <Button size="small" type="link" icon={<CheckOutlined />}
                onClick={() => receive.mutate(r.id, { onSuccess: () => message.success('已确认入栏') })}>
                确认入栏
              </Button>
            ),
          },
        ]}
      />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title="新增采购单" confirmLoading={create.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="supplierId" label="供应商" rules={[{ required: true }]}>
            <Select options={(suppliers ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="storeId" label="入栏门店" rules={[{ required: true }]}>
            <Select options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="品类" rules={[{ required: true }]}>
            <Select options={(cats ?? []).map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="quantity" label="只数" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="totalWeight" label="总重 (斤)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unitPrice" label="进货单价 (元/斤)" rules={[{ required: true }]}><InputNumber min={0} step={0.1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="batchNo" label="批次号" rules={[{ required: true }]}><Input placeholder="如 B20260508-01" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
