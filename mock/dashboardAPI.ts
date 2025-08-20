import { defineMock } from '@umijs/max';

export default defineMock({
  'GET /api/dashboard': (req, res) => {
    const data = [
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
    ];

    const pieData = [
      { type: '分类一', value: 27 },
      { type: '分类二', value: 25 },
      { type: '分类三', value: 18 },
      { type: '分类四', value: 15 },
      { type: '分类五', value: 10 },
      { type: '其他', value: 5 },
    ];

    const columnData = [
      { city: '北京', sales: 38 },
      { city: '上海', sales: 52 },
      { city: '广州', sales: 61 },
      { city: '深圳', sales: 145 },
      { city: '杭州', sales: 48 },
    ];

    res.status(200).json({ data, pieData, columnData });
  },
});