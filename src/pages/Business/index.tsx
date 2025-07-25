import {
  addItem,
  deleteItem,
  queryList,
  updateItem,
} from '@/services/business';
import { ProTable } from '@ant-design/pro-components';
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  InputNumber,
  message,
  Modal,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';

const { RangePicker } = DatePicker;

interface DailyData {
  id: string;
  date: string;
  amounts: number[];
}

const BusinessPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<DailyData[]>([]);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);
  const [editingAmounts, setEditingAmounts] = useState<{
    [key: string]: number | null;
  }>({});

  const fetchData = async () => {
    const data = await queryList();
    let filteredData = data;
    if (dateRange) {
      filteredData = data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange[0] && itemDate <= dateRange[1];
      });
    }
    // 修复：正确处理新旧数据结构，避免覆盖前端状态
    setDataSource(
      filteredData.map((d) => ({
        ...d,
        amounts: Array.isArray(d.amounts)
          ? d.amounts
          : [d.amount].filter(Boolean),
      })),
    );
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleAdd = async (values: { date: any; amount: number }) => {
    await addItem({
      date: values.date?.format('YYYY-MM-DD'),
      amounts: [values.amount],
    });
    fetchData();
    form.resetFields(['amount']);
  };

  const handleDeleteDate = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这一天的所有记录吗？',
      onOk: async () => {
        try {
          await deleteItem(id);
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleAmountChange = async (
    record: DailyData,
    newAmounts: number[],
  ) => {
    try {
      if (record.id) {
        await updateItem(record.id, { amounts: newAmounts });
      } else {
        // 新增记录仍然使用原有接口
        await addItem({
          date: record.date,
          amounts: newAmounts,
        });
      }
      fetchData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleAddAmount = (record: DailyData) => {
    const newAmount = editingAmounts[record.id];
    if (newAmount !== null && newAmount !== undefined && newAmount > 0) {
      const newAmounts = [...(record.amounts || []), newAmount];
      handleAmountChange(record, newAmounts);
      setEditingAmounts({ ...editingAmounts, [record.id]: null });
    }
  };

  const handleDeleteAmount = (record: DailyData, amountIndex: number) => {
    const newAmounts = [...record.amounts];
    newAmounts.splice(amountIndex, 1);
    handleAmountChange(record, newAmounts);
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      valueType: 'date',
      sorter: (a: DailyData, b: DailyData) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: '金额明细',
      key: 'amounts',
      render: (_, record: DailyData) => (
        <Flex vertical gap="small">
          <div>
            {record.amounts?.map((amount, index) => (
              <Tag
                closable
                key={index}
                onClose={() => handleDeleteAmount(record, index)}
              >
                {amount} 元
              </Tag>
            ))}
          </div>
          <Flex gap="small">
            <InputNumber
              size="small"
              style={{ width: 100 }}
              placeholder="输入金额"
              min={0}
              value={editingAmounts[record.id]}
              onChange={(value) =>
                setEditingAmounts({ ...editingAmounts, [record.id]: value })
              }
            />
            <Button
              size="small"
              type="primary"
              onClick={() => handleAddAmount(record)}
            >
              添加
            </Button>
          </Flex>
        </Flex>
      ),
    },
    {
      title: '当日总计',
      key: 'total',
      render: (_, record: DailyData) => {
        const total =
          record.amounts?.reduce((sum, amount) => sum + amount, 0) || 0;
        return <Typography>{total.toFixed(2)} 元</Typography>;
      },
      sorter: (a: DailyData, b: DailyData) => {
        const totalA = a.amounts?.reduce((sum, amount) => sum + amount, 0) || 0;
        const totalB = b.amounts?.reduce((sum, amount) => sum + amount, 0) || 0;
        return totalA - totalB;
      },
    },
    {
      title: '操作',
      search: false,
      render: (_, record: DailyData) => (
        <Button danger onClick={() => handleDeleteDate(record.id)}>
          删除当天
        </Button>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    alwaysShowAlert: false,
  };

  const selectedTotalAmount = dataSource
    .filter((item) => selectedRowKeys.includes(item.id))
    .reduce(
      (total, item) =>
        total + (item.amounts?.reduce((sum, amount) => sum + amount, 0) || 0),
      0,
    );

  return (
    <div className="business-page">
      <Card title="添加新日期和金额">
        <Flex align="center" gap={15}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleAdd}
            className="add-form"
          >
            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '请选择日期!' }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="金额"
              rules={[{ required: true, message: '请输入金额!' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} addonAfter="元" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Form.Item>
          </Form>
          <Flex align="center" gap={15}>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.startOf('day'),
                    dates[1]?.endOf('day'),
                  ]);
                } else {
                  setDateRange(null);
                }
              }}
              style={{ marginBottom: 16 }}
            />
            <div style={{ position: 'relative', bottom: 5 }}>
              <strong>选中总计：{selectedTotalAmount?.toFixed(2)} 元</strong>
            </div>
          </Flex>
        </Flex>
      </Card>
      <Card title="数据列表" style={{ marginTop: 16 }}>
        <ProTable
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={columns}
          bordered
          rowKey={'id'}
          pagination={false}
          scroll={{ y: '60vh' }}
          search={false}
          toolBarRender={false}
        />
      </Card>
    </div>
  );
};

export default BusinessPage;
