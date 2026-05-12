import { Drawer, Descriptions, Tabs, Tag, Empty } from 'antd';
import type { Store } from '@/types/store';
import { STORE_STATUS_LABEL, STORE_STATUS_COLOR } from '@/types/store';

interface Props {
  open: boolean;
  store: Store | null;
  onClose: () => void;
}

export default function StoreDetailDrawer({ open, store, onClose }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={store ? `门店详情 - ${store.name}` : '门店详情'}
      destroyOnClose
    >
      {store && (
        <Tabs
          items={[
            {
              key: 'info',
              label: '基本信息',
              children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="编码">
                    {store.code}
                  </Descriptions.Item>
                  <Descriptions.Item label="名称">
                    {store.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="地址">
                    {store.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="电话">
                    {store.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="店长">
                    {store.ownerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="营业时间">{`${store.openTime ?? '-'} ~ ${store.closeTime ?? '-'}`}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={STORE_STATUS_COLOR[store.status]}>
                      {STORE_STATUS_LABEL[store.status]}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="备注">
                    {store.remark || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {store.createdAt || '-'}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: 'staff',
              label: '员工',
              children: <Empty description="待 Sprint 后续接入" />,
            },
            {
              key: 'products',
              label: '商品',
              children: <Empty description="待 Sprint 后续接入" />,
            },
          ]}
        />
      )}
    </Drawer>
  );
}
