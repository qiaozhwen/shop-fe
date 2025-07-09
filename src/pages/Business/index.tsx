import { addItem, deleteItem, queryList } from '@/services/business';
import { Button, Card, DatePicker, Form, InputNumber, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';

const BusinessPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [form] = Form.useForm();
  // 初始化加载数据
  useEffect(() => {
    queryList().then((data) => setDataSource(data));
  }, []);

  // 修改handleAdd方法
  const handleAdd = async (values: { date: string; amount: number }) => {
    await addItem({
      date: values.date?.format('YYYY-MM-DD'),
      amount: values.amount,
    });
    const newData = await queryList();
    setDataSource(newData);
  };

  // 添加删除操作
  const handleDelete = async (id: string) => {
    await deleteItem(id);
    setDataSource(dataSource.filter((item) => item.id !== id));
  };

  // 在columns中添加操作列
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: DataType, b: DataType) => a.amount - b.amount,
    },
    {
      title: '操作',
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div className="business-page">
      <Card title="添加新数据">
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
      </Card>
      <Card title="数据列表" style={{ marginTop: 16 }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          bordered
          summary={(pageData) => {
            let totalAmount = 0;
            pageData.forEach(({ amount }) => {
              totalAmount += Number(amount);
            });

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>总计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{totalAmount?.toFixed(2)} 元</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default BusinessPage;
