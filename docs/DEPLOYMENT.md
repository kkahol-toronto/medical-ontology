# Deployment runbook — AWS Amplify Hosting

This is a one-page runbook for the CI/CD team. The Agentic RCM Demo
deploys to **AWS Amplify Hosting (Compute)** in `eu-west-1`. URLs are
permanent per branch and survive every redeploy.

```
Production URL:   https://main.<APP_ID>.amplifyapp.com   (set after bootstrap)
Staging URL:      https://staging.<APP_ID>.amplifyapp.com
Region:           eu-west-1
Build spec:       amplify.yml (in repo root)
Deploy script:    scripts/deploy-amplify.sh
```

---

## 1. One-time bootstrap (do this once per environment)

You can do this via the AWS Console (easiest) or via Terraform / CDK.
Console steps:

1. Open **Amplify Hosting → Create new app → Host web app**.
2. Choose your Git provider (GitHub / CodeCommit / GitLab / Bitbucket)
   and authorize. Pick this repo and the `main` branch.
3. **Build settings** — Amplify auto-detects `amplify.yml`. Confirm:
   - Framework: **Next.js — SSR** (auto)
   - Node version: **20** (set under *Build image settings → Live package updates*)
4. **Environment variables** — paste these in (values from `.env.example`):

   | Name | Notes |
   |---|---|
   | `AWS_REGION`                 | `eu-west-1` |
   | `BEDROCK_MODEL_ID`           | `eu.anthropic.claude-opus-4-7` (or `anthropic.claude-opus-4-7`) |
   | `ENABLE_COMPREHEND_MEDICAL`  | `true` |
   | `AZURE_VOICE_LIVE_ENDPOINT`  | from Azure AI Foundry |
   | `AZURE_VOICE_LIVE_KEY`       | from Azure |
   | `AZURE_VOICE_LIVE_API_VERSION` | `2025-10-01` |
   | `AZURE_VOICE_LIVE_MODEL`     | `gpt-realtime` |

   Do **not** set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` here.
   Use the Amplify service role instead (next step) — that's the AWS-native
   way to give the running app permission to call Bedrock + Comprehend Medical.

5. **App settings → IAM service role** — create or attach a role with this
   inline policy (least-privilege for the runtime):

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "BedrockInvoke",
         "Effect": "Allow",
         "Action": [
           "bedrock:InvokeModel",
           "bedrock:InvokeModelWithResponseStream"
         ],
         "Resource": [
           "arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-*",
           "arn:aws:bedrock:eu-west-1:*:inference-profile/eu.anthropic.claude-*"
         ]
       },
       {
         "Sid": "ComprehendMedicalRead",
         "Effect": "Allow",
         "Action": [
           "comprehendmedical:DetectEntitiesV2",
           "comprehendmedical:InferICD10CM",
           "comprehendmedical:InferRxNorm",
           "comprehendmedical:InferSNOMEDCT"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   The trust policy must allow `amplify.amazonaws.com` to assume it.
   With this attached, the Next.js Lambda can call AWS services using the
   role's temporary credentials — no long-lived keys in env vars.

6. **Note the App ID** (looks like `d1234567890abc`) — your CI needs it.

7. **Create an incoming webhook** for CI to call:
   `App settings → Build settings → Incoming webhooks → Add webhook → main`.
   Copy the URL. This is what `AMPLIFY_WEBHOOK_URL` should be set to.

---

## 2. Hook up CI/CD

The deploy script (`scripts/deploy-amplify.sh`) runs in two modes:

### Mode A — Webhook (recommended)

No AWS credentials in CI. Just one secret.

| Secret name | Value |
|---|---|
| `AMPLIFY_WEBHOOK_URL` | the URL from step 7 above |

Example (any CI): `./scripts/deploy-amplify.sh`

The script will:
1. Run `npm run build` locally as a smoke test.
2. POST to the webhook (which makes Amplify pull the latest commit and rebuild).
3. Print the live-logs URL.

GitHub Actions example: see `.github/workflows/deploy.yml`.

### Mode B — AWS CLI (for manual control / non-Git deploys)

Used when you want to trigger a build without a git push, or your CI
already has AWS credentials.

```bash
export AMPLIFY_APP_ID=d1234567890abc
export AMPLIFY_BRANCH=main
export AMPLIFY_REGION=eu-west-1
aws sso login                              # or any other auth
./scripts/deploy-amplify.sh                # blocks until SUCCEED / FAILED
```

The CI principal needs only:

```json
{
  "Effect": "Allow",
  "Action": ["amplify:StartJob", "amplify:GetJob"],
  "Resource": "arn:aws:amplify:eu-west-1:*:apps/<APP_ID>/branches/main/jobs/*"
}
```

---

## 3. Custom domain (later)

When you're ready to swap `main.<app>.amplifyapp.com` for something like
`nira.<yourdomain>.com`:

1. Amplify Console → app → **Domain management → Add domain**.
2. Verify ownership via Route53 (1-click) or your DNS provider (CNAME records).
3. ACM cert is provisioned automatically. ~10 min.

The `amplifyapp.com` URL keeps working forever as a fallback.

---

## 4. Local dry-run before deploying

```bash
npm run build           # must succeed
npm run start           # smoke at http://localhost:3030
./scripts/deploy-amplify.sh
```

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `bedrock: AccessDeniedException` in prod | Service role missing the Bedrock policy | Re-check step 5 above |
| `Invocation of model ID … with on-demand throughput isn't supported` | Region needs the cross-region inference profile | Set `BEDROCK_MODEL_ID=eu.anthropic.claude-opus-4-7` |
| Voice dock shows `Voice Live not configured` | Azure env vars missing in Amplify console | Add the four `AZURE_VOICE_LIVE_*` vars and redeploy |
| Build fails on `pdf-parse` / `xlsx` import | These packages need `serverExternalPackages` (already in `next.config.ts`) | Make sure you didn't remove them |
| Webhook returns 200 but nothing builds | Webhook is for the wrong branch | Re-create webhook on the correct branch |
| Stuck in `PENDING` for >10 min | Amplify capacity issue in `eu-west-1` | Console → cancel → re-trigger |

---

## 6. Rollback

Amplify keeps previous deployments. To roll back:

1. Console → app → branch → **Deployments** tab.
2. Find the previous green build → **Redeploy this version**.

Or via CLI:

```bash
aws amplify start-job \
  --app-id $AMPLIFY_APP_ID --branch-name main \
  --job-type RETRY --job-id <previous-good-job-id>
```
