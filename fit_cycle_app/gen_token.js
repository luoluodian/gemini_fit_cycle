const jwt = require('jsonwebtoken');

const secret = "vadvdserverfitcycle2024!@#";
const payload = { id: 1, openId: "mock_openid_123456" };

const token = jwt.sign(payload, secret, { expiresIn: '30d' });
console.log(token);
