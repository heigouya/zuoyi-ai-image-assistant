# Demo AI 图像助理

本项目当前提供跨平台的本地 AI 出图工作台。页面保持原有设计，任务由本机
Codex 和本地 Skill 执行。

## 当前功能

- 多张产品图和参考图上传
- 亚马逊主图与 A+ 套图任务
- 本机任务队列和状态轮询
- 当前阶段、运行时长、最后活动时间和已生成图片数
- 默认通过 Codex 原生新任务执行，任务会真实显示在桌面侧边栏
- 可选全自动后台执行模式，交付物不完整时最多自动续跑 2 次
- 后台任务长时间无活动时提示可能停滞，并可手动发送续跑指令
- 项目自带正式的 `product-image-brief-planner` 产品套图 Skill
- Codex 提示词、`result.md` 和生成图片回传
- Windows、macOS、Linux 使用同一套本地服务
- 自动发现项目 Skill、`CODEX_HOME` Skill 和用户 Skill

场景生成、精修/渲染、智能扩图和高清放大模块目前仍是预留入口。

## 运行要求

- Node.js 22 或更新版本
- Codex 桌面应用或已登录的 Codex CLI

本地工作台只使用 Node.js 内置模块，因此运行它不需要执行 `npm install`。

## 一键启动

Windows：双击 `start-demo-workbench.cmd`。

macOS：首次运行时右键打开 `start-demo-workbench.command`，之后可以直接双击。

终端也可以运行：

```bash
npm run local
```

启动后会自动打开：

```text
http://127.0.0.1:48721/
```

启动窗口需要保持开启，按 `Ctrl+C` 停止。

## 两种本地执行方式

网页提交按钮上方可以选择：

- **Codex 可见任务（默认）**：使用 Codex 官方深链接打开原生新任务，任务会进入
  Codex 侧边栏。切换到 Codex 后点一次发送即可开始，生成结果仍会自动回传网页。
- **全自动后台**：网页直接通过独立 `app-server` 执行，无需再点发送；它能正常调用
  Skill 和生成图片，但不保证被 Codex 桌面侧边栏实时收录。Bridge 会监听 Codex
  的分析、文件处理和图片生成事件，并在右侧结果区显示进度。

后台模式不会仅凭 Codex 返回 `completed` 就判定成功。Bridge 还会检查 `result.md`
是否存在并包含当前 Skill 要求的完整章节；若缺失，会在同一 Codex 任务中最多自动
续跑 2 次。普通阶段 3 分钟、图片生成阶段 5 分钟没有新活动时，网页会提示“任务
可能停滞”，此时可点击“继续完成任务”。

独立网页没有权限替用户在 Codex 原生输入框中自动点“发送”。默认模式保留这一次
用户确认，从而不依赖 macOS/Windows 界面模拟，也不使用桌面应用的私有接口。

## 当前内置 Skill

正常启动后，网页默认绑定项目内的：

```text
skills/product-image-brief-planner/
```

它会读取产品实拍图、产品名称、目标站点、采购链接、输出要求、参考图或链接、
规格、配件清单和核心卖点，生成正式分镜、中文文案、英文出图提示词和质检记录。
当当前 Codex 任务具备图片生成能力时，候选图会写入任务的 `images/` 目录并回传网页；
没有图片生成能力时只保留可直接执行的提示词，不会伪造占位图。

## 换成其他出图 Skill

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

项目仍保留一个不生成图片的连接测试 Skill。macOS 双击：

```text
test-local-codex.command
```

或在终端运行：

```bash
npm run local:test-codex
```

在自动打开的网页里填写任意测试产品名称和核心卖点，保持默认“Codex 可见任务”并
提交，然后在 Codex 原生新任务中点一次发送。成功时右侧会显示：

- 一个新的 Codex 侧边栏任务
- `local-codex-smoke-test` Skill
- `本机 Codex 调用验证成功`

测试会创建一个 Codex 原生真实任务，但不会生成图片。验证完成后
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

默认模式通过 `codex://threads/new` 让 Codex 桌面自己创建任务，因此任务属于原生
侧边栏。后台模式使用独立 `app-server`，适合无人值守执行，不应把它返回的线程 ID
当成侧边栏可见性的证明。

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
