#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo 'Necesitas Node.js 24 LTS. Pide a Claude Code que siga CLAUDE.md.'
  exit 1
fi
if [ ! -d node_modules ]; then npm ci || exit 1; fi
if [ ! -f dist/index.html ]; then npm run build || exit 1; fi
if [ "$(uname)" = Darwin ]; then (sleep 3; open http://127.0.0.1:4317) & fi
exec npm start
