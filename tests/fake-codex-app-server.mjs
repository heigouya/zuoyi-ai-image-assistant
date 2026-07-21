#!/usr/bin/env node

import readline from "node:readline";

const input = readline.createInterface({ input: process.stdin });
const threadId = "019f0000-0000-7000-8000-000000000001";

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

input.on("line", (line) => {
  const message = JSON.parse(line);
  if (message.method === "initialize") {
    send({ id: message.id, result: { userAgent: "fake-codex" } });
    return;
  }
  if (message.method === "thread/start") {
    send({ id: message.id, result: { thread: { id: threadId } } });
    return;
  }
  if (message.method === "thread/name/set") {
    send({ id: message.id, result: {} });
    return;
  }
  if (message.method === "turn/start") {
    const skill = message.params.input.find((item) => item.type === "skill");
    if (skill?.name !== "product-image-brief-planner") {
      send({ id: message.id, error: { message: "Expected explicit skill input" } });
      return;
    }
    send({ id: message.id, result: { turn: { id: "turn_fake_1" } } });
    queueMicrotask(() =>
      send({
        method: "turn/completed",
        params: { threadId, turn: { id: "turn_fake_1", status: "completed" } },
      }),
    );
  }
});
