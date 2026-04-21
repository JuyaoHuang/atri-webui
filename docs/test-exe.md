# ATRI WebUI - Phase 6 Frontend MVP 测试执行文档

## 测试环境

- **Node.js**: >= 18
- **npm**: >= 9
- **浏览器**: Chrome/Edge/Firefox 最新版本
- **后端服务**: atri 后端 API (需要先修复 asyncio 事件循环问题)

## 测试前准备

### 1. 安装依赖

```bash
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri-webui
npm install
```

### 2. 配置环境变量

确保 `.env.development` 文件存在并配置正确：

```env
VITE_API_BASE_URL=http://localhost:8430
VITE_WS_URL=ws://localhost:8430/ws
```

### 3. 启动后端服务

**注意**: 当前后端存在 asyncio 事件循环冲突问题，需要先修复。

临时解决方案：修改 `atri/src/main.py` 第 124 行：

```python
# 修改前
uvicorn.run(app, host=host, port=port)

# 修改后
config = uvicorn.Config(app, host=host, port=port)
server = uvicorn.Server(config)
await server.serve()
```

然后启动后端：

```bash
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri
uv run python -m src.main
```

### 4. 启动前端开发服务器

```bash
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri-webui
npm run dev
```

访问 http://localhost:5173/

---

## 测试用例

### TC-001: 代码质量检查

**目的**: 验证代码符合 TypeScript 和 ESLint 规范

**执行步骤**:

```bash
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri-webui

# 1. TypeScript 类型检查
npm run type-check

# 2. ESLint 代码检查
npm run lint

# 3. 生产构建
npm run build
```

**期望结果**:
- ✅ `type-check` 无错误
- ✅ `lint` 无错误
- ✅ `build` 成功，生成 `dist/` 目录
- ✅ 构建产物包含：
  - `dist/index.html`
  - `dist/assets/*.css`
  - `dist/assets/*.js`

---

### TC-002: 项目结构验证

**目的**: 验证所有必要文件和目录存在

**执行步骤**:

```bash
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri-webui
ls -R src/
```

**期望结果**:

```
✅ src/api/
   - client.ts
   - types.ts
   - characters.ts
   - chats.ts

✅ src/components/
   - chat/ChatArea.vue, MessageList.vue, MessageItem.vue, InputBox.vue
   - sidebar/Sidebar.vue, CharacterSelector.vue, ChatHistory.vue

✅ src/composables/
   - useChat.ts
   - useWebSocket.ts

✅ src/stores/
   - chat.ts
   - characters.ts
   - chats.ts
   - websocket.ts

✅ src/types/
   - character.ts
   - chat.ts
   - message.ts

✅ src/utils/
   - websocket.ts

✅ docs/
   - DEVELOPMENT.md
   - test-exe.md

✅ README.md (已更新)
```

---

### TC-003: 页面加载测试

**目的**: 验证前端页面能正常加载

**执行步骤**:

1. 启动开发服务器：`npm run dev`
2. 打开浏览器访问 http://localhost:5173/
3. 打开浏览器开发者工具（F12）查看控制台

**期望结果**:
- ✅ 页面正常加载，无白屏
- ✅ 控制台无严重错误（允许后端连接失败的警告）
- ✅ 页面显示基本布局：
  - 左侧边栏
  - 右侧聊天区域

---

### TC-004: UI 组件渲染测试

**目的**: 验证所有 UI 组件能正常渲染

**执行步骤**:

1. 访问 http://localhost:5173/
2. 检查页面元素

**期望结果**:
- ✅ 左侧边栏显示：
  - 角色选择器区域
  - 聊天历史列表区域
- ✅ 右侧聊天区域显示：
  - 消息列表区域
  - 输入框

---

### TC-005: 状态管理测试

**目的**: 验证 Pinia stores 正常工作

**执行步骤**:

1. 打开浏览器开发者工具
2. 在 Console 中执行：

```javascript
// 检查 Pinia stores 是否已注册
window.__PINIA__
```

**期望结果**:
- ✅ `__PINIA__` 对象存在
- ✅ 包含以下 stores：
  - `chat`
  - `characters`
  - `chats`
  - `settings`
  - `websocket`

---

### TC-006: 响应式布局测试

**目的**: 验证不同屏幕尺寸下布局正常

**执行步骤**:

1. 打开浏览器开发者工具
2. 切换到设备模拟模式（Ctrl+Shift+M）
3. 测试不同设备：
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**期望结果**:
- ✅ 桌面端：侧边栏和聊天区域并排显示
- ✅ 平板端：布局自适应
- ✅ 移动端：布局自适应
- ✅ 无横向滚动条
- ✅ 所有元素可见且可交互

---

## 集成测试（需要后端）

**注意**: 以下测试需要后端服务正常运行。当前后端存在 asyncio 事件循环问题，需要先修复。

### TC-007: 角色列表加载测试

**前置条件**: 后端服务运行在 http://localhost:8430

**执行步骤**:

1. 启动后端服务
2. 刷新前端页面
3. 观察左侧边栏角色选择器

**期望结果**:
- ✅ 角色列表从后端加载成功
- ✅ 显示角色名称和头像
- ✅ 可以选择角色

---

### TC-008: 聊天历史加载测试

**前置条件**: 后端服务运行，且存在历史聊天记录

**执行步骤**:

1. 选择一个角色
2. 观察左侧边栏聊天历史列表

**期望结果**:
- ✅ 聊天历史列表从后端加载成功
- ✅ 显示聊天标题和时间
- ✅ 可以点击切换聊天

---

### TC-009: 创建新会话测试

**前置条件**: 后端服务运行

