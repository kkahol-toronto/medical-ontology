import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Debug-only endpoint. Returns whether key runtime env vars are set
 * (without leaking the values themselves). Safe to leave on for the demo.
 */
export async function GET() {
  return NextResponse.json({
    runtime: {
      AWS_REGION: process.env.AWS_REGION ?? null,
      AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ?? null,
      AWS_EXECUTION_ENV: process.env.AWS_EXECUTION_ENV ?? null,
    },
    bedrock: {
      configured: Boolean(
        process.env.AWS_ACCESS_KEY_ID ||
          process.env.AWS_LAMBDA_FUNCTION_NAME ||
          process.env.AWS_EXECUTION_ENV,
      ),
      region:
        process.env.BEDROCK_REGION ?? process.env.AWS_REGION ?? 'eu-west-1',
      modelId: process.env.BEDROCK_MODEL_ID ?? '(unset)',
    },
    comprehend: {
      enabled: process.env.ENABLE_COMPREHEND_MEDICAL ?? '(unset)',
      region:
        process.env.COMPREHEND_REGION ??
        process.env.AWS_REGION ??
        'eu-west-1',
    },
    azureVoiceLive: {
      endpoint_set: Boolean(process.env.AZURE_VOICE_LIVE_ENDPOINT),
      key_set: Boolean(process.env.AZURE_VOICE_LIVE_KEY),
      apiVersion: process.env.AZURE_VOICE_LIVE_API_VERSION ?? '(unset)',
      model: process.env.AZURE_VOICE_LIVE_MODEL ?? '(unset)',
    },
  });
}
