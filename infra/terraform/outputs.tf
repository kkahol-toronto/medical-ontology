output "amplify_app_id" {
  description = "Amplify app ID — needed by deploy-amplify.sh in AWS-CLI mode"
  value       = aws_amplify_app.this.id
}

output "amplify_app_arn" {
  value = aws_amplify_app.this.arn
}

output "production_url" {
  description = "Permanent public URL of the deployed app (does not change between deploys)"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.this.id}.amplifyapp.com"
}

output "amplify_console_url" {
  description = "Direct link to the Amplify console for this app"
  value       = "https://${var.aws_region}.console.aws.amazon.com/amplify/apps/${aws_amplify_app.this.id}"
}

output "incoming_webhook_url" {
  description = "POST to this URL to trigger a redeploy. Save as AMPLIFY_WEBHOOK_URL in CI secrets."
  value       = "${aws_amplify_webhook.ci_trigger.url}"
  sensitive   = true
}

output "service_role_arn" {
  description = "IAM role the running Next.js Lambda assumes (Bedrock + Comprehend access)"
  value       = aws_iam_role.amplify_service_role.arn
}
