const dataSource = [];

export default {
  'GET /api/historicalAmount': (req, res) => {
    res.json(dataSource);
  },
  'POST /api/historicalAmount': (req, res) => {
    dataSource.push({ ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  },
  'DELETE /api/historicalAmount/:id': (req, res) => {
    const index = dataSource.findIndex((item) => item.id === req.params.id);
    dataSource.splice(index, 1);
    res.json({ success: true });
  },
};
