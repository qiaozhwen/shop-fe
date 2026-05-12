import { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Modal, Form, Select, App as AntdApp } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useMembers, useMemberMutations } from '@/hooks/usePeople';
import type { Member, MemberLevel } from '@/types/people';
import { MEMBER_LEVEL_LABEL } from '@/types/people';

const COLOR: Record<MemberLevel, string> = { BRONZE: 'orange', SILVER: 'default', GOLD: 'gold', DIAMOND: 'purple' };

export default function MemberPage() {
  const { message } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const { data, isLoading } = useMembers({ page, pageSize, keyword });
  const { create, update } = useMemberMutations();
  const [editing, setEditing] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const openModal = (row?: Member) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) form.setFieldsValue(row);
    else form.setFieldsValue({ level: 'BRONZE' });
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    if (editing) await update.mutateAsync({ id: editing.id, ...v });
    else await create.mutateAsync({ ...v, registerStoreName: v.registerStoreName || '总店·城北店' });
    message.success('已保存');
    setOpen(false);
  };

  return (
    <Card title="会员管理" extra={
      <Space>
        <Input allowClear placeholder="姓名/手机/卡号" prefix={<SearchOutlined />} style={{ width: 220 }}
          value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>新增会员</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list}
        pagination={{ current: page, pageSize, total: data?.total ?? 0, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); } }}
        columns={[
          { title: '卡号', dataIndex: 'cardNo', width: 100 },
          { title: '姓名', dataIndex: 'name' },
          { title: '手机', dataIndex: 'phone', width: 130 },
          { title: '等级', dataIndex: 'level', width: 90, render: (v: MemberLevel) => <Tag color={COLOR[v]}>{MEMBER_LEVEL_LABEL[v]}</Tag> },
          { title: '积分', dataIndex: 'points', width: 90 },
          { title: '余额', dataIndex: 'balance', width: 100, render: (v) => `¥${v.toFixed(2)}` },
          { title: '累计消费', dataIndex: 'totalConsumption', width: 110, render: (v) => `¥${v.toFixed(2)}` },
          { title: '注册门店', dataIndex: 'registerStoreName' },
          { title: '注册时间', dataIndex: 'registeredAt', width: 120 },
          { title: '操作', width: 80, render: (_, r) => <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openModal(r)}>编辑</Button> },
        ]}
      />

      <Modal open={open} onCancel={() => setOpen(false)} onOk={submit} title={editing ? '编辑会员' : '新增会员'} confirmLoading={create.isPending || update.isPending}>
        <Form form={form} layout="vertical">
          <Form.Item name="cardNo" label="卡号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="手机" rules={[{ required: true }]}><Input maxLength={11} /></Form.Item>
          <Form.Item name="level" label="等级" rules={[{ required: true }]}>
            <Select options={(Object.keys(MEMBER_LEVEL_LABEL) as MemberLevel[]).map((k) => ({ value: k, label: MEMBER_LEVEL_LABEL[k] }))} />
          </Form.Item>
          <Form.Item name="registerStoreName" label="注册门店"><Input /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
