import {
  ComprehendMedicalClient,
  DetectEntitiesV2Command,
  InferICD10CMCommand,
  InferRxNormCommand,
  InferSNOMEDCTCommand,
  type Entity,
  type ICD10CMEntity,
  type RxNormEntity,
  type SNOMEDCTEntity,
} from '@aws-sdk/client-comprehendmedical';

let _client: ComprehendMedicalClient | null = null;

export function comprehendClient() {
  if (_client) return _client;
  // Comprehend Medical is regional — eu-west-1 is supported. Credentials
  // come from the SDK's default provider chain (Lambda role in Amplify,
  // env vars in dev).
  _client = new ComprehendMedicalClient({
    region: process.env.AWS_REGION ?? 'eu-west-1',
  });
  return _client;
}

export interface ExtractedEntity {
  text: string;
  category: string;
  type: string;
  score: number;
  beginOffset?: number;
  endOffset?: number;
  attributes?: Array<{ type: string; text: string; score?: number }>;
}

export interface ExtractedICD10 {
  text: string;
  score: number;
  concepts: Array<{ code: string; description: string; score: number }>;
}

export interface ExtractedRxNorm {
  text: string;
  score: number;
  concepts: Array<{ code: string; description: string; score: number }>;
}

export interface ExtractedSNOMED {
  text: string;
  score: number;
  concepts: Array<{ code: string; description: string; score: number }>;
}

export interface ComprehendResult {
  entities: ExtractedEntity[];
  icd10: ExtractedICD10[];
  rxnorm: ExtractedRxNorm[];
  snomed: ExtractedSNOMED[];
  charactersScanned: number;
  truncated: boolean;
}

const MAX_BYTES = 18000;

function shrink(text: string): string {
  if (Buffer.byteLength(text, 'utf8') <= MAX_BYTES) return text;
  const buf = Buffer.from(text, 'utf8').subarray(0, MAX_BYTES);
  return buf.toString('utf8');
}

function mapEntity(e: Entity): ExtractedEntity {
  return {
    text: e.Text ?? '',
    category: e.Category ?? '',
    type: e.Type ?? '',
    score: e.Score ?? 0,
    beginOffset: e.BeginOffset,
    endOffset: e.EndOffset,
    attributes: (e.Attributes ?? []).map((a) => ({
      type: a.Type ?? '',
      text: a.Text ?? '',
      score: a.Score,
    })),
  };
}

function mapIcd10(e: ICD10CMEntity): ExtractedICD10 {
  return {
    text: e.Text ?? '',
    score: e.Score ?? 0,
    concepts: (e.ICD10CMConcepts ?? []).slice(0, 3).map((c) => ({
      code: c.Code ?? '',
      description: c.Description ?? '',
      score: c.Score ?? 0,
    })),
  };
}

function mapRx(e: RxNormEntity): ExtractedRxNorm {
  return {
    text: e.Text ?? '',
    score: e.Score ?? 0,
    concepts: (e.RxNormConcepts ?? []).slice(0, 3).map((c) => ({
      code: c.Code ?? '',
      description: c.Description ?? '',
      score: c.Score ?? 0,
    })),
  };
}

function mapSnomed(e: SNOMEDCTEntity): ExtractedSNOMED {
  return {
    text: e.Text ?? '',
    score: e.Score ?? 0,
    concepts: (e.SNOMEDCTConcepts ?? []).slice(0, 3).map((c) => ({
      code: c.Code ?? '',
      description: c.Description ?? '',
      score: c.Score ?? 0,
    })),
  };
}

export async function analyseClinicalText(
  text: string,
): Promise<ComprehendResult> {
  const client = comprehendClient();
  const trimmed = shrink(text);
  const truncated = Buffer.byteLength(text, 'utf8') > Buffer.byteLength(trimmed, 'utf8');

  const [entRes, icdRes, rxRes, snomedRes] = await Promise.all([
    client.send(new DetectEntitiesV2Command({ Text: trimmed })),
    client.send(new InferICD10CMCommand({ Text: trimmed })),
    client.send(new InferRxNormCommand({ Text: trimmed })),
    client.send(new InferSNOMEDCTCommand({ Text: trimmed })),
  ]);

  return {
    entities: (entRes.Entities ?? []).map(mapEntity),
    icd10: (icdRes.Entities ?? []).map(mapIcd10),
    rxnorm: (rxRes.Entities ?? []).map(mapRx),
    snomed: (snomedRes.Entities ?? []).map(mapSnomed),
    charactersScanned: trimmed.length,
    truncated,
  };
}

export function comprehendConfigured() {
  if (process.env.ENABLE_COMPREHEND_MEDICAL === 'false') return false;
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return true;
  }
  return Boolean(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
      process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI,
  );
}
