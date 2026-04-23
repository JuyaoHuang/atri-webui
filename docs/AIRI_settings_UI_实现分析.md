# AIRI `/settings` UI 实现分析

## 目的

这份文档用于说明 AIRI 的 `/settings` 页面并不是单一页面组件，而是一条完整的渲染链路。`atri-webui` 如果要做到“和 AIRI 一样”，需要复制的不只是卡片组件，还包括布局容器、路由元信息、UnoCSS 主题、图标体系、动效插件和页面头部结构。

## 结论

AIRI 的 settings UI 由以下几层共同组成：

1. `apps/stage-web/src/main.ts`
   - 注册 `MotionPlugin`
   - 使用 `vite-plugin-vue-layouts` 的 `setupLayouts`
   - 导入 `@unocss/reset/tailwind.css`、`vue-sonner/style.css`、`./styles/main.css`、`uno.css`
2. `packages/stage-layouts/src/layouts/settings.vue`
   - 真正的 settings 页面骨架
   - 负责安全区 padding、顶部 `HeaderLink`、`PageHeader`、滚动容器、主题色同步
3. `apps/stage-web/src/pages/settings/**`
   - 页面本身只声明内容区
   - 通过 `<route lang="yaml">` 提供 `layout: settings`、`titleKey`、`subtitleKey`、`descriptionKey`、`icon`、`settingsEntry`
4. `packages/stage-ui/src/components/layouts/page-header.vue`
   - 顶部返回箭头、标题、副标题、切页动画
5. `packages/stage-ui/src/components/menu/icon-item.vue`
   - settings 首页/目录页的卡片样式
   - 包含背景渐变、点阵遮罩、hover 色偏移、右侧大图标
6. `packages/stage-ui/src/components/layouts/ripple-grid/index.vue`
   - 卡片网格布局
   - 配合 `use-ripple-grid-state.ts` 记录点击源，提供 AIRI 风格的进入级联动效
7. `uno.config.ts`
   - 不是默认 Uno 配置
   - 使用 `presetWind3`、`presetAttributify`、`presetTypography`、`presetIcons`、`presetScrollbar`
   - 额外定义了 `bg-dotted-[...]`、`mask-[...]` 等 AIRI settings UI 必需规则

## 关键文件

### 1. 应用入口

- `airi/apps/stage-web/src/main.ts`
- `airi/apps/stage-web/src/styles/main.css`
- `airi/apps/stage-web/vite.config.ts`

这里决定了 settings UI 能否正常显示：

- `MotionPlugin` 提供 `v-motion`
- `vite-plugin-vue-layouts` 把页面的 `layout: settings` 元信息绑定到 settings layout
- `main.css` 定义 `--bg-color`
- `uno.css` + AIRI 的 Uno 规则决定原子类和自定义规则是否生效

### 2. Settings 布局

- `airi/packages/stage-layouts/src/layouts/settings.vue`

这个文件是 AIRI settings 的核心骨架，负责：

- 顶部品牌链接 `HeaderLink`
- 标题区 `PageHeader`
- `RouterView` 内容容器
- `#settings-scroll-container`
- 使用 `bg-$bg-color` 保持和全局主题背景一致

它并不直接渲染 settings 卡片，而是给所有 settings 子页提供统一壳层。

### 3. Settings 目录页

- `airi/apps/stage-web/src/pages/settings/system/index.vue`

这个页面展示了 AIRI settings 首页条目的标准写法：

- 数据源是一个数组
- 每个条目有 `title / description / icon / to`
- 用 `RippleGrid` 渲染
- 单条卡片用 `IconItem`
- 右下角有一个大号半透明 `i-solar:settings-bold-duotone` 装饰图标

### 4. 顶部标题栏

- `airi/packages/stage-ui/src/components/layouts/page-header.vue`

核心特征：

- 使用 `useMotion`
- 左侧是 `i-solar:alt-arrow-left-line-duotone`
- 上方细小副标题，下方大标题
- 背景直接取 `bg="$bg-color"`
- 切页时做 `initial -> enter -> leave` 动画

### 5. 顶部品牌链接

- `airi/packages/stage-layouts/src/components/Layouts/HeaderLink.vue`

核心特征：

- 左上角返回主页的品牌链接
- logo 使用图片
- 文案使用 `font-quicksand font-semibold`
- logo 通过 `filter: hue-rotate(...)` 跟随主题色变化

### 6. 目录卡片

- `airi/packages/stage-ui/src/components/menu/icon-item.vue`

