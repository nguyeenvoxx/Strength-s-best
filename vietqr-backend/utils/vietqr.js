require('dotenv').config();

function generateVietQR(amount, orderId = null) {
  const bankId = process.env.BANK_ID;
  const accountNo = process.env.ACCOUNT_NO;
  const accountName = process.env.ACCOUNT_NAME;

  const timestamp = Date.now();
  const info = orderId ? `TT-${orderId}-${timestamp}` : `TT-${timestamp}`;

  const encodedInfo = encodeURIComponent(info);
  const encodedName = encodeURIComponent(accountName);

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.jpg?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`;


  return {
    qrUrl,
    accountName,
    accountNo,
    bankId,
    amount,
    content: info,
    expiresAt: timestamp + 5 * 60 * 1000,
  };
}

module.exports = { generateVietQR };