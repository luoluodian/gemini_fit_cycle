const jwt = require('jsonwebtoken');

// 使用项目已有的 JWT 密钥 (从 fit_cycle_app/src/modules/auth/auth.module.ts 或 env 获取)
// 鉴于测试环境，我们使用通用的开发密钥
const SECRET = 'fit-cycle-secret-2026'; 

const payload = {
  uid: 1,
  username: 'test_admin',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24小时有效
};

const token = jwt.sign(payload, SECRET);
console.log(token);
