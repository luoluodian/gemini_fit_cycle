import WebSocket from 'ws';
import fs from 'fs';
import readline from 'readline';

/**
 * AuditWatcher V3 - 深度诊断型监听器
 * 1. 解决 Buffer 解析问题
 * 2. 增加针对 WebSocket 裸流量的监控
 * 3. 增强 Target 发现机制
 */

const PORT = 46910;
const WS_URL = `ws://127.0.0.1:${PORT}`;

console.log(`\n🚀 AuditWatcher V3 启动中...`);
console.log(`🔗 目标地址: ${WS_URL}`);

let ws;
let commandId = 1;
const pendingCommands = new Map();

function connect() {
  // 注意：微信开发者工具的自动化端口有时需要特定的 Path，
  // 但 Minium 模式下直接连接根路径通常能连上控制域。
  ws = new WebSocket(WS_URL);

  ws.on('open', async () => {
    console.log("✅ WebSocket 连接已建立");
    
    // 立即发送一个测试指令，验证响应能力
    console.log("📡 正在验证 IDE 响应能力...");
    try {
      const version = await sendCommand('Browser.getVersion');
      console.log("🟢 IDE 响应正常:", version?.product || 'Connected');
      
      // 开启各项监控
      await sendCommand('Runtime.enable');
      await sendCommand('Log.enable');
      await sendCommand('Network.enable');
      await sendCommand('Page.enable'); // 开启页面域以监听路径变更
      
      console.log("📡 核心监控项已开启: [Runtime, Log, Network, Page]");
      console.log("💡 提示: 请在模拟器中操作。如果终端没反应，请尝试在此处按 '回车' 强制抓取当前 UI。");
      console.log("------------------------------------------------------------------");
    } catch (e) {
      console.error("⚠️ 握手成功但指令发送失败。可能需要开启 '自动化测试' 模式或检查端口。");
    }
  });

  ws.on('message', (rawData) => {
    // 兼容多种数据格式
    const data = rawData.toString();
    // console.log("📥 [Raw Trace]:", data); // 调试用：如果完全没日志，取消此行注释

    try {
      const msg = JSON.parse(data);
      
      // 1. 响应处理
      if (msg.id && pendingCommands.has(msg.id)) {
        const { resolve } = pendingCommands.get(msg.id);
        pendingCommands.delete(msg.id);
        resolve(msg.result);
        return;
      }

      // 2. 控制台日志捕获
      if (msg.method === 'Runtime.consoleAPICalled') {
        const { type, args } = msg.params;
        const text = args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        const emoji = type === 'error' ? '🛑' : (type === 'warning' ? '⚠️' : 'ℹ️');
        console.log(`${emoji} [Console.${type}] ${text}`);
        
        if (type === 'error') takeSnapshot(`自动捕获控制台报错: ${text}`);
      }

      // 3. 错误日志捕获 (Log 域)
      if (msg.method === 'Log.entryAdded') {
        const { level, text, url } = msg.params.entry;
        if (level === 'error') {
          console.log(`🛑 [System Error] ${text} (${url || 'unknown'})`);
          takeSnapshot(`自动捕获系统错误: ${text}`);
        }
      }

      // 4. 网络异常捕获
      if (msg.method === 'Network.responseReceived') {
        const { response } = msg.params;
        if (response.status >= 400) {
          console.log(`🛑 [Network Fail] ${response.status} - ${response.url}`);
          takeSnapshot(`自动捕获网络错误: ${response.status}`);
        }
      }

      // 5. 路径变更通知
      if (msg.method === 'Page.frameNavigated') {
        console.log(`📍 页面跳转至: ${msg.params.frame.url}`);
      }

    } catch (e) {
      // 记录无法解析的特殊报文
      if (data.length > 5) console.log("❓ [Unparsed Message]:", data);
    }
  });

  ws.on('error', (err) => {
    console.error(`❌ WebSocket 报错: ${err.message}`);
    console.log("💡 建议：检查微信开发者工具 -> 设置 -> 安全设置 -> 服务端口 是否为开启状态。");
  });

  ws.on('close', () => {
    console.log("📴 WebSocket 连接已断开。");
    process.exit(0);
  });
}

function sendCommand(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = commandId++;
    const payload = JSON.stringify({ id, method, params });
    ws.send(payload, (err) => {
      if (err) reject(err);
    });
    // 设置 5 秒超时，防止挂死
    const timeout = setTimeout(() => {
      if (pendingCommands.has(id)) {
        pendingCommands.delete(id);
        reject(new Error(`Command ${method} timed out`));
      }
    }, 5000);
    pendingCommands.set(id, { resolve: (res) => { clearTimeout(timeout); resolve(res); }, reject });
  });
}

async function takeSnapshot(reason = "Manual Trigger") {
  console.log("\n📸 正在抓取“犯罪现场”深度快照...");
  try {
    // 同时获取 WXML, Route, Data, 和 全局状态
    const [wxmlRes, pathRes, dataRes, piniaRes] = await Promise.allSettled([
      sendCommand('Runtime.evaluate', { expression: 'document.body.innerHTML', returnByValue: true }),
      sendCommand('Runtime.evaluate', { expression: 'getCurrentPages().pop().route', returnByValue: true }),
      sendCommand('Runtime.evaluate', { expression: 'JSON.stringify(getCurrentPages().pop().data)', returnByValue: true }),
      sendCommand('Runtime.evaluate', { expression: 'JSON.stringify(window.__pinia_state__ || "No Pinia")', returnByValue: true })
    ]);

    const getValue = (res) => res.status === 'fulfilled' ? (res.value?.result?.value || "N/A") : "Request Failed";

    const wxml = getValue(wxmlRes);
    const pagePath = getValue(pathRes);
    const pageData = getValue(dataRes);
    const piniaState = getValue(piniaRes);

    const auditFile = '.audit_snapshot.txt';
    const content = `【手动测试全域快照】
时间：${new Date().toLocaleString()}
原因：${reason}
路径：${pagePath}

--- 页面 Data (原生状态) ---
${pageData}

--- Pinia Store (全局状态) ---
${piniaState}

--- 页面 WXML (UI 结构) ---
${wxml.substring(0, 10000)}

--- 审计引导 ---
请分析为何该状态下 UI 表现不符合预期。重点检查：
1. Data 字段是否与 WXML 中的 wx:if / v-if 逻辑匹配？
2. 接口是否成功将数据写入 Store 但未同步到 Page Data？
3. 给出修复方案。`;

    fs.writeFileSync(auditFile, content);
    console.log(`✨ 现场已保存：${auditFile}`);
    console.log(`🤖 请执行：gemini "请审计 .audit_snapshot.txt 中的现场并给出修复建议"\n`);
    
  } catch (err) {
    console.error("❌ 快照抓取严重失败:", err.message);
  }
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on('line', () => takeSnapshot("用户点击回车强制采样"));

connect();
setInterval(() => {}, 1000); // 保持事件循环活跃
