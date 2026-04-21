# 用户配置说明

## 如何配置用户昵称和头像

打开文件：`src/stores/user.ts`

找到以下配置区域并修改：

```typescript
// ============================================
// 用户配置 - 在这里修改你的昵称和头像
// ============================================
const DEFAULT_SETTINGS: UserSettings = {
  nickname: '你',           // 修改这里设置你的昵称
  avatar: 'default-user.jpg' // 修改这里设置你的头像文件名
}
// ============================================
```

## 配置示例

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  nickname: '小明',
  avatar: 'xiaoming.jpg'
}
```

## 头像文件

将你的头像图片放到 `public/avatars/` 目录下，例如：
- `public/avatars/xiaoming.jpg`
- `public/avatars/my-avatar.png`

支持的图片格式：jpg, jpeg, png, gif, webp

## 配置生效

修改配置后：
1. 重新启动开发服务器（`npm run dev`）
2. 或刷新浏览器页面
3. 如果浏览器有缓存，可以清除 LocalStorage 中的 `atri_user_settings` 键

## 注意事项

- 昵称会显示在聊天消息的用户名位置
- 头像会显示在用户消息的左侧（圆形头像）
- 如果头像文件不存在，会显示一个带有昵称首字母的默认头像
