# -------------------------------
# 第一阶段：构建阶段
# -------------------------------
FROM node:22-alpine AS builder

# 安装构建原生模块（如 sqlite3）所需的工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 强制替换 npm/yarn 源
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

# 生产环境安装 sqlite3 同样需要编译工具
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 强制覆盖源
RUN npm config set registry https://registry.npmmirror.com && \
    yarn config set registry https://registry.npmmirror.com

# 拷贝依赖文件并安装生产依赖
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && \
    apk del python3 make g++

# 从构建阶段拷贝产物
COPY --from=builder /app/dist ./dist

# 设置默认环境变量
ENV NODE_ENV=production
ENV PORT=3000

# ⚠️ 注意：JWT_SECRET 等敏感配置不再硬编码在镜像中。
# 必须在运行时通过 docker run --env 或 --env-file 传入。

EXPOSE 3000

CMD ["node", "dist/main.js"]
