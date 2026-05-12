import { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  TimePicker,
  App as AntdApp,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useStores,
  useCreateStore,
  useUpdateStore,
  useDeleteStore,
} from '@/hooks/useStores';
import type { Store, StoreStatus } from '@/types/store';
import { STORE_STATUS_LABEL, STORE_STATUS_COLOR } from '@/types/store';
import { phoneRule } from '@/utils/validators';
import StoreDetailDrawer from './StoreDetailDrawer';

export default function StoreListPage() {
  const { message, modal } = AntdApp.useApp();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<StoreStatus | undefined>();
  const { data, isLoading } = useStores({ page, pageSize, keyword, status });
  const create = useCreateStore();
  const update = useUpdateStore();
  const remove = useDeleteStore();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Store | null>(null);
  const [form] = Form.useForm();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailStore, setDetailStore] = useState<Store | null>(null);

  const openDetail = (row: Store) => {
    setDetailStore(row);
    setDetailOpen(true);
  };

  const openModal = (row?: Store) => {
    setEditing(row ?? null);
    form.resetFields();
    if (row) {
      form.setFieldsValue({
        ...row,
        openTime: row.openTime ? dayjs(row.openTime, 'HH:mm') : undefined,
        closeTime: row.closeTime ? dayjs(row.closeTime, 'HH:mm') : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'OPEN' });
    }
    setOpen(true);
  };

  const submit = async () => {
    const v = await form.validateFields();
    const payload = {
      ...v,
      openTime: v.openTime ? v.openTime.format('HH:mm') : undefined,
      closeTime: v.closeTime ? v.closeTime.format('HH:mm') : undefined,
    };
    if (editing) await update.mutateAsync({ id: editing.id, ...payload });
    else await create.mutateAsync(payload);
    message.success('已保存');
    setOpen(false);
  };

  return (
    <Card
      title="门店管理"
      extra={
        <Space>
          <Input
            allowClear
            placeholder="名称/编码/地址"
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={(Object.keys(STORE_STATUS_LABEL) as StoreStatus[]).map(
              (k) => ({ value: k, label: STORE_STATUS_LABEL[k] }),
            )}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            新增门店
          </Button>
        </Space>
      }
    >
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
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        columns={[
          { title: '编码', dataIndex: 'code', width: 90 },
          { title: '门店名称', dataIndex: 'name' },
          { title: '地址', dataIndex: 'address' },
          { title: '电话', dataIndex: 'phone', width: 130 },
          { title: '店长', dataIndex: 'ownerName', width: 100 },
          {
            title: '营业时间',
            width: 130,
            render: (_, r) => `${r.openTime ?? '-'} ~ ${r.closeTime ?? '-'}`,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (s: StoreStatus) => (
              <Tag color={STORE_STATUS_COLOR[s]}>{STORE_STATUS_LABEL[s]}</Tag>
            ),
          },
          {
            title: '操作',
            width: 200,
            fixed: 'right',
            render: (_, r) => (
              <Space size={4}>
                <Button
                  size="small"
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => openDetail(r)}
                >
                  详情
                </Button>
                <Button
                  size="small"
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openModal(r)}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    modal.confirm({
                      title: '确认删除？',
                      onOk: () =>
                        remove
                          .mutateAsync(r.id)
                          .then(() => message.success('已删除')),
                    })
                  }
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={submit}
        title={editing ? '编辑门店' : '新增门店'}
        confirmLoading={create.isPending || update.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="name" label="门店名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true }, phoneRule]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="ownerName" label="店长" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={(Object.keys(STORE_STATUS_LABEL) as StoreStatus[]).map(
                (k) => ({ value: k, label: STORE_STATUS_LABEL[k] }),
              )}
            />
          </Form.Item>
          <Form.Item name="openTime" label="开门时间">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="closeTime" label="关门时间">
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <StoreDetailDrawer
        open={detailOpen}
        store={detailStore}
        onClose={() => setDetailOpen(false)}
      />
    </Card>
  );
}
