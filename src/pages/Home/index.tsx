import { Area, Column, Pie } from '@ant-design/charts';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const [data, setData] = useState({
    areaData: [
      { date: '2023-01-01', value: 100, type: '销售额' },
      { date: '2023-01-02', value: 120, type: '销售额' },
      { date: '2023-01-03', value: 150, type: '销售额' },
      { date: '2023-01-04', value: 130, type: '销售额' },
      { date: '2023-01-05', value: 180, type: '销售额' },
      { date: '2023-01-06', value: 200, type: '销售额' },
      { date: '2023-01-07', value: 250, type: '销售额' },
      { date: '2023-01-01', value: 50, type: '利润' },
      { date: '2023-01-02', value: 60, type: '利润' },
      { date: '2023-01-03', value: 70, type: '利润' },
      { date: '2023-01-04', value: 65, type: '利润' },
      { date: '2023-01-05', value: 80, type: '利润' },
      { date: '2023-01-06', value: 90, type: '利润' },
      { date: '2023-01-07', value: 110, type: '利润' },
    ],
    pieData: [
      { type: '分类一', value: 27 },
      { type: '分类二', value: 25 },
      { type: '分类三', value: 18 },
      { type: '分类四', value: 15 },
      { type: '分类五', value: 10 },
      { type: '其他', value: 5 },
    ],
    columnData: [
      { city: '北京', sales: 38 },
      { city: '上海', sales: 52 },
      { city: '广州', sales: 61 },
      { city: '深圳', sales: 145 },
      { city: '杭州', sales: 48 },
    ],
  });

  useEffect(() => {
    // asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('/api/dashboard')
      .then((response) => response.json())
      .then((json) =>
        setData({
          areaData: json.data,
          pieData: json.pieData,
          columnData: json.columnData,
        }),
      )
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };

  const areaConfig = {
    data: data.areaData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
  };

  const pieConfig = {
    appendPadding: 10,
    data: data.pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  const columnConfig = {
    data: data.columnData,
    xField: 'city',
    yField: 'sales',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic title="今日销售额" value={112893} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="今日订单数" value={1234} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="新增用户" value={93} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="总销售额" value={1128930} precision={2} />
            </Card>
          </Col>
        </Row>
        <Card style={{ marginTop: 16 }}>
          <Area {...areaConfig} />
        </Card>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="商品分类占比">
              <Pie {...pieConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="城市销售额">
              <Column {...columnConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default HomePage;
