import { Card, Descriptions, Spin, Table, Tag, Button, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesOrder } from '@/hooks/useSalesOrders';
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAY_METHOD_LABEL } from '@/types/order';
import { PROCESS_METHOD_LABEL } from '@/types/poultry';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useSalesOrder(id ? +id : undefined);

  if (isLoading || !data) return <Spin />;

  return (
    <Card
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} type="link" onClick={() => navigate(-1)}>返回</Button>
          订单详情：{data.orderNo}
        </Space>
      }
      extra={<Button icon={<PrinterOutlined />} onClick={() => window.print()}>打印小票</Button>}
    >
      <Descriptions column={3} bordered size="small">
        <Descriptions.Item label="订单号">{data.orderNo}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={ORDER_STATUS_COLOR[data.status]}>{ORDER_STATUS_LABEL[data.status]}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="门店">{data.storeName}</Descriptions.Item>
        <Descriptions.Item label="收银员">{data.cashierName ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="客户手机">{data.customerPhone ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="支付方式">{data.payMethod ? PAY_METHOD_LABEL[data.payMethod] : '-'}</Descriptions.Item>
        <Descriptions.Item label="下单时间">{data.createdAt}</Descriptions.Item>
        <Descriptions.Item label="付款时间">{data.paidAt ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="完成时间">{data.completedAt ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{data.remark ?? '-'}</Descriptions.Item>
      </Descriptions>

      <Table
        style={{ marginTop: 16 }}
        rowKey={(r, i) => String(r.id ?? i)}
        dataSource={data.items}
        pagination={false}
        columns={[
          { title: '品类', dataIndex: 'categoryName' },
          { title: '只数', dataIndex: 'quantity', width: 80 },
          { title: '净重(斤)', dataIndex: 'weight', width: 100 },
          { title: '单价', dataIndex: 'unitPrice', width: 100, render: (v) => `¥${v.toFixed(2)}` },
          { title: '加工方式', dataIndex: 'processMethod', width: 120, render: (v) => PROCESS_METHOD_LABEL[v as keyof typeof PROCESS_METHOD_LABEL] },
          { title: '加工费', dataIndex: 'processFee', width: 90, render: (v) => `¥${v.toFixed(2)}` },
          { title: '小计', dataIndex: 'subtotal', width: 110, render: (v) => <span style={{ color: '#d4380d' }}>¥{v.toFixed(2)}</span> },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={6} align="right"><strong>合计 / 优惠 / 应收：</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={2}>
              ¥{data.totalAmount.toFixed(2)} / ¥{data.discount.toFixed(2)} /{' '}
              <span style={{ color: '#d4380d', fontSize: 16 }}>¥{data.payable.toFixed(2)}</span>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
}
