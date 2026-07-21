# Local skills

Place the complete Amazon workflow at:

```text
skills/amazon-image-a-plus-planner/SKILL.md
```

The local runner also checks these portable locations:

- `$CODEX_SKILLS_DIR/<skill-id>/SKILL.md`
- `$CODEX_HOME/skills/<skill-id>/SKILL.md`
- `~/.codex/skills/<skill-id>/SKILL.md`
- `~/.agents/skills/<skill-id>/SKILL.md`

The original source package referenced this skill on another computer but did
not include it. Copy the whole skill folder, including any `references/`,
`scripts/`, and `assets/` directories, rather than copying only `SKILL.md`.
