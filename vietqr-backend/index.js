const express = require('express');
const cors = require('cors');
const { generateVietQR } = require('./utils/vietqr');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Lưu trạng thái đơn hàng (demo, thực tế nên dùng DB)
const paidOrders = {};

app.get('/api/qr', (req, res) => {
  const { amount, orderId } = req.query;

  if (!amount) return res.status(400).json({ error: 'Missing amount' });

  const qr = generateVietQR(amount, orderId);
  res.json(qr);
});

// API giả lập: Đánh dấu đơn hàng đã thanh toán (bạn có thể gọi bằng Postman để test)
app.post('/api/mark-paid', (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Missing orderId' });
  paidOrders[orderId] = true;
  res.json({ success: true });
});

// API kiểm tra trạng thái thanh toán
app.get('/api/payment-status', (req, res) => {
  const { orderId } = req.query;
  res.json({ paid: !!paidOrders[orderId] });
});

app.listen(PORT, '0.0.0.0',() => {
  console.log(`✅ Backend running: http://localhost:${PORT}`);
});