这是 AIRI settings 最关键的视觉组件，核心样式包括：

- 浅色 `bg="neutral-50"`，暗色 `dark:neutral-900`
- 边框 hover 时偏向 `primary`
- `::before` 叠加渐变扫光
- `::after` 叠加点阵背景
- 右侧绝对定位的大图标
- 标题和描述 hover 时一起变色
- 暗色模式下 hover 颜色切换为 `primary-300 / primary-400`

注意：它依赖 AIRI Uno 里的 `bg-dotted-[...]` 和 `mask-image` 规则。如果只复制 Vue 文件而不复制 Uno 规则，效果不会一致。

### 7. RippleGrid

- `airi/packages/stage-ui/src/components/layouts/ripple-grid/index.vue`
- `airi/packages/stage-ui/src/composables/use-ripple-grid-state.ts`

作用：

- 控制目录卡片以点击点为源的级联进入动画
- 支持响应式列数
- 使用 `v-motion`

如果不需要完全复制交互，可以降级为普通单列/双列 grid；但如果目标是“和 AIRI 一样”，这个组件需要保留。

## 样式系统

### 1. 全局背景色

`airi/apps/stage-web/src/styles/main.css` 定义：

- `--bg-color-light`
- `--bg-color-dark`
- `--bg-color`

settings layout 和 page header 都直接依赖 `--bg-color`。

### 2. UnoCSS

`airi/uno.config.ts` 中与 settings UI 直接相关的内容：

- `presetWind3`
- `presetAttributify`
- `presetTypography`
- `presetIcons`
- `presetScrollbar`
- `presetChromatic`
- `bg-dotted-[...]` 自定义 rule
- `mask-[...]` 自定义 rule
- 多组字体族，包括 `DM Sans`、`Quicksand`、`Comfortaa`

结论：AIRI settings 的观感不是单纯 CSS 文件堆出来的，而是深度依赖 Uno 主题和规则。

## 背景与主题色

### Settings 页面本身

`settings.vue` 本身没有额外复杂背景组件，它主要依赖：

- 全局 `--bg-color`
- 顶部 `HeaderLink`
- 内容区域的留白和滚动容器

### AIRI 主界面背景系统

相关逻辑在：

- `airi/packages/stage-layouts/src/stores/background.ts`
- `airi/packages/stage-layouts/src/composables/theme-color.ts`

这些主要用于主页面背景选择和主题色同步，不是 settings 页面骨架的直接前置依赖。但 `settings.vue` 使用了同一套 `bg-$bg-color` 和 theme-color 同步思路，所以保留全局背景变量会更接近 AIRI。

## 对 `atri-webui` 的迁移建议

### 必须迁移

1. settings layout 容器结构
2. `PageHeader`
3. `HeaderLink`
4. `IconItem`
5. `RippleGrid`
6. settings 目录页的数据驱动卡片渲染方式
7. `--bg-color` 变量和对应全局样式
8. UnoCSS 中 `bg-dotted-[...]` 等必要规则
9. `MotionPlugin`

### 可按项目实际调整

1. HeaderLink 中的品牌文案和 logo
2. 路由元信息是否继续用手写 router，而不是 AIRI 的 `layout: settings`
3. 右下角装饰图标是否保留
4. 具体文案是否保留中文项目文案

## 当前判断

`atri-webui` 目前已经复制了以下 AIRI 片段，但尚未形成完整系统：

- `src/components/layouts/PageHeader.vue`
- `src/components/menu/IconItem.vue`
- `src/components/ui/RippleGrid.vue`
- `src/composables/useGridRipple.ts`
- `src/styles/main.css`

缺失的是：

- 真正的 AIRI settings layout 容器
- 顶部 `HeaderLink`
- MotionPlugin 注册
- 更接近 AIRI 的 Uno 规则
- 目录页从“左侧边栏 + router-view”切换为 AIRI 风格的“PageHeader + 卡片目录/内容页”

## 实施策略

为了让 `atri-webui` 的 `/settings` 和 AIRI 尽量一致，建议按以下顺序迁移：

1. 先把 `settings` 外层骨架改成 AIRI `settings.vue`
2. 接入 `HeaderLink + PageHeader`
3. 将 `/settings` 首页改成 AIRI 风格目录卡片页
4. 将未完成页面统一替换成更接近 AIRI 的占位内容
5. 补齐 MotionPlugin 和 Uno 规则
6. 最后再微调品牌文案和本项目路由映射
