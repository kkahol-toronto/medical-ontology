#!/usr/bin/env bash
# =============================================================================
# scripts/deploy-amplify.sh
# -----------------------------------------------------------------------------
# Trigger a deployment of the Agentic RCM Demo to AWS Amplify Hosting.
#
# Usage:
#   ./scripts/deploy-amplify.sh                       # uses env / .env.deploy
#   ./scripts/deploy-amplify.sh --webhook <url>       # explicit webhook
#   ./scripts/deploy-amplify.sh --app <id> --branch main   # AWS CLI mode
#
# Modes (auto-selected):
#   1. WEBHOOK MODE  — if AMPLIFY_WEBHOOK_URL is set OR --webhook supplied.
#                      No AWS credentials needed in CI. Recommended.
#   2. AWS CLI MODE  — if AMPLIFY_APP_ID and AMPLIFY_BRANCH are set.
#                      Requires aws CLI + IAM permissions
#                      (amplify:StartJob on the app).
#
# Both modes block until the build completes (success or fail).
#
# Env vars (any of):
#   AMPLIFY_WEBHOOK_URL      — incoming webhook from Amplify Hosting console
#   AMPLIFY_APP_ID           — e.g. d1234567890abc
#   AMPLIFY_BRANCH           — e.g. main (default: main)
#   AMPLIFY_REGION           — AWS region of the Amplify app (default: eu-west-1)
#   DEPLOY_POLL_INTERVAL     — seconds between status polls (default: 15)
#   DEPLOY_TIMEOUT_SECONDS   — overall timeout (default: 1800 = 30 min)
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ -f .env.deploy ]]; then
  # shellcheck disable=SC1091
  set -a; source .env.deploy; set +a
fi

WEBHOOK_URL="${AMPLIFY_WEBHOOK_URL:-}"
APP_ID="${AMPLIFY_APP_ID:-}"
BRANCH="${AMPLIFY_BRANCH:-main}"
REGION="${AMPLIFY_REGION:-eu-west-1}"
POLL_INTERVAL="${DEPLOY_POLL_INTERVAL:-15}"
TIMEOUT_SECONDS="${DEPLOY_TIMEOUT_SECONDS:-1800}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --webhook)  WEBHOOK_URL="$2"; shift 2 ;;
    --app)      APP_ID="$2";      shift 2 ;;
    --branch)   BRANCH="$2";      shift 2 ;;
    --region)   REGION="$2";      shift 2 ;;
    -h|--help)
      sed -n '2,28p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

log()  { printf '\033[0;36m▶\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m✔\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m!\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[0;31m✘\033[0m %s\n' "$*" >&2; exit 1; }

# -----------------------------------------------------------------------------
# Sanity checks
# -----------------------------------------------------------------------------
log "Verifying production build is reproducible locally"
if ! npm run build --silent; then
  fail "Local build failed — fix before deploying"
fi
ok  "Local build succeeded"

# -----------------------------------------------------------------------------
# Mode 1: Webhook
# -----------------------------------------------------------------------------
if [[ -n "$WEBHOOK_URL" ]]; then
  log "Triggering Amplify deployment via webhook"
  HTTP_CODE=$(curl -sS -o /tmp/amplify-webhook.out -w '%{http_code}' \
    -X POST -H 'Content-Type: application/json' "$WEBHOOK_URL")
  if [[ "$HTTP_CODE" != "200" && "$HTTP_CODE" != "201" && "$HTTP_CODE" != "202" ]]; then
    cat /tmp/amplify-webhook.out >&2
    fail "Webhook returned HTTP $HTTP_CODE"
  fi
  ok  "Webhook accepted (HTTP $HTTP_CODE)"
  echo
  echo "Build progress: https://$REGION.console.aws.amazon.com/amplify/apps"
  echo "(Webhook mode does not stream status — open the console to watch logs)"
  exit 0
fi

# -----------------------------------------------------------------------------
# Mode 2: AWS CLI
# -----------------------------------------------------------------------------
[[ -n "$APP_ID" ]]  || fail "Set AMPLIFY_APP_ID or AMPLIFY_WEBHOOK_URL"
command -v aws >/dev/null || fail "aws CLI not installed"

log "Starting Amplify job  app=$APP_ID  branch=$BRANCH  region=$REGION"
JOB_JSON=$(aws amplify start-job \
  --app-id "$APP_ID" \
  --branch-name "$BRANCH" \
  --job-type RELEASE \
  --region "$REGION" \
  --output json)

JOB_ID=$(printf '%s' "$JOB_JSON" | python3 -c 'import json,sys;print(json.load(sys.stdin)["jobSummary"]["jobId"])')
ok  "Job started: $JOB_ID"
echo "Live logs: https://$REGION.console.aws.amazon.com/amplify/apps/$APP_ID/branches/$BRANCH/deployments/$JOB_ID"

# -----------------------------------------------------------------------------
# Poll until done
# -----------------------------------------------------------------------------
START=$(date +%s)
while true; do
  STATUS=$(aws amplify get-job \
    --app-id "$APP_ID" --branch-name "$BRANCH" --job-id "$JOB_ID" \
    --region "$REGION" --output json \
    | python3 -c 'import json,sys;print(json.load(sys.stdin)["job"]["summary"]["status"])')

  case "$STATUS" in
    SUCCEED)
      ok "Deployment SUCCEEDED"
      exit 0 ;;
    FAILED|CANCELLED)
      fail "Deployment $STATUS — see Amplify console for logs" ;;
    PENDING|PROVISIONING|RUNNING)
      printf '  · %s …\n' "$STATUS" ;;
    *)
      warn "unexpected status: $STATUS" ;;
  esac

  ELAPSED=$(( $(date +%s) - START ))
  if (( ELAPSED > TIMEOUT_SECONDS )); then
    fail "Timed out after ${TIMEOUT_SECONDS}s waiting for deploy"
  fi
  sleep "$POLL_INTERVAL"
done
