import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Modal, Form, Select, InputNumber, Switch, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { usePoultry, usePoultryMutations } from '@/hooks/usePoultry';
import type { PoultryCategory } from '@/types/poultry';

const SPECIES = ['鸡', '鸭', '鹅', '鸽', '鹌鹑', '兔', '其他'];

export default function PoultryCategoryPage() {
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = usePoultry({ page, pageSize, keyword });
  const { create, update, remove } = usePoultryMutations();
  const [editing, setEditing] = useState<PoultryCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const openModal = (row?: PoultryCategory) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue(row);
    else form.setFieldsValue({ enabled: true, unit: 'JIN', species: '鸡', avgWeight: 3, basePrice: 0, processingFee: 0 });
    setOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...values });
      message.success('已更新');
    } else {
      await create.mutateAsync(values);
      message.success('已新增');
    }
    setOpen(false);
  };

  return (
    <Card title="活禽品类" extra={
      <Space>
        <Input allowClear placeholder="名称/编码/品种" prefix={<SearchOutlined />} style={{ width: 220 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增品类</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '编码', dataIndex: 'code', width: 90 },
          { title: '名称', dataIndex: 'name' },
          { title: '品种', dataIndex: 'species', width: 80, render: (v) => <Tag>{v}</Tag> },
          { title: '计价单位', dataIndex: 'unit', width: 80, render: (v) => v === 'JIN' ? '元/斤' : v === 'KG' ? '元/千克' : '元/只' },
          { title: '单价', dataIndex: 'basePrice', width: 100, render: (v) => `¥${Number(v).toFixed(2)}` },
          { title: '加工费', dataIndex: 'processingFee', width: 100, render: (v) => `¥${Number(v).toFixed(2)}/只` },
          { title: '平均重量(斤)', dataIndex: 'avgWeight', width: 110 },
          { title: '状态', dataIndex: 'enabled', width: 80, render: (v: boolean) => v ? <Tag color="green">启用</Tag> : <Tag>停用</Tag> },
          {
            title: '操作', width: 140, fixed: 'right',
            render: (_, r) => (
              <Space size={4}>
                <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openModal(r)}>编辑</Button>
                <Button size="small" type="link" danger icon={<DeleteOutlined />}
                  onClick={() => modal.confirm({ title: '确认删除？', onOk: () => remove.mutateAsync(r.id).then(() => message.success('已删除')) })}>
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title={editing ? '编辑品类' : '新增品类'} confirmLoading={create.isPending || update.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="species" label="品种" rules={[{ required: true }]}>
            <Select options={SPECIES.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="unit" label="计价单位" rules={[{ required: true }]}>
            <Select options={[{ value: 'JIN', label: '元/斤' }, { value: 'KG', label: '元/千克' }, { value: 'PIECE', label: '元/只' }]} />
          </Form.Item>
          <Form.Item name="basePrice" label="单价" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="processingFee" label="加工费 (元/只)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="avgWeight" label="平均重量 (斤)"><InputNumber min={0} step={0.1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked"><Switch checkedChildren="启用" unCheckedChildren="停用" /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
