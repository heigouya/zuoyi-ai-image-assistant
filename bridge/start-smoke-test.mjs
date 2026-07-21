process.env.LOCAL_SKILL_ID = "local-codex-smoke-test";
process.env.CODEX_EPHEMERAL = "0";

await import("./start-local.mjs");
