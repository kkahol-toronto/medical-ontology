provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

data "aws_caller_identity" "current" {}

# ============================================================================
# IAM service role attached to the Amplify app.
# Gives the running Next.js Lambda permission to call Bedrock + Comprehend
# Medical without long-lived AWS keys in env vars.
# ============================================================================

data "aws_iam_policy_document" "amplify_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "amplify_service_role" {
  name               = "${var.project}-amplify-service-role"
  assume_role_policy = data.aws_iam_policy_document.amplify_assume.json
  description        = "Amplify Hosting service role for ${var.project}. Used by the Next.js Lambda to call Bedrock + Comprehend Medical."
}

data "aws_iam_policy_document" "amplify_logs" {
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "amplify_logs" {
  name   = "${var.project}-amplify-logs"
  role   = aws_iam_role.amplify_service_role.id
  policy = data.aws_iam_policy_document.amplify_logs.json
}

data "aws_iam_policy_document" "runtime_ai" {
  statement {
    sid    = "BedrockInvoke"
    effect = "Allow"
    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream",
    ]
    resources = [
      "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-*",
      "arn:aws:bedrock:${var.aws_region}:${data.aws_caller_identity.current.account_id}:inference-profile/eu.anthropic.claude-*",
    ]
  }

  statement {
    sid    = "ComprehendMedicalRead"
    effect = "Allow"
    actions = [
      "comprehendmedical:DetectEntitiesV2",
      "comprehendmedical:InferICD10CM",
      "comprehendmedical:InferRxNorm",
      "comprehendmedical:InferSNOMEDCT",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "runtime_ai" {
  name   = "${var.project}-runtime-ai"
  role   = aws_iam_role.amplify_service_role.id
  policy = data.aws_iam_policy_document.runtime_ai.json
}

# ============================================================================
# Amplify app (the wrapper) + main branch (the deployable unit).
# Platform = WEB_COMPUTE → Next.js SSR with Lambda runtime.
# ============================================================================

resource "aws_amplify_app" "this" {
  name        = var.project
  description = "Agentic RCM demo — Next.js 16 SSR on Amplify Hosting Compute."
  repository  = var.github_repository_url
  access_token = var.github_access_token
  platform    = "WEB_COMPUTE"

  iam_service_role_arn = aws_iam_role.amplify_service_role.arn

  build_spec = file("${path.module}/../../amplify.yml")

  # Branches we don't manage explicitly should NOT auto-create. Keeps the
  # console clean and avoids surprise deploys from feature branches.
  enable_auto_branch_creation = false
  enable_branch_auto_build    = var.enable_auto_build
  enable_branch_auto_deletion = false

  # Runtime env vars surfaced to the Next.js Lambda. Long-lived AWS keys are
  # intentionally absent: the service role above grants Bedrock + Comprehend
  # access via temporary credentials.
  # Amplify reserves env vars starting with `AWS_` (Lambda auto-injects
  # AWS_REGION based on deployment region — the SDK picks it up natively).
  environment_variables = {
    BEDROCK_MODEL_ID             = var.bedrock_model_id
    ENABLE_COMPREHEND_MEDICAL    = tostring(var.enable_comprehend_medical)
    AZURE_VOICE_LIVE_ENDPOINT    = var.azure_voice_live_endpoint
    AZURE_VOICE_LIVE_KEY         = var.azure_voice_live_key
    AZURE_VOICE_LIVE_API_VERSION = var.azure_voice_live_api_version
    AZURE_VOICE_LIVE_MODEL       = var.azure_voice_live_model
    NEXT_TELEMETRY_DISABLED      = "1"
    _LIVE_UPDATES = jsonencode([
      { name = "Node.js version", pkg = "node", type = "nvm", version = "20" },
    ])
  }

  custom_rule {
    # Amplify default SPA-style fallback. Safe for Next.js — the framework
    # router handles 404s for app routes, and API routes are resolved
    # before this rule fires.
    source = "/<*>"
    target = "/index.html"
    status = "404-200"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.this.id
  branch_name = var.branch_name

  framework = "Next.js - SSR"
  stage     = "PRODUCTION"

  enable_auto_build = var.enable_auto_build
  display_name      = var.branch_name
}

# Incoming webhook your CI script POSTs to.
resource "aws_amplify_webhook" "ci_trigger" {
  app_id      = aws_amplify_app.this.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "CI-triggered redeploys — used by scripts/deploy-amplify.sh"
}
