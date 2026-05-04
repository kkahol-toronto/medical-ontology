import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID,
    AWS_REGION: process.env.AWS_REGION,
    has_aws_key: Boolean(process.env.AWS_ACCESS_KEY_ID),
    enable_comprehend: process.env.ENABLE_COMPREHEND_MEDICAL,
  });
}
