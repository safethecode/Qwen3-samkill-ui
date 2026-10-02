import { readFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { repair } from './repair.mjs';

if (process.argv.length < 5) throw new Error('Usage: node scripts/refine.mjs TARGET REVIEW_JSON EVIDENCE_DIR');
const target = resolve(process.argv[2]);
const review = JSON.parse(await readFile(resolve(process.argv[3]), 'utf8'));
if (review.name !== 'visual-review' || review.status !== 'FAIL' || !review.detail) throw new Error('Review must describe an observed visual-review failure');
const evidence = resolve(process.argv[4]);
await mkdir(dirname(evidence), { recursive: true });
await mkdir(evidence);
await repair(target, evidence, review);
console.log('Visual repair applied. Run the fixture evaluator and inspect fresh screenshots before approval.');
