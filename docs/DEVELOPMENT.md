# ATRI WebUI 开发指南

## 开发环境设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.development` 并根据需要修改：

```env
VITE_API_BASE_URL=http://localhost:8430
VITE_WS_URL=ws://localhost:8430/ws
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 代码规范

### TypeScript

- 使用严格模式 (`strict: true`)
- 避免使用 `any` 类型
- 为所有函数参数和返回值添加类型注解
- 使用 `interface` 定义对象类型

### Vue 组件

- 使用 Composition API (`<script setup lang="ts">`)
- Props 使用 `defineProps<T>()` 或 `withDefaults()`
- Emits 使用 `defineEmits<T>()`
- 组件命名使用 PascalCase

### 样式

- 优先使用 UnoCSS 原子类
- 避免深层嵌套的 CSS
- 使用 CSS 变量管理主题色

### 代码组织

- 一个文件一个组件
- 相关组件放在同一目录
- 工具函数放在 `utils/`
- 可复用逻辑提取为 composables

## 架构说明

### 状态管理 (Pinia Stores)

#### `chat` Store
管理当前活动聊天会话的状态。

```typescript
interface ChatState {
  currentChatId: string | null
  currentCharacterId: string | null
  messages: Message[]
  isLoading: boolean
}
```

#### `characters` Store
管理角色列表和当前选中的角色。

```typescript
interface CharactersState {
  characters: Character[]
  currentCharacter: Character | null
  isLoading: boolean
}
```

#### `chats` Store
管理所有聊天历史记录。

```typescript
interface ChatsState {
  chats: Chat[]
  isLoading: boolean
}
```

#### `websocket` Store
管理 WebSocket 连接状态。

```typescript
interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}
```

#### `settings` Store
管理用户设置（背景、主题等）。

```typescript
interface SettingsState {
  background: BackgroundSettings
}
```

### API 层

所有 API 调用通过 `src/api/` 目录统一管理：

- `client.ts`: Axios 实例配置（baseURL、拦截器）
- `characters.ts`: 角色相关 API
- `chats.ts`: 聊天相关 API
- `types.ts`: API 请求/响应类型定义

### WebSocket 管理

WebSocket 连接通过 `src/utils/websocket.ts` 的 `WebSocketManager` 类管理：

- 自动重连机制
- 心跳检测
- 消息队列
- 事件监听

使用 `useWebSocket` composable 在组件中访问：

```typescript
const { connect, disconnect, sendMessage, onMessage } = useWebSocket()
```

### Composables

可复用的组合式函数：

- `useChat`: 聊天逻辑（发送消息、加载历史）
- `useWebSocket`: WebSocket 连接管理
- `useSettings`: 设置管理（背景、主题）

## 组件说明

### 布局组件

- `Background.vue`: 背景层（支持图片/视频/纯色）
- `Sidebar.vue`: 左侧边栏容器
- `ChatArea.vue`: 右侧聊天区域容器

### 侧边栏组件

- `CharacterSelector.vue`: 角色选择器
- `ChatHistory.vue`: 聊天历史列表

### 聊天组件

- `MessageList.vue`: 消息列表容器
- `MessageItem.vue`: 单条消息显示
- `InputBox.vue`: 消息输入框

### UI 基础组件

- `Button.vue`: 按钮组件
- `Dialog.vue`: 对话框组件
- `Input.vue`: 输入框组件

## 开发工作流

### 1. 创建新功能

```bash
# 创建功能分支
git checkout -b feat/your-feature

# 开发...
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建测试
npm run build
```

### 2. 提交代码

```bash
git add .
git commit -m "feat: your feature description"
```

### 3. 推送和创建 PR

```bash
git push origin feat/your-feature
# 在 GitHub 上创建 Pull Request
```

## 测试

### 手动测试清单

#### 角色管理
- [ ] 加载角色列表
- [ ] 选择角色
- [ ] 显示角色信息

#### 聊天功能
- [ ] 创建新会话
- [ ] 发送消息
- [ ] 接收消息
- [ ] 加载历史消息
- [ ] 切换会话

#### WebSocket
- [ ] 连接建立
- [ ] 断线重连
- [ ] 实时消息接收

#### 背景设置
- [ ] 上传图片背景
- [ ] 设置视频背景
- [ ] 设置纯色背景
- [ ] 调整模糊度
- [ ] 调整不透明度
- [ ] 设置持久化

#### 响应式
- [ ] 桌面端布局
- [ ] 平板端布局
- [ ] 移动端布局

## 常见问题

### Q: 开发服务器启动失败？
A: 检查端口 5173 是否被占用，或修改 `vite.config.ts` 中的端口配置。

### Q: API 请求失败？
A: 确保后端服务已启动，并检查 `.env.development` 中的 `VITE_API_BASE_URL` 配置。

### Q: WebSocket 连接失败？
A: 确保后端 WebSocket 服务已启动，并检查 `VITE_WS_URL` 配置。

### Q: 类型检查报错？
A: 运行 `npm run type-check` 查看详细错误，确保所有类型定义正确。

### Q: ESLint 报错？
A: 运行 `npm run lint` 查看详细错误，使用 `npm run format` 自动格式化代码。

## 性能优化建议

1. **懒加载路由**: 使用动态 import 加载页面组件
2. **虚拟滚动**: 消息列表使用虚拟滚动优化长列表性能
3. **防抖节流**: 输入框使用防抖，滚动事件使用节流
4. **图片优化**: 背景图片使用 WebP 格式，添加加载占位符
5. **代码分割**: 使用 Vite 的代码分割功能减小首屏加载体积

## 参考资源

- [Vue 3 文档](https://vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [UnoCSS 文档](https://unocss.dev/)
