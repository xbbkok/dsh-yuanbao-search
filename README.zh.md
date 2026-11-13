# dsh-yuanbao-search

**简体中文** · [English](./README.md)

把腾讯 **元宝搜索**（[so.qq.com](https://so.qq.com/)）做成 DeepSeek Harness
Web 界面里的一个**主面板**，和「任务看板」「Plugins」并列。搜索结果直接在面板内渲染，
不会把窗口甩给系统浏览器。

![Harness 中的元宝搜索面板](./docs/screenshot.png)

## 安装

插件是一个 Harness bundle：一个 Host 半 + 一个 Web 客户端模块。

```bash
# 1. 克隆到你的工作区旁边
git clone https://github.com/xbbkok/dsh-yuanbao-search.git

# 2. 安装进当前 profile
#    （插件管理 → 添加插件 → 选择克隆下来的目录，或：）
dsh plugin --profile <你的profile> add /绝对路径/dsh-yuanbao-search
```

然后在「Plugins」里启用 **Yuanbao Search**，刷新一次窗口。

> bundle 的安装由插件管理器完成：它会链接目录并写入 bundle 行。
> 不要手工修改 profile 的 `package.json` 或 `cordis.patch.yml`。

## 使用

在侧栏面板列表中点击 **Yuanbao Search**（位于 *Context Insights* 与 *More* 之间），
主面板即切换到元宝搜索。

| 控件 | 行为 |
|---|---|
| 搜索框 + **Search** | 打开 `/iaimode/search?query=<词>`，答案在面板内渲染 |
| **Home** | 回到 AI 模式首页 |
| **Reload** | 重新加载内嵌页面 |
| **Open in browser** | 用系统浏览器打开当前地址 |

登录、历史记录与对话都发生在元宝站点自身。插件不读取、不保存、不转发你的元宝账号信息。

## 为什么默认进入 AI 模式

元宝首页的普通搜索会把查询交给 `https://www.sogou.com/web?query=…`。
搜狗禁止被框架嵌入，Harness 外壳就会把这次跳转交给系统浏览器——
这就是「点一下搜索就被甩出应用」的原因。

而 **AI 模式**（`https://so.qq.com/iaimode`）完全在 `so.qq.com` 站内完成检索，
其 URL 形态可以直接加载进面板。因此面板默认打开 AI 模式，工具栏也直接驱动该地址。

## 多语言

面板文案注册在 Client locale 服务的 `yuanbao-search` 命名空间下，
提供 `zh` 与 `en` 两套词典，跟随 Harness 的界面语言切换。
插件卡片上的标题与描述来自 `locale/*.json`。

## 配置

Host 半刻意留空——不注册任何服务、路由或工具，这样 bundle 不会因为名字冲突而激活失败。
面板自带默认地址（`https://so.qq.com/iaimode`）。

## 已知限制

- **面板内用不了「网页 / 搜狗」搜索。** sogou.com 禁止被嵌入，这条路径无法在应用内渲染；
  需要时用 **Open in browser**。
- 元宝页面若触发 `window.open`，外壳仍会用系统浏览器打开。AI 模式默认不会触发；
  强行加 sandbox 会破坏站内登录能力，因此没有这么做。
- 面板依赖 so.qq.com 的 `/iaimode` 路径，以及站点允许被嵌入。
  若腾讯调整其中任一，面板需要同步更新。

## 开发

纯 JavaScript，无构建步骤。

```
index.js            Host 半：apply() 刻意为空
client.js           Web 半：面板本体与侧栏入口
cordis.patch.yml    bundle 补丁，插入插件行
locale/{en,zh}.json 插件卡片元数据
icon.svg            插件图标
docs/screenshot.png README 配图
```

改代码时有两个要点：

1. 动态客户端半拿到的是**受限** Cordis 上下文——只有 `get`、`on`、`provide`、`effect`。
   **没有 `ctx.slots`**，请用 `ctx.get('slots')`。
2. 侧栏入口的 `id` 必须与 `main` 槽的 key 相同，宿主靠这个 id 派发面板切换。

## 许可证

[MIT](./LICENSE)
