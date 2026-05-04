variable "project" {
  description = "Logical project / app name (used to namespace AWS resources)"
  type        = string
  default     = "agentic-rcm-demo"
}

variable "aws_region" {
  description = "AWS region for Amplify Hosting + runtime AI services"
  type        = string
  default     = "eu-west-1"
}

variable "github_repository_url" {
  description = "Full HTTPS URL of the GitHub repo Amplify will pull from"
  type        = string
}

variable "github_access_token" {
  description = "GitHub PAT with `repo` (and `admin:repo_hook` for auto-build) scopes. Used by Amplify to clone the repo + register the build webhook."
  type        = string
  sensitive   = true
}

variable "branch_name" {
  description = "Git branch tracked by Amplify"
  type        = string
  default     = "main"
}

variable "enable_auto_build" {
  description = "If true, Amplify auto-deploys every push to the tracked branch. If false, deploys are only triggered via the incoming webhook (CI-driven)."
  type        = bool
  default     = true
}

# ---- Runtime env vars (passed to the Next.js Lambda) -----------------------

variable "bedrock_model_id" {
  description = "Default Bedrock model ID (typically the cross-region inference profile)"
  type        = string
  default     = "eu.anthropic.claude-opus-4-7"
}

variable "enable_comprehend_medical" {
  description = "Toggle for the CDI/Coding agents calling AWS Comprehend Medical"
  type        = bool
  default     = true
}

variable "azure_voice_live_endpoint" {
  description = "Azure AI Foundry project URL for Voice Live"
  type        = string
}

variable "azure_voice_live_key" {
  description = "Azure Voice Live API key"
  type        = string
  sensitive   = true
}

variable "azure_voice_live_api_version" {
  description = "Azure Voice Live API version"
  type        = string
  default     = "2025-10-01"
}

variable "azure_voice_live_model" {
  description = "Azure Voice Live realtime model"
  type        = string
  default     = "gpt-realtime"
}

variable "tags" {
  description = "Tags applied to all created resources"
  type        = map(string)
  default = {
    Project   = "agentic-rcm-demo"
    ManagedBy = "terraform"
    Workload  = "neurostack-rcm"
  }
}
