import { readFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2] || "bridge/sample-amazon-job.json";
const bridgeUrl = process.env.CODEX_JOB_BRIDGE_URL || "http://127.0.0.1:48721";
const resolvedInput = path.resolve(process.cwd(), inputPath);

const payload = JSON.parse(await readFile(resolvedInput, "utf8"));

const response = await fetch(`${bridgeUrl}/jobs`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});

const data = await response.json();

if (!response.ok) {
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
