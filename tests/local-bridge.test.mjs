import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function startBridge(dataDir, extraEnv = {}) {
  const child = spawn(process.execPath, ["bridge/codex-job-server.mjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      CODEX_JOB_BRIDGE_PORT: "0",
      ENABLE_CODEX_EXEC: "0",
      LOCAL_JOB_DATA_DIR: dataDir,
      OPEN_CODEX_DESKTOP_TASK: "0",
      ...extraEnv,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  const url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Bridge start timed out:\n${output}`)), 5000);
    child.stdout.on("data", (chunk) => {
      output += chunk.toString("utf8");
      const match = /Codex image job bridge running at (http:\/\/127\.0\.0\.1:\d+)/u.exec(
        output,
      );
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString("utf8");
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Bridge exited with ${code}:\n${output}`));
    });
  });

  return { child, url };
}

test("local bridge serves the workbench and creates an isolated job", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "zuoyi-local-test-"));
  const { child, url } = await startBridge(dataDir);

  try {
    const healthResponse = await fetch(`${url}/health`);
    assert.equal(healthResponse.status, 200);
    const health = await healthResponse.json();
    assert.equal(health.ok, true);
    assert.equal(health.mode, "local-codex");
    assert.equal(health.enableCodexExec, false);

    const pageResponse = await fetch(url);
    assert.equal(pageResponse.status, 200);
    assert.match(await pageResponse.text(), /佐易-AI图像助理/u);

    const payload = {
      templateId: "amazon-a-plus-suite",
      templateName: "$amazon-image-a-plus-planner",
      skillId: "amazon-image-a-plus-planner",
      productName: "测试产品",
      marketplace: "Amazon Germany",
      sellingPoints: "耐用，易安装",
      productImages: [],
      referenceImages: [],
    };
    const createResponse = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: url },
      body: JSON.stringify(payload),
    });
    assert.equal(createResponse.status, 200);
    const created = await createResponse.json();
    assert.match(created.id, /^amazon-[0-9a-f-]{36}$/u);
    assert.equal(created.status, "waiting_for_codex");
    assert.equal(created.images.length, 0);
    assert.ok(created.workspaceJobPath.startsWith(dataDir));

    const prompt = await readFile(path.join(created.workspaceJobPath, "codex-prompt.txt"), "utf8");
    assert.match(prompt, /Images output directory:/u);
    assert.match(prompt, /generate real image candidates/u);
    assert.match(prompt, /never create placeholders/u);

    const jobResponse = await fetch(`${url}/jobs/${created.id}`);
    assert.equal(jobResponse.status, 200);
    assert.equal((await jobResponse.json()).id, created.id);

    const rejectedOrigin = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://malicious.example",
      },
      body: JSON.stringify(payload),
    });
    assert.equal(rejectedOrigin.status, 403);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("local bridge discovers the bundled Codex smoke-test skill", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "zuoyi-skill-test-"));
  const { child, url } = await startBridge(dataDir, {
    LOCAL_SKILL_ID: "local-codex-smoke-test",
  });

  try {
    const response = await fetch(`${url}/health`);
    assert.equal(response.status, 200);
    const health = await response.json();
    assert.equal(health.skillId, "local-codex-smoke-test");
    assert.equal(health.skillAvailable, true);
    assert.match(health.skillPath, /local-codex-smoke-test\/SKILL\.md$/u);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("local bridge creates a persistent desktop task with an explicit project skill", async () => {
  const dataDir = await mkdtemp(path.join(tmpdir(), "zuoyi-desktop-task-test-"));
  const fakeCodex = path.join(projectRoot, "tests", "fake-codex-app-server.mjs");
  const { child, url } = await startBridge(dataDir, {
    ENABLE_CODEX_EXEC: "1",
    CODEX_BIN: fakeCodex,
  });

  try {
    const payload = {
      templateId: "amazon-a-plus-suite",
      templateName: "$product-image-brief-planner",
      skillId: "product-image-brief-planner",
      productName: "可见任务测试",
      marketplace: "德国",
      sellingPoints: "防水，易安装",
      productImages: [],
      referenceImages: [],
    };
    const createResponse = await fetch(`${url}/jobs`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: url },
      body: JSON.stringify(payload),
    });
    assert.equal(createResponse.status, 200);
    const created = await createResponse.json();

    let completed = created;
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const response = await fetch(`${url}/jobs/${created.id}`);
      completed = await response.json();
      if (!["queued", "running"].includes(completed.status)) break;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    assert.equal(completed.status, "completed");
    assert.equal(completed.executionMode, "codex-desktop-task");
    assert.equal(completed.skillId, "product-image-brief-planner");
    assert.equal(completed.codexThreadId, "019f0000-0000-7000-8000-000000000001");
    assert.equal(completed.codexTurnId, "turn_fake_1");
    assert.equal(completed.codexTaskTitle, "网页产品图：可见任务测试");
    assert.equal(
      completed.codexDeepLink,
      "codex://threads/019f0000-0000-7000-8000-000000000001",
    );
    assert.equal(completed.codexDesktopOpened, false);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    await rm(dataDir, { recursive: true, force: true });
  }
});
