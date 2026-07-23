/**
 * extract-bh-policies.ts
 *
 * Pulls text from Behavioral Health policy PDFs and writes Markdown bundles
 * under data/policies/ for appeal-letter and voice agent context.
 *
 * Usage: npm run extract-bh-policies
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
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
const DOCS = path.join(ROOT, 'docs', 'payer_docs', 'behavioral_health');
const OUT = path.join(ROOT, 'data', 'policies');

const sources: Source[] = [
  {
    slug: 'bh-asam-loc',
    title: 'ASAM Criteria · Level of Care Assessment Guide',
    citation: 'ASAM LOC Assessment Guide v4.1',
    path: path.join(DOCS, 'asam_loc-assessment-guide_print_4.1.0.0.pdf'),
  },
  {
    slug: 'bh-locus-guide',
    title: 'LOCUS · Level of Care Utilization System Guide',
    citation: 'LOCUS Utilization System Guide',
    path: path.join(DOCS, 'level-of-care-utilization-system-guide.pdf'),
  },
  {
    slug: 'bh-locus-handout',
    title: 'LOCUS · Levels of Care Handout (AACP)',
    citation: 'LOCUS Levels of Care Handout',
    path: path.join(DOCS, 'locus-levels-care-handout-aacp.pdf'),
  },
  {
    slug: 'bh-medical-necessity',
    title: 'Behavioral Health · Medical Necessity Criteria',
    citation: 'BH Medical Necessity Criteria',
    path: path.join(DOCS, 'Medical Necessity Criteria.pdf'),
  },
  {
    slug: 'bh-tn-acute-inpatient',
    title: 'TN BH Guide · Acute Inpatient Hospital',
    citation: 'TN-BH-Guide Acute Inpatient Hospital',
    path: path.join(DOCS, 'TN-BH-Guide-Acute-Inpatient-Hospital.pdf'),
  },
  {
    slug: 'bh-fs121115',
    title: 'Behavioral Health · Facility Services Policy',
    citation: 'BehavioralHealthFS121115',
    path: path.join(DOCS, 'BehavioralHealthFS121115.pdf'),
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
  const indexPath = path.join(OUT, 'index.json');
  let index: Array<{
    slug: string;
    title: string;
    citation: string;
    pages: number;
    chars: number;
    sourcePdf: string;
  }> = [];

  try {
    const raw = await fs.readFile(indexPath, 'utf8');
    index = JSON.parse(raw) as typeof index;
    index = index.filter((e) => !e.slug.startsWith('bh-'));
  } catch {
    /* fresh index */
  }

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

  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log(`\nWrote ${sources.length} BH bundles → ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
