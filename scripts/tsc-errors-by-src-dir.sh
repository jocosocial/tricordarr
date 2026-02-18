#!/usr/bin/env bash
# Run tsc --noEmit and report errors grouped by each directory under src/.
# Exit 0 if no errors; exit 1 if any errors in src/.
# Usage: ./scripts/tsc-errors-by-src-dir.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TSC_OUT=$(npx tsc --noEmit 2>&1) || true
had_errors=0

while IFS= read -r dir; do
  matches=$(echo "$TSC_OUT" | grep -E "${dir}/.*\.(tsx?|ts).*error" || true)
  if [[ -n "$matches" ]]; then
    echo "--- $dir ---"
    echo "$matches"
    echo ""
    had_errors=1
  fi
done < <(find src -maxdepth 1 -type d ! -path src | sort)

exit "$had_errors"
