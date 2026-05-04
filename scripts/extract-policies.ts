/**
 * extract-policies.ts
 *
 * Pulls text out of the key payer PDFs we cite in the demo and writes
 * them as Markdown bundles under data/policies/. These bundles are
 * loaded into the Bedrock prompt context for the appeal-letter and
 * denial-classification agents.
 *
 * Usage: npm run extract-policies
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
// pdf-parse top-level entry runs a debug script when imported directly.
// Use the underlying parser implementation to avoid that.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse/lib/pdf-parse.js') as (
  data: Buffer,
) => Promise<{ text: string; numpages: number }>;

interface Source {
  slug: string;
  title: string;
  citation: string;
  path: string;
}

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs', 'payer_docs');
const OUT = path.join(ROOT, 'data', 'policies');

const sources: Source[] = [
  {
    slug: 'aetna-pemetrexed',
    title: 'Aetna · Pemetrexed Products — Medical Clinical Policy Bulletin',
    citation: 'Aetna CPB Pemetrexed §III',
    path: path.join(DOCS, 'aetna', 'Pemetrexed Products - Medical Clinical Policy Bulletins _ Aetna.pdf'),
  },
  {
    slug: 'um-mp353-keytruda',
    title: 'UM-MP353 · Keytruda (pembrolizumab)',
    citation: 'UM-MP353 Keytruda Policy',
    path: path.join(DOCS, 'um_policies', 'UM-MP353-Keytruda-pembrolizumab-1.pdf'),
  },
  {
    slug: 'healthfirst-pa-list',
    title: 'Healthfirst · Prior Authorization Code List (2026-03-27)',
    citation: 'Healthfirst PA Code List 2026-03',
    path: path.join(DOCS, 'healthfirst', 'Healthfirst-Prior-Authorization-Code-List_2026-03-27-172616_yyhh.pdf'),
  },
  {
    slug: 'healthfirst-clinical-guidelines',
    title: 'Healthfirst · Clinical Guidelines Quick-Reference',
    citation: 'Healthfirst Clinical Guidelines (1690-23-qrg)',
    path: path.join(DOCS, 'healthfirst', '1690-23-qrg-healthfirst-clinical-guidelines-r2-wr_fETX.pdf'),
  },
  {
    slug: 'mod25-em-policy',
    title: 'EM Preventive Modifier 25 — Payment Policy',
    citation: 'Modifier 25 Payment Policy',
    path: path.join(DOCS, 'payment_policies', 'EM-Preventive-Modifier-25-Policy-Final.pdf'),
  },
  {
    slug: 'tvus-payment-policy',
    title: 'Transabdominal / Transvaginal Ultrasound — Payment Policy',
    citation: 'TVUS Payment Policy v2',
    path: path.join(DOCS, 'payment_policies', 'Transabdominal-Transvaginal-Ultrasound-Payment-Policy-PDF-v2-ss2.pdf'),
  },
];

function clean(text: string) {
  return text
    .replace(/\f/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
    .trim();
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const index: Array<{ slug: string; title: string; citation: string; pages: number; chars: number; sourcePdf: string }> = [];

  for (const src of sources) {
    try {
      const buf = await fs.readFile(src.path);
      const parsed = await pdf(buf);
      const md = `# ${src.title}\n\n> Citation: ${src.citation}\n> Source: \`${path.relative(ROOT, src.path)}\`\n> Pages: ${parsed.numpages}\n\n${clean(parsed.text)}\n`;
      const outPath = path.join(OUT, `${src.slug}.md`);
      await fs.writeFile(outPath, md, 'utf8');
      console.log(`✓ ${src.slug} — ${parsed.numpages} pages, ${md.length.toLocaleString()} chars`);
      index.push({
        slug: src.slug,
        title: src.title,
        citation: src.citation,
        pages: parsed.numpages,
        chars: md.length,
        sourcePdf: path.relative(ROOT, src.path),
      });
    } catch (err) {
      console.error(`✗ ${src.slug} — ${(err as Error).message}`);
    }
  }

  await fs.writeFile(
    path.join(OUT, 'index.json'),
    JSON.stringify(index, null, 2),
    'utf8',
  );
  console.log(`\nWrote ${index.length} bundles → ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
