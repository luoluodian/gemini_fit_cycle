import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

export const setupDOM = (filePath) => {
  const html = fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
  // 开启 dangerously 模式以执行页面内嵌脚本 [5]
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
  });
  return { dom, window: dom.window, document: dom.window.document };
};
