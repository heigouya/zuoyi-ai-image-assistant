---
name: local-codex-smoke-test
description: Verify that the local web workbench starts a fresh Codex session and loads a local skill.
---

# Local Codex smoke test

This is a harmless connectivity test. Do not generate images and do not inspect
unrelated files.

Create `result.md` in the job directory supplied by the task prompt. Its content
must be:

```markdown
# 本机 Codex 调用验证成功

- Skill：`local-codex-smoke-test`
- 结果：网页任务已启动一个新的本机 Codex 会话，并成功加载测试 Skill。
- 安全说明：本测试没有生成图片，也没有修改任务目录以外的文件。
```

After writing that file, finish the task without making any other changes.
