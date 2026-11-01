#!/usr/bin/env bash
set -euo pipefail

ref="refs/heads/$BRANCH_NAME"
remote_ref=$(git ls-remote --refs origin "$ref")
expected=${remote_ref%%[[:space:]]*}
git push --force-with-lease="$ref:$expected" origin "HEAD:$ref"
