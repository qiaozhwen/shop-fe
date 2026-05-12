import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Modal, Form, Select, Switch, DatePicker, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStaff, useStaffMutations } from '@/hooks/usePeople';
import { useAllStores } from '@/hooks/useStores';
import type { Staff, StaffRole } from '@/types/people';
import { STAFF_ROLE_LABEL } from '@/types/people';

const COLOR: Record<StaffRole, string> = { MANAGER: 'gold', CASHIER: 'blue', BUTCHER: 'red', HELPER: 'default' };

export default function StaffPage() {
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<StaffRole | undefined>();
  const [storeId, setStoreId] = useState<number | undefined>();
  const { data, isLoading } = useStaff({ page, pageSize, keyword, role, storeId });
  const { create, update, remove } = useStaffMutations();
  const { data: stores } = useAllStores();
  const [editing, setEditing] = useState<Staff | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const openModal = (row?: Staff) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue({ ...row, hireDate: row.hireDate ? dayjs(row.hireDate) : undefined });
    } else {
      form.setFieldsValue({ enabled: true, role: 'CASHIER', hireDate: dayjs() });
    }
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const st = stores?.find((s) => s.id === v.storeId);
    const payload = { ...v, storeName: st?.name ?? '', hireDate: v.hireDate.format('YYYY-MM-DD') };
    if (editing) await update.mutateAsync({ id: editing.id, ...payload });
    else await create.mutateAsync(payload);
    message.success('已保存');
    setOpen(false);
  };

  return (
    <Card title="员工管理" extra={
      <Space wrap>
        <Select allowClear placeholder="岗位" style={{ width: 130 }} value={role} onChange={(v) => { setRole(v); setPage(1); }}
          options={(Object.keys(STAFF_ROLE_LABEL) as StaffRole[]).map((k) => ({ value: k, label: STAFF_ROLE_LABEL[k] }))} />
        <Select allowClear placeholder="门店" style={{ width: 160 }} value={storeId} onChange={(v) => { setStoreId(v); setPage(1); }}
          options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
        <Input allowClear placeholder="姓名/手机" prefix={<SearchOutlined />} style={{ width: 180 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增员工</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '姓名', dataIndex: 'name' },
          { title: '手机', dataIndex: 'phone', width: 130 },
          { title: '岗位', dataIndex: 'role', width: 100, render: (v: StaffRole) => <Tag color={COLOR[v]}>{STAFF_ROLE_LABEL[v]}</Tag> },
          { title: '所属门店', dataIndex: 'storeName' },
          { title: '入职日期', dataIndex: 'hireDate', width: 110 },
          { title: '状态', dataIndex: 'enabled', width: 80, render: (v) => v ? <Tag color="green">在职</Tag> : <Tag>离职</Tag> },
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

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title={editing ? '编辑员工' : '新增员工'} confirmLoading={create.isPending || update.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="手机" rules={[{ required: true }]}><Input maxLength={11} /></Form.Item>
          <Form.Item name="role" label="岗位" rules={[{ required: true }]}>
            <Select options={(Object.keys(STAFF_ROLE_LABEL) as StaffRole[]).map((k) => ({ value: k, label: STAFF_ROLE_LABEL[k] }))} />
          </Form.Item>
          <Form.Item name="storeId" label="所属门店" rules={[{ required: true }]}>
            <Select options={(stores ?? []).map((s) => ({ value: s.id, label: s.name }))} />
          </Form.Item>
          <Form.Item name="hireDate" label="入职日期" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="enabled" label="状态" valuePropName="checked"><Switch checkedChildren="在职" unCheckedChildren="离职" /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
