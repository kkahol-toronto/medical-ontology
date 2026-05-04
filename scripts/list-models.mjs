import { BedrockClient, ListInferenceProfilesCommand } from '@aws-sdk/client-bedrock';

const c = new BedrockClient({ region: process.env.AWS_REGION ?? 'eu-west-1' });
const profiles = await c.send(new ListInferenceProfilesCommand({}));
console.log('--- inference profiles (claude) ---');
for (const p of profiles.inferenceProfileSummaries ?? []) {
  if ((p.inferenceProfileName ?? '').toLowerCase().includes('claude')) {
    console.log(p.inferenceProfileId, '|', p.inferenceProfileName, '|', p.status);
  }
}
