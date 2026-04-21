# ATRI WebUI - Frontend MVP

基于 Vue 3 + TypeScript 的 ATRI 情感机器人前端界面。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **样式**: UnoCSS
- **HTTP 客户端**: Axios
- **实时通信**: WebSocket

## 功能特性

- ✅ 角色选择和管理
- ✅ 多会话聊天历史
- ✅ 实时对话（WebSocket）
- ✅ 自定义背景（图片/视频/纯色）
- ✅ 响应式布局
- ✅ TypeScript 类型安全

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173/

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 环境变量

创建 `.env.development` 文件：

```env
VITE_API_BASE_URL=http://localhost:8430
VITE_WS_URL=ws://localhost:8430/ws
```

创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com/ws
```

## 后端依赖

前端需要后端 API 服务运行才能正常工作。

**注意**: 当前后端存在 asyncio 事件循环冲突问题，需要修复后才能启动。错误信息：
```
RuntimeError: Cannot run the event loop while another loop is running
```

修复方法：修改 `atri/src/main.py` 中的 uvicorn 启动方式，使用 `uvicorn.Config` + `uvicorn.Server` 在现有事件循环中运行。

## 项目结构

```
atri-webui/
├── src/
│   ├── api/              # API 客户端
│   │   ├── client.ts     # Axios 实例
│   │   ├── types.ts      # API 类型定义
│   │   ├── characters.ts # 角色 API
│   │   └── chats.ts      # 聊天 API
│   ├── assets/           # 静态资源
│   │   └── styles/       # 全局样式
│   ├── components/       # Vue 组件
│   │   ├── background/   # 背景组件
│   │   ├── chat/         # 聊天组件
│   │   ├── sidebar/      # 侧边栏组件
│   │   └── ui/           # UI 基础组件
│   ├── composables/      # 组合式函数
│   │   ├── useChat.ts    # 聊天逻辑
│   │   ├── useSettings.ts # 设置管理
│   │   └── useWebSocket.ts # WebSocket 管理
│   ├── pages/            # 页面组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   │   ├── chat.ts       # 当前聊天状态
│   │   ├── characters.ts # 角色列表
│   │   ├── chats.ts      # 聊天历史
│   │   ├── settings.ts   # 用户设置
│   │   └── websocket.ts  # WebSocket 状态
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   │   ├── storage.ts    # LocalStorage 封装
│   │   └── websocket.ts  # WebSocket 管理器
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── public/               # 公共资源
├── docs/                 # 文档
├── .env.development      # 开发环境变量
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── uno.config.ts         # UnoCSS 配置
```

## 开发指南

详见 [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

## License

MIT
