const jwt = require('jsonwebtoken');
const secret = "vadvdserverfitcycle2024!@#";
const payload = { uid: 2 }; // 使用 uid 字段
const token = jwt.sign(payload, secret, { expiresIn: '30d' });
console.log(token);
