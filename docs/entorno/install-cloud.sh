#!/usr/bin/env bash
set -euo pipefail

mes_repo=/workspace/mes.
cd "$mes_repo"

mes_node_major="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$mes_node_major" != "24" ]]
then
  printf 'Mes requiere Node.js 24; versión detectada: %s\n' "$(node --version)" >&2
  exit 1
fi

npm ci --cache /tmp/mes-npm-cache --prefer-offline
npm test
npm run typecheck
npm run format:check
npm run build

export PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/mes-playwright
mes_playwright_version="$(node -p "require('./node_modules/playwright/package.json').version")"
if [[ "$mes_playwright_version" != "1.56.1" ]]
then
  printf 'Revisa la preparación de Chromium para Playwright %s.\n' "$mes_playwright_version" >&2
  exit 1
fi

mes_browser_executable="$PLAYWRIGHT_BROWSERS_PATH/chromium_headless_shell-1194/chrome-linux/headless_shell"
if [[ ! -x "$mes_browser_executable" ]]
then
  mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
  if ! npx playwright install --only-shell chromium
  then
    mes_system_chromium="$(command -v chromium || true)"
    test -n "$mes_system_chromium"
    mkdir -p "$(dirname "$mes_browser_executable")"
    if [[ ! -e "$mes_browser_executable" ]]
    then
      ln -s "$mes_system_chromium" "$mes_browser_executable"
    fi
  fi
fi

mes_qa_output="$(mktemp -d /tmp/mes-qa-install-XXXXXX)"
npm run qa -- --out "$mes_qa_output"
