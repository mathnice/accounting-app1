# 跨端记账应用

一款支持网页端和 Android 移动端的记账应用，双端功能完全一致，数据实时同步。

## 技术栈

- **后端**: Node.js + Express + MongoDB + TypeScript
- **网页端**: React + Ant Design + ECharts + TypeScript
- **Android端**: Kotlin + Jetpack Compose (待开发)

## 项目结构

```
accounting-app/
├── backend/          # Node.js 后端
├── web/              # React 网页端
└── android/          # Android 移动端 (待开发)
```

## 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 网页端
cd ../web
npm install
```

### 2. 配置环境变量

复制后端环境变量配置文件：
```bash
cd backend
cp .env.example .env
```

修改 `.env` 文件中的配置：
- `MONGO_URI`: MongoDB 连接地址
- `JWT_SECRET`: JWT 密钥（生产环境请修改）

### 3. 启动 MongoDB

确保本地 MongoDB 服务已启动，默认连接地址：`mongodb://localhost:27017/accounting`

### 4. 启动服务

```bash
# 启动后端 (端口 3000)
cd backend
npm run dev

# 启动网页端 (端口 5173)
cd ../web
npm run dev
```

### 5. 访问应用

- 网页端: http://localhost:5173
- API 文档: http://localhost:3000/api/health

## API 接口

### 用户模块 `/api/users`
- POST `/register` - 用户注册
- POST `/login` - 账号密码登录
- POST `/login/sms` - 验证码登录
- GET `/profile` - 获取个人信息
- PUT `/profile` - 更新个人信息

### 交易记录模块 `/api/transactions`
- GET `/` - 获取交易列表
- POST `/` - 创建交易
- PUT `/:id` - 更新交易
- DELETE `/:id` - 删除交易
- POST `/batch/delete` - 批量删除
- POST `/batch/export` - 批量导出

### 分类模块 `/api/categories`
- GET `/` - 获取分类列表
- POST `/` - 创建分类
- PUT `/:id` - 更新分类
- DELETE `/:id` - 删除分类

### 账户模块 `/api/accounts`
- GET `/` - 获取账户列表
- POST `/` - 创建账户
- PUT `/:id` - 更新账户
- DELETE `/:id` - 删除账户

### 统计模块 `/api/statistics`
- GET `/summary` - 收支汇总
- GET `/category` - 分类统计
- GET `/trend` - 趋势数据
- POST `/report` - 生成报表

### 同步模块 `/api/sync`
- POST `/push` - 推送本地变更
- GET `/pull` - 拉取服务端变更
- POST `/backup` - 创建备份
- POST `/restore` - 恢复备份

## 功能特性

- ? 用户注册/登录（手机号+验证码/密码）
- ? 收支记录管理（增删改查、批量操作）
- ? 分类管理（自定义分类、图标、颜色）
- ? 账户管理（多账户、余额自动计算）
- ? 数据统计（收支汇总、分类占比、趋势分析）
- ? 数据可视化（饼图、柱状图、折线图）
- ? 报表导出（CSV/JSON 格式）
- ? 数据同步（云端同步、冲突解决）
- ? 数据备份与恢复

## 开发说明

### 后端开发
```bash
cd backend
npm run dev      # 开发模式
npm run build    # 构建
npm run start    # 生产模式
npm run test     # 运行测试
```

### 网页端开发
```bash
cd web
npm run dev      # 开发模式
npm run build    # 构建
npm run preview  # 预览构建结果
```

## 注意事项

1. 金额单位为"分"，前端显示时需除以 100
2. 日期格式使用 ISO 8601 标准
3. 所有需要认证的接口需要在请求头添加 `Authorization: Bearer <token>`
