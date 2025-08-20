import { Area, Column, Pie } from '@ant-design/charts';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  const [data, setData] = useState({
    areaData: [],
    pieData: [],
    columnData: [],
  });

  useEffect(() => {
    asyncFetch();
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
