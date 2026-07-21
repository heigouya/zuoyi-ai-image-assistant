# 佐易 AI 图像助理

本项目当前提供跨平台的本地 AI 出图工作台。页面保持原有设计，任务由本机
Codex 和本地 Skill 执行。

## 当前功能

- 多张产品图和参考图上传
- 亚马逊主图与 A+ 套图任务
- 本机任务队列和状态轮询
- 每次提交都会创建一个可在 Codex 桌面侧边栏看到的新任务
- 项目自带 `product-image-brief-planner` 表单验证 Skill
- Codex 提示词、`result.md` 和生成图片回传
- Windows、macOS、Linux 使用同一套本地服务
- 自动发现项目 Skill、`CODEX_HOME` Skill 和用户 Skill

场景生成、精修/渲染、智能扩图和高清放大模块目前仍是预留入口。

## 运行要求

- Node.js 22 或更新版本
- Codex 桌面应用或已登录的 Codex CLI

本地工作台只使用 Node.js 内置模块，因此运行它不需要执行 `npm install`。

## 一键启动

Windows：双击 `start-zuoyi-workbench.cmd`。

macOS：首次运行时右键打开 `start-zuoyi-workbench.command`，之后可以直接双击。

终端也可以运行：

```bash
npm run local
```

启动后会自动打开：

```text
http://127.0.0.1:48721/
```

启动窗口需要保持开启，按 `Ctrl+C` 停止。

## 当前内置 Skill

正常启动后，网页默认绑定项目内的：

```text
skills/product-image-brief-planner/
```

它会读取产品实拍图、产品名称、目标站点、采购链接、输出要求、参考图或链接、
规格、配件清单和核心卖点，并在任务目录生成一份 `result.md` 产品图任务单。
结果第一行会明确显示技能识别成功，方便验证网页确实调用了这个 Skill。

## 换成正式出图 Skill

将完整 Skill 文件夹放到以下任意位置：

```text
skills/amazon-image-a-plus-planner/
~/.codex/skills/amazon-image-a-plus-planner/
~/.agents/skills/amazon-image-a-plus-planner/
```

也可以通过 `CODEX_SKILLS_DIR` 指定 Skill 根目录。开发包目前没有包含原作者的
Skill，需要从原作者处取得整个文件夹，包括它引用的脚本、资料和素材。
启动时指定正式 Skill：

```bash
LOCAL_SKILL_ID=amazon-image-a-plus-planner npm run local
```

## 验证网页确实调用了本机 Codex

项目自带一个不生成图片的安全测试 Skill。macOS 双击：

```text
test-local-codex.command
```

或在终端运行：

```bash
npm run local:test-codex
```

在自动打开的网页里填写任意测试产品名称和核心卖点，然后提交。成功时右侧会显示：

- 一个新的 Codex 桌面任务标题和 ID
- `local-codex-smoke-test` Skill
- `本机 Codex 调用验证成功`

测试会创建一个会出现在 Codex 桌面侧边栏中的真实任务，但不会生成图片。验证完成后
按 `Ctrl+C` 关闭测试服务，再用正常启动脚本运行工作台。

## 本地配置

所有配置都是可选的：

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `CODEX_BIN` | 自动发现或 `codex` | Codex 可执行文件 |
| `CODEX_SKILLS_DIR` | 自动发现 | Skill 根目录 |
| `LOCAL_JOB_DATA_DIR` | `data/jobs` | 本地任务和图片目录 |
| `LOCAL_MAX_CONCURRENCY` | `1` | 本机最大并发任务数，最高 4 |
| `CODEX_JOB_BRIDGE_PORT` | `48721` | 本地工作台端口 |
| `ENABLE_CODEX_EXEC` | `1` | 设为 `0` 时只创建任务，不执行 Codex |
| `OPEN_CODEX_DESKTOP_TASK` | `1` | 任务完成后自动在 Codex 桌面中打开；设为 `0` 可关闭 |

网页通过 Codex `app-server` 创建永久任务，不使用 ephemeral 模式；因此新任务会与
普通 Codex 桌面任务共用本机任务库存。

任务结果保存在：

```text
data/jobs/<job-id>/
```

每个任务包含输入图、`job.json`、`codex-prompt.txt`、`result.md`、`codex-app-server.log` 和
`images/` 结果目录。

## 验证

不调用 Codex 的本地集成测试：

```bash
npm test
```

语法检查：

```bash
npm run check
```

## 后续

云端 Sites 版本会作为独立执行后端继续开发；本地版和云端版将复用任务格式和
网页交互，但本地版始终只监听本机回环地址。
