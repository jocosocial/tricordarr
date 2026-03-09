#!/usr/bin/env bash
# Bump the app version across Android, iOS, and package.json.
# Increments versionCode/CURRENT_PROJECT_VERSION by 1 and the patch
# segment of versionName/MARKETING_VERSION by 1.
# Prints the new version string to stdout.
# Usage: ./scripts/bump-version.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# macOS sed requires -i '', GNU sed requires -i alone
if sed --version >/dev/null 2>&1; then
  sedi() { sed -i "$@"; }
else
  sedi() { sed -i '' "$@"; }
fi

GRADLE="$ROOT/android/app/build.gradle"
PBXPROJ="$ROOT/ios/Tricordarr.xcodeproj/project.pbxproj"
PACKAGE_JSON="$ROOT/package.json"

OLD_VERSION_CODE=$(grep -E '^\s+versionCode ' "$GRADLE" | head -1 | awk '{print $2}')
OLD_VERSION_NAME=$(grep -E '^\s+versionName ' "$GRADLE" | head -1 | sed -E 's/.*"(.*)".*/\1/')

NEW_VERSION_CODE=$((OLD_VERSION_CODE + 1))

IFS='.' read -r MAJOR MINOR PATCH <<< "$OLD_VERSION_NAME"
NEW_PATCH=$((PATCH + 1))
NEW_VERSION_NAME="${MAJOR}.${MINOR}.${NEW_PATCH}"

# Android
sedi "s/versionCode ${OLD_VERSION_CODE}/versionCode ${NEW_VERSION_CODE}/" "$GRADLE"
sedi "s/versionName \"${OLD_VERSION_NAME}\"/versionName \"${NEW_VERSION_NAME}\"/" "$GRADLE"

# iOS — target exact old values to avoid touching unrelated targets (value 1 / 1.0)
sedi "s/CURRENT_PROJECT_VERSION = ${OLD_VERSION_CODE};/CURRENT_PROJECT_VERSION = ${NEW_VERSION_CODE};/g" "$PBXPROJ"
sedi "s/MARKETING_VERSION = ${OLD_VERSION_NAME};/MARKETING_VERSION = ${NEW_VERSION_NAME};/g" "$PBXPROJ"

# package.json
sedi "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION_NAME}\"/" "$PACKAGE_JSON"

echo "$NEW_VERSION_NAME"
