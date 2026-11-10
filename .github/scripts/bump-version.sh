#!/usr/bin/env bash
set -euo pipefail

case "$SEMVER_INCREMENT" in
  major|minor|patch) ;;
  *) echo "Invalid version increment" >&2; exit 1 ;;
esac

version=$(docker run --rm alpine/semver semver -c -i "$SEMVER_INCREMENT" "$PREVIOUS_TAG")
printf 'NEW_VERSION=%s\n' "$version" >> "$GITHUB_OUTPUT"
