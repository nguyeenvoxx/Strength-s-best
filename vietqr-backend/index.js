const express = require('express');
const cors = require('cors');
const { generateVietQR } = require('./utils/vietqr');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/qr', (req, res) => {
  const { amount, orderId } = req.query;

  if (!amount) return res.status(400).json({ error: 'Missing amount' });

  const qr = generateVietQR(amount, orderId);
  res.json(qr);
});

app.listen(PORT, '0.0.0.0',() => {
  console.log(`✅ Backend running: http://localhost:${PORT}`);
});
