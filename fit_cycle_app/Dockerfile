# -------------------------------
# 第一阶段：构建阶段
# -------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# 强制替换 npm/yarn 源（彻底覆盖）
RUN npm config set registry https://registry.npmmirror.com && \
  yarn config set registry https://registry.npmmirror.com

# 拷贝依赖文件
COPY package.json yarn.lock ./

# 安装依赖（构建用）
RUN yarn install --frozen-lockfile

# 拷贝源代码并构建
COPY . .
RUN yarn build

# -------------------------------
# 第二阶段：生产阶段
# -------------------------------
FROM node:22-alpine AS production

WORKDIR /app

# 同样强制覆盖源
RUN npm config set registry https://registry.npmmirror.com && \
  yarn config set registry https://registry.npmmirror.com

# 拷贝依赖文件并安装生产依赖
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# 拷贝构建产物
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]