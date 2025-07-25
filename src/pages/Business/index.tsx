import { addItem, deleteItem, queryList } from '@/services/business';
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
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';

const { RangePicker } = DatePicker;

const BusinessPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchData = async () => {
    const data = await queryList();
    let filteredData = data;
    if (dateRange) {
      filteredData = data.filter((item: any) => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange[0] && itemDate <= dateRange[1];
      });
    }
    setDataSource(filteredData);
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleAdd = async (values: { date: any; amounts: number }) => {
    await addItem({
      date: values.date?.format('YYYY-MM-DD'),
      amounts: [values.amounts],
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    // await deleteItem(id);
    // fetchData();

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
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

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      valueType: 'date', // 指定为日期类型
      search: {
        transform: (value) => ({ createDate: value.format('YYYY-MM-DD') }),
      },
      // 启用排序功能
      sorter: true, // 简单启用
      // 或使用自定义排序逻辑
      sorter: (a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amounts',
      render: (text, record) => {
        console.log(text, '111111');
        return (
          <Flex vertical>
            {record?.amounts?.map((cur) => (
              <Typography>{cur}元</Typography>
            ))}
          </Flex>
        );
      },
    },
    {
      title: '操作',
      search: false,
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          删除
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
        total +
        Number(item.amounts?.reduce((total, cur) => total + Number(cur), 0)),
      0,
    );

  console.log(
    '22222',
    dataSource,
    dataSource.filter((item) => selectedRowKeys.includes(item.id)),
  );
  return (
    <div className="business-page">
      <Card title="添加新数据">
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
              name="amounts"
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
