# ATRI WebUI

Emotion Robot 的前端应用。当前前端基于 Vue 3 + TypeScript + Vite，提供角色管理、聊天会话、WebSocket 流式对话、Live2D 展示、ASR/TTS 设置和 Phase 11 登录流程。

## 功能

- 角色选择、创建、编辑、删除和头像上传
- 聊天会话列表、标题更新、历史消息加载和多轮对话
- WebSocket 流式回复，认证开启时自动携带 JWT token
- Live2D 模型展示和表情触发
- ASR / TTS 设置页，对接后端提供商接口
- GitHub OAuth 登录页、回调页和账号设置页
- 认证关闭时自动使用本地 `default` 用户模式

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- UnoCSS
- Axios
- PixiJS / pixi-live2d-display

## 环境要求

- Node.js `>= 18`
- npm `>= 9`
- 后端服务 `atri`，默认地址 `http://localhost:8430`

## 快速开始

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

访问：

```text
http://localhost:5200
```

Vite 已固定开发端口为 `5200`。开发服务器会代理：

| 前端路径 | 代理到 |
|---|---|
| `/api/*` | `http://localhost:8430/api/*` |
| `/ws` | `ws://localhost:8430/ws` |

## 环境变量

开发环境默认可以使用 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8430
VITE_WS_URL=ws://localhost:8430/ws
```

生产环境示例：

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WS_URL=wss://your-api-domain.com/ws
```

## 认证联调

前端会先调用 `GET /api/auth/status` 判断后端是否启用认证。

后端 `config/auth.yaml` 中 `enabled: false` 时，前端直接进入主页面，当前用户为 `default`。

后端 `config/auth.yaml` 中 `enabled: true` 时，前端会保护主应用路由。未登录用户访问 `/` 或功能页面时，会跳转到 `/login`，登录成功后进入 `/auth/callback` 并保存 JWT。

本地 GitHub OAuth App 推荐配置：

| 字段 | 值 |
|---|---|
| Homepage URL | `http://localhost:5200` |
| Authorization callback URL | `http://localhost:8430/api/auth/callback` |

后端认证配置需要与前端端口一致：

```yaml
frontend:
  callback_url: http://localhost:5200/auth/callback
  login_url: http://localhost:5200/login
```

前端本地保存的认证键：

| Key | 说明 |
|---|---|
| `atri_auth_token` | JWT token |
| `atri_auth_signed_in_at` | 登录时间 |
| `atri_auth_redirect` | 登录后回跳地址 |

如果切换 `JWT_SECRET_KEY` 或修改认证配置后登录异常，可以清理这些 LocalStorage 键后重新登录。

## 常用命令

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview

# 类型检查
npm run type-check

# ESLint 检查并自动修复
npm run lint
```

## 后端依赖

前端需要后端服务运行：

```bash
cd ../atri
uv run python -m src.main
```

后端默认地址：

| 服务 | 地址 |
|---|---|
| HTTP API | `http://localhost:8430` |
| WebSocket | `ws://localhost:8430/ws` |
| Swagger UI | `http://localhost:8430/docs` |

## 项目结构

```text
atri-webui/
├── docs/                 # 前端文档
├── public/               # 公共资源
├── src/
│   ├── api/              # Axios 客户端和 API 模块
│   ├── assets/           # 全局样式和静态资源
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── pages/            # 页面组件
│   ├── router/           # 路由和认证守卫
│   ├── stores/           # Pinia 状态
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   ├── App.vue
│   └── main.ts
├── .env.development
├── package.json
├── vite.config.ts
└── uno.config.ts
```

## 相关文档

- 开发指南：`docs/DEVELOPMENT.md`
- 用户配置：`docs/USER_CONFIG.md`
