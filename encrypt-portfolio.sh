#!/usr/bin/env bash
# Encrypt portfolio.source.html (plaintext, gitignored) into portfolio.html
# (encrypted, committed). Run this before every push that includes work-page
# changes.
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f portfolio.source.html ]]; then
  echo "portfolio.source.html not found in $(pwd)."
  echo "This file is the plaintext source for the gated work page; it is gitignored."
  exit 1
fi

if [[ -z "${PORTFOLIO_PASSWORD:-}" ]]; then
  read -rsp "Portfolio password: " PORTFOLIO_PASSWORD
  echo
fi

if [[ -z "$PORTFOLIO_PASSWORD" ]]; then
  echo "Empty password. Aborting."
  exit 1
fi

cp portfolio.source.html portfolio.html
npx --yes staticrypt portfolio.html \
  -p "$PORTFOLIO_PASSWORD" \
  --short \
  -d . \
  --template-title "Work — Frederick Casey-Housand" \
  --template-instructions "Password required."

echo
echo "Encrypted portfolio.html written. Commit portfolio.html (and .staticrypt.json on first run) and push."
