import { Card, Col, Row, Tag, Button, Space, Empty, Select, App as AntdApp, Modal } from 'antd';
import { ArrowRightOutlined, UserOutlined } from '@ant-design/icons';
import { useProcessingTasks, useProcessingMutations } from '@/hooks/useProcessing';
import { useAllStaff } from '@/hooks/usePeople';
import {
  PROCESSING_FLOW, PROCESSING_STATUS_LABEL,
} from '@/types/processing';
import type { ProcessingTask, ProcessingStatus } from '@/types/processing';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';
import { useState } from 'react';

const COLUMN_COLORS: Record<ProcessingStatus, string> = {
  WAIT_SLAUGHTER: '#fff7e6',
  SLAUGHTERING: '#fff1f0',
  PLUCKING: '#fff0f6',
  EVISCERATING: '#f9f0ff',
  PACKING: '#e6f4ff',
  DELIVERED: '#f6ffed',
  CANCELED: '#fafafa',
};

export default function ProcessingBoardPage() {
  const { message } = AntdApp.useApp();
  const { data, isLoading } = useProcessingTasks({ pageSize: 200 });
  const { advance, assign } = useProcessingMutations();
  const { data: workers } = useAllStaff();
  const [assignTarget, setAssignTarget] = useState<ProcessingTask | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<number | undefined>();

  const grouped: Record<ProcessingStatus, ProcessingTask[]> = {
    WAIT_SLAUGHTER: [], SLAUGHTERING: [], PLUCKING: [],
    EVISCERATING: [], PACKING: [], DELIVERED: [], CANCELED: [],
  };
  (data?.list ?? []).forEach((t) => grouped[t.status]?.push(t));

  return (
    <Card title="加工工单看板" loading={isLoading}>
      <Row gutter={12}>
        {PROCESSING_FLOW.map((s) => (
          <Col xs={24} sm={12} md={8} lg={4} key={s} style={{ marginBottom: 12 }}>
            <Card
              size="small"
              title={
                <span>
                  {PROCESSING_STATUS_LABEL[s]}
                  <Tag style={{ marginLeft: 8 }} color="default">{grouped[s].length}</Tag>
                </span>
              }
              styles={{ body: { background: COLUMN_COLORS[s], minHeight: 480 } }}
            >
              {grouped[s].length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} /> : (
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  {grouped[s].map((t) => (
                    <Card key={t.id} size="small" style={{ borderLeft: t.priority === 'URGENT' ? '4px solid #f5222d' : undefined }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{t.categoryName}</strong>
                        {t.priority === 'URGENT' && <Tag color="red">急</Tag>}
                      </div>
                      <div style={{ color: '#999', fontSize: 12 }}>{t.taskNo}</div>
                      <div style={{ fontSize: 12 }}>订单：{t.orderNo}</div>
                      <div style={{ fontSize: 12 }}>{t.quantity} 只 / {t.weight} 斤</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        {t.methods.map((m) => <Tag key={m}>{PROCESS_METHOD_LABEL[m]}</Tag>)}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        <UserOutlined /> {t.workerName ?? <span style={{ color: '#faad14' }}>未指派</span>}
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                        <Button size="small" onClick={() => { setAssignTarget(t); setSelectedWorker(t.workerId); }}>指派</Button>
                        {s !== 'DELIVERED' && (
                          <Button size="small" type="primary" icon={<ArrowRightOutlined />}
                            onClick={() => advance.mutate(t.id, { onSuccess: () => message.success('已推进') })}>
                            下一步
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={!!assignTarget}
        title={`指派屠宰工 - ${assignTarget?.taskNo ?? ''}`}
        onCancel={() => setAssignTarget(null)}
        onOk={() => {
          const w = workers?.find((x) => x.id === selectedWorker);
          if (!assignTarget || !w) return;
          assign.mutate({ id: assignTarget.id, workerId: w.id, workerName: w.name }, {
            onSuccess: () => { message.success('已指派'); setAssignTarget(null); },
          });
        }}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="选择屠宰工 / 帮工"
          value={selectedWorker}
          onChange={setSelectedWorker}
          options={(workers ?? [])
            .filter((w) => w.role === 'BUTCHER' || w.role === 'HELPER')
            .map((w) => ({ value: w.id, label: `${w.name}（${w.storeName}）` }))}
        />
      </Modal>
    </Card>
  );
}
