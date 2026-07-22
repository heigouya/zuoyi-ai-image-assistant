#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";

const input = readline.createInterface({ input: process.stdin });
const threadId = "019f0000-0000-7000-8000-000000000001";
const incompleteFirst = process.env.FAKE_INCOMPLETE_FIRST === "1";
const alwaysIncomplete = process.env.FAKE_ALWAYS_INCOMPLETE === "1";
const hangFirst = process.env.FAKE_HANG_FIRST === "1";
let turnCounter = 0;
let jobDir = "";
let hangingTurnId = "";

const validResult = `# 产品图生成任务单

> 技能识别成功：\`product-image-brief-planner\`

## 提交内容

测试提交内容。

## 完整性与风险

测试风险。

## 套图策略

测试策略。

## 分镜与提示词

测试提示词。

## 生成结果

测试环境未生成图片。

## 质检

结构校验通过。

---
本任务由网页调用本机 Codex，并显式加载项目 Skill 完成。
`;

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

async function finishTurn(turnId) {
  if (!alwaysIncomplete && (!incompleteFirst || turnCounter > 1) && jobDir) {
    await mkdir(jobDir, { recursive: true });
    await writeFile(path.join(jobDir, "result.md"), validResult, "utf8");
  }
  send({
    method: "item/completed",
    params: {
      threadId,
      turnId,
      item: { id: `item_${turnCounter}`, type: "imageGeneration" },
    },
  });
  send({
    method: "turn/completed",
    params: { threadId, turn: { id: turnId, status: "completed" } },
  });
}

input.on("line", async (line) => {
  const message = JSON.parse(line);
  if (message.method === "initialize") {
    send({ id: message.id, result: { userAgent: "fake-codex" } });
    return;
  }
  if (["thread/start", "thread/resume"].includes(message.method)) {
    send({ id: message.id, result: { thread: { id: threadId } } });
    return;
  }
  if (message.method === "thread/name/set") {
    send({ id: message.id, result: {} });
    return;
  }
  if (message.method === "turn/start") {
    turnCounter += 1;
    const skill = message.params.input.find((item) => item.type === "skill");
    if (turnCounter === 1 && !skill && !message.params.input.some((item) => item.type === "text")) {
      send({ id: message.id, error: { message: "Expected turn input" } });
      return;
    }
    if (skill && skill.name !== "product-image-brief-planner") {
      send({ id: message.id, error: { message: "Expected explicit skill input" } });
      return;
    }
    const prompt = message.params.input.find((item) => item.type === "text")?.text || "";
    const directoryMatch = /^Job directory: (.+)$/mu.exec(prompt);
    if (directoryMatch) jobDir = directoryMatch[1].trim();
    const turnId = `turn_fake_${turnCounter}`;
    send({ id: message.id, result: { turn: { id: turnId } } });
    send({ method: "turn/started", params: { threadId, turn: { id: turnId } } });
    send({
      method: "item/started",
      params: {
        threadId,
        turnId,
        item: { id: `item_${turnCounter}`, type: "imageGeneration" },
      },
    });
    if (hangFirst && turnCounter === 1) {
      hangingTurnId = turnId;
      return;
    }
    queueMicrotask(() => finishTurn(turnId));
    return;
  }
  if (message.method === "turn/steer") {
    send({ id: message.id, result: {} });
    if (hangingTurnId) {
      const turnId = hangingTurnId;
      hangingTurnId = "";
      queueMicrotask(() => finishTurn(turnId));
    }
  }
});
