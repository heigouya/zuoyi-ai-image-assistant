# 本地版开发说明

## 主要入口

- 工作台页面：`workbench/index.html`
- 本地服务与任务队列：`bridge/codex-job-server.mjs`
- 跨平台启动器：`bridge/start-local.mjs`
- 命令行提交示例：`bridge/submit-job.mjs`

当前页面由本地服务直接提供，不依赖 Next.js 或前端构建步骤。

## API

- `GET /health`：运行状态、Skill 状态和队列状态
- `POST /jobs`：创建任务
- `GET /jobs/:id`：查询任务
- `GET /files/:id/images/:file`：读取任务结果图

服务只监听 `127.0.0.1`，不应映射或暴露到公网。

## Skill 发现顺序

1. `CODEX_SKILLS_DIR`
2. 项目内 `skills/`
3. `CODEX_HOME/skills/`
4. `~/.codex/skills/`
5. `~/.agents/skills/`

网页只提交 `skillId`；服务器负责解析真实路径，客户端不能指定任意 Skill 路径。

## 任务执行

本机默认同时执行一个任务，其余任务排队。每个任务使用独立目录，Codex 在项目
工作区沙箱内运行，不使用取消审批和沙箱的危险参数。

如需只测试任务创建：

```bash
ENABLE_CODEX_EXEC=0 npm run bridge
```
