#!/bin/sh
cd "$(dirname "$0")" || exit 1
exec node "bridge/start-local.mjs"
