// Analyze a benchmark JSON: rank models by cost per successful task.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const f = process.argv[2] || join(__dirname, '..', 'data', '2026-08-json-extraction.json')
const d = JSON.parse(readFileSync(f, 'utf8'))
console.log('Cost per successful task (cheapest first):')
for (const r of d.results) {
  console.log(`  ${r.model.padEnd(18)} $${r.costPerSuccessfulTask.toFixed(6)}  (success ${(r.successRate * 100).toFixed(0)}%)`)
}
