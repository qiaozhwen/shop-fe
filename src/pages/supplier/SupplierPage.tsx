import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Modal, Form, Select, Switch, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useSuppliers, useSupplierMutations } from '@/hooks/useBiz';
import type { Supplier } from '@/types/biz';

export default function SupplierPage() {
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useSuppliers({ page, pageSize, keyword });
  const { create, update, remove } = useSupplierMutations();
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const openModal = (row?: Supplier) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue(row);
    else form.setFieldsValue({ enabled: true, level: 'A' });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    if (editing) await update.mutateAsync({ id: editing.id, ...v });
    else await create.mutateAsync(v);
    message.success('已保存');
    setOpen(false);
  };

  return (
    <Card title="供应商" extra={
      <Space>
        <Input allowClear placeholder="名称/联系人/电话" prefix={<SearchOutlined />} style={{ width: 220 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增供应商</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '联系人', dataIndex: 'contact', width: 100 },
          { title: '电话', dataIndex: 'phone', width: 130 },
          { title: '地址', dataIndex: 'address' },
          { title: '供应品类', dataIndex: 'category', width: 120 },
          { title: '等级', dataIndex: 'level', width: 70, render: (v) => <Tag color={v === 'A' ? 'gold' : v === 'B' ? 'blue' : 'default'}>{v}</Tag> },
          { title: '状态', dataIndex: 'enabled', width: 80, render: (v) => v ? <Tag color="green">启用</Tag> : <Tag>停用</Tag> },
          {
            title: '操作', width: 140,
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

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title={editing ? '编辑供应商' : '新增供应商'} confirmLoading={create.isPending || update.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact" label="联系人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="category" label="供应品类"><Input placeholder="如：鸡/鸭/鹅" /></Form.Item>
          <Form.Item name="level" label="等级">
            <Select options={['A', 'B', 'C'].map((l) => ({ value: l, label: l }))} />
          </Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked"><Switch checkedChildren="启用" unCheckedChildren="停用" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