**执行步骤**:

1. 选择一个角色
2. 点击"新建会话"按钮
3. 观察聊天历史列表

**期望结果**:
- ✅ 新会话创建成功
- ✅ 聊天历史列表更新
- ✅ 自动切换到新会话

---

### TC-010: WebSocket 连接测试

**前置条件**: 后端 WebSocket 服务运行在 ws://localhost:8430/ws

**执行步骤**:

1. 打开浏览器开发者工具 → Network → WS
2. 刷新页面
3. 观察 WebSocket 连接

**期望结果**:
- ✅ WebSocket 连接建立成功
- ✅ 连接状态显示为"已连接"
- ✅ 有心跳包（ping/pong）

---

### TC-011: 发送消息测试

**前置条件**: 后端服务运行，WebSocket 连接成功

**执行步骤**:

1. 在输入框输入消息："你好"
2. 点击发送按钮或按 Enter
3. 观察消息列表

**期望结果**:
- ✅ 用户消息立即显示在消息列表
- ✅ 消息通过 WebSocket 发送到后端
- ✅ 收到后端流式响应
- ✅ AI 回复逐 token 显示

---

### TC-012: 断线重连测试

**前置条件**: 后端服务运行，WebSocket 连接成功

**执行步骤**:

1. 停止后端服务
2. 观察前端连接状态
3. 重新启动后端服务
4. 观察前端是否自动重连

**期望结果**:
- ✅ 断线后显示"连接断开"状态
- ✅ 自动尝试重连（指数回退）
- ✅ 后端恢复后自动重连成功
- ✅ 重连后可以继续发送消息

---


## 验收标准

### 代码质量
- ✅ TypeScript 类型检查通过（0 errors）
- ✅ ESLint 检查通过（0 errors）
- ✅ 生产构建成功
- ✅ 无 console.error 或 console.warn（除了预期的后端连接警告）

### 功能完整性
- ✅ Phase 6 核心功能完成：
  - US-FE-001: 项目初始化 ✅
  - US-FE-002: 基础布局 + 状态管理 ✅
  - US-FE-003: API 封装 + 类型定义 ✅
  - US-FE-004: 角色管理 + 聊天历史 ✅
  - US-FE-005: WebSocket + 实时对话 ✅
  - US-FE-007: 集成测试 + 文档 ✅
- ⏭️ 待后续实现：
  - US-FE-006: 背景自定义（推迟到路由管理阶段）

### 文档完整性
- ✅ README.md 更新完整
- ✅ docs/DEVELOPMENT.md 编写完整
- ✅ docs/test-exe.md 编写完整
- ✅ 代码注释清晰

### 架构质量
- ✅ 组件结构清晰
- ✅ 状态管理合理
- ✅ API 层封装完善
- ✅ 类型定义完整
- ✅ 可复用逻辑提取为 composables

---

## 已知问题

### 1. 后端 asyncio 事件循环冲突

**问题描述**: 后端启动时报错：
```
RuntimeError: Cannot run the event loop while another loop is running
```

**影响范围**: 无法进行完整的集成测试（TC-009 ~ TC-015）

**解决方案**: 修改 `atri/src/main.py` 第 124 行：

```python
# 修改前
uvicorn.run(app, host=host, port=port)

# 修改后
config = uvicorn.Config(app, host=host, port=port)
server = uvicorn.Server(config)
await server.serve()
```

**优先级**: 高（阻塞集成测试）

---

## 测试报告模板

```markdown
# Phase 6 Frontend MVP 测试报告

**测试日期**: YYYY-MM-DD
**测试人员**: [姓名]
**测试环境**: 
- Node.js: [版本]
- npm: [版本]
- 浏览器: [浏览器及版本]
- 后端状态: [运行中/未运行]

## 测试结果汇总

| 测试用例 | 状态 | 备注 |
|---------|------|------|
| TC-001: 代码质量检查 | ✅/❌ | |
| TC-002: 项目结构验证 | ✅/❌ | |
| TC-003: 页面加载测试 | ✅/❌ | |
| TC-004: UI 组件渲染测试 | ✅/❌ | |
| TC-005: 状态管理测试 | ✅/❌ | |
| TC-006: 响应式布局测试 | ✅/❌ | |
| TC-007: 角色列表加载测试 | ✅/❌/⏭️ | 需要后端 |
| TC-008: 聊天历史加载测试 | ✅/❌/⏭️ | 需要后端 |
| TC-009: 创建新会话测试 | ✅/❌/⏭️ | 需要后端 |
| TC-010: WebSocket 连接测试 | ✅/❌/⏭️ | 需要后端 |
| TC-011: 发送消息测试 | ✅/❌/⏭️ | 需要后端 |
| TC-012: 断线重连测试 | ✅/❌/⏭️ | 需要后端 |

## 验收结论

- [ ] 通过（所有非后端依赖测试通过）
- [ ] 不通过（存在阻塞性问题）
- [ ] 部分通过（前端功能完整，等待后端修复）

## 问题列表

1. [问题描述]
   - 严重程度: 高/中/低
   - 影响范围: [描述]
   - 建议方案: [描述]

## 备注

[其他说明]
```

---

## 快速验收命令

```bash
# 1. 进入项目目录
cd D:/Coding/GitHub_Resuorse/emotion-robot/atri-webui

# 2. 安装依赖（如果还没安装）
npm install

# 3. 运行所有检查
npm run type-check && npm run lint && npm run build

# 4. 启动开发服务器
npm run dev

# 5. 在浏览器中访问 http://localhost:5173/ 进行手动测试
```

**期望结果**: 所有命令执行成功，页面正常加载，UI 交互正常。
