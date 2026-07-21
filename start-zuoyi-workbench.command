#!/bin/sh
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' "Cannot find Node.js. Please install Node.js 22 or newer:" "https://nodejs.org/"
  printf '%s' "Press Enter to close..."
  read -r _answer
  exit 1
fi

printf '%s\n' "========================================" " Zuoyi AI Image Assistant - Local" "========================================" "" "Keep this window open while using the workbench." "Press Ctrl+C to stop." ""
exec node "bridge/start-local.mjs"
