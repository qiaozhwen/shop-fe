const dataSource = [];

export default {
  'GET /api/historical-amount': (req, res) => {
    res.json(dataSource);
  },
  'POST /api/historical-amount': (req, res) => {
    dataSource.push({ ...req.body, id: Date.now().toString() });
    res.json({ success: true });
  },
  'DELETE /api/historical-amount/:id': (req, res) => {
    const index = dataSource.findIndex((item) => item.id === req.params.id);
    dataSource.splice(index, 1);
    res.json({ success: true });
  },
};
