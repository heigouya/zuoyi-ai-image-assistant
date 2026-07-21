import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const serverPath = path.join(__dirname, "codex-job-server.mjs");

function openBrowser(url) {
  const command =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  const opener = spawn(command[0], command[1], {
    detached: true,
    shell: false,
    stdio: "ignore",
  });
  opener.unref();
}

const child = spawn(process.execPath, [serverPath], {
  cwd: projectRoot,
  env: { ...process.env, ENABLE_CODEX_EXEC: process.env.ENABLE_CODEX_EXEC ?? "1" },
  stdio: ["inherit", "pipe", "pipe"],
});

let browserOpened = false;
child.stdout.on("data", (chunk) => {
  const output = chunk.toString("utf8");
  process.stdout.write(output);
  const match = /Codex image job bridge running at (http:\/\/127\.0\.0\.1:\d+)/u.exec(
    output,
  );
  if (match && !browserOpened) {
    browserOpened = true;
    openBrowser(match[1]);
  }
});
child.stderr.on("data", (chunk) => process.stderr.write(chunk));
child.on("exit", (code) => process.exit(code ?? 1));

function stop() {
  if (!child.killed) child.kill("SIGTERM");
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
