import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Proxy /api to backend
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'fit_cycle_web/dist')));

// Handle SPA routing - fix for Express 5/path-to-regexp
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, 'fit_cycle_web/dist/index.html'));
});

const server = app.listen(10086, '127.0.0.1', () => {
  console.log('Proxy server running on http://127.0.0.1:10086');
});