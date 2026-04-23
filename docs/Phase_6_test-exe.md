# Phase 6: 前端 MVP 完善 — 测试执行文档

> **测试日期**: 2026-04-23  
> **Phase**: Phase 6 - 背景自定义 + 设置页面框架

## 1. 快速自检

```bash
cd atri-webui
npm run lint && npm run type-check && npm run build
```

**期望**：所有检查通过

## 2. 功能验收测试用例

### TC-1: 设置页面导航
1. 访问 http://localhost:5173/settings
2. 观察侧边栏显示 11 个菜单项
3. 点击菜单项切换页面

**预期**：✅ 菜单项高亮，页面切换正常

### TC-2: 背景图片上传
1. 访问 /settings/scene
2. 上传 PNG/JPG 图片（< 5MB）

**预期**：✅ 背景立即更新，刷新后保持

### TC-3: 透明度/模糊度调节
1. 拖动透明度滑块到 50%
2. 拖动模糊度滑块到 5px

**预期**：✅ 实时变化，刷新后保持

### TC-4: 背景重置
1. 点击"重置为默认"

**预期**：✅ 恢复默认状态

### TC-5: 错误处理
1. 上传 .txt 文件
2. 上传超大图片（> 5MB）

**预期**：✅ 显示错误提示

### TC-6: LocalStorage 持久化
1. F12 → Application → LocalStorage
2. 查看 `atri-background-settings` 键

**预期**：✅ JSON 格式存储，实时更新

## 3. 验收标准

- [ ] 所有 6 个测试用例通过
- [ ] npm run lint/type-check/build 全部通过
- [ ] 11 个设置页面路由可访问
- [ ] 背景自定义功能完全可用
