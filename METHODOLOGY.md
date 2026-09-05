# Methodology

How Harpd produces the public benchmark and pricing data in this repository,
and the live `/data/*` endpoints at [harpd.com/data](https://harpd.com/data/).

Sections: [Task](#task) · [Data collection](#data-collection) ·
[Validation](#validation) · [Benchmark execution](#benchmark-execution) ·
[Scoring](#scoring) · [Limitations](#limitations) ·
[Update frequency](#update-frequency) · [Reproducibility](#reproducibility) ·
[Pricing source](#pricing-source) · [Running live](#running-live)

## Task

Structured JSON extraction from messy natural-language input (en + ja + zh). Each task provides a free-text prompt and an expected JSON key set. A response scores as *success* when the parsed JSON contains all expected keys with value types that match.

## Data collection

- **Real tasks only.** Tasks are sourced from real Harpd production traces, community submissions (GitHub issue, `benchmark-task` label, reviewed for license clarity and duplication), or partner-licensed corpora. No LLM-generated prompts in the test set — those measure how well a model imitates other LLMs, not how it handles your work.
- **Pricing data** is collected from official provider pricing pages only (every record carries the source URL). Third-party price aggregators are never a source.
- **Rank data** (harpd.com) is first-party: one record per approved listing on the Harpd Rank board, exported field-by-field through a whitelist.

## Validation

- **Prices**: every record is checked against its official provider page; the check date is stamped per record (`verified_at` / `last_updated`). Unknown or unpublished prices are marked as such — never guessed.
- **Benchmark tasks**: submissions are deduplicated and license-checked before inclusion. Expected outputs are reviewed so "success" is decidable, not a matter of taste.
- **Outputs**: raw responses and judge outputs are kept in the data; aggregates are computed from them, and outliers are kept, not dropped.

## Benchmark execution

1. **Same prompt, same seed.** Every model gets the identical prompt and task instance. Temperature 0 for code/JSON tasks, 0.2 for generation, deterministic seeds. Re-runs reproducible via the published JSON config.
2. **Multiple runs.** Every model runs 3× per non-deterministic task; reported = median; outliers kept in data, not dropped.
3. **Hosted inference at list price** via the public API. Open-weight models are tested via a public host (Together / Fireworks / OpenRouter); self-hosted economics are a separate methodology and are not mixed into these numbers.
4. **No vendor sponsorship.** Benchmarks are not sponsored. List price via public API. Any promotional credit disclosed here.
5. **Open data.** Tasks, prompts, raw responses, judge outputs ship as CSV + JSON.

## Scoring

- **Success** (JSON extraction): exact-match on the parsed JSON tree (whitespace-insensitive) — all expected keys present with matching value types. Other benchmarks: agentic tool use = did the model call the expected tool with the expected arguments; summarization = a separate judge model grades against a 4-criterion rubric.
- **Headline metric**: `cost_per_successful_task = cost_per_task / success_rate`. A model that is cheap per call but fails often can cost more per outcome that actually ships.
- **Also reported**: success rate, p50/p95 latency, average input/output tokens, cost per task.

## Limitations

- The current published dataset is a **MODELED ESTIMATE** (`isModeled: true`): prices are public 2026 list prices; success/latency are assumed from published 2025–2026 behavior. Do not cite it as a measured result. Live runs replace it (see [Running live](#running-live)).
- List price is not your price: caching, batching, free tiers and enterprise rates can change the math 2–10×.
- One benchmark ≠ general capability. Results apply to the task type tested and the models/providers listed, at the time of the run.
- Hosted resale prices for open-weight models embed the host's margin; self-hosted costs differ.
- Provider pricing changes often; a price is only guaranteed as of its `verified_at` date.

## Update frequency

- **Pricing**: re-verified when a provider announces a change or at least monthly; the date of the last verification is in every record and in the file envelope (`last_updated`).
- **Benchmarks**: re-run when the task corpus or model list changes materially, and when the first live run replaces the modeled preview. Each run's `generatedAt` is the dataset's canonical last-updated date.
- **Update discipline**: dates are data-derived. A rebuild or redeploy never moves a last-updated date — only an actual data change does.

## Reproducibility

What you need to replay a benchmark end-to-end:

| Component | Where |
|---|---|
| Dataset (tasks + expected outputs) | `data/*.json` — the `taskCount`, task definition and expected key sets used |
| Test definition | `METHODOLOGY.md` (this file) + the benchmark page [harpd.com/benchmarks](https://harpd.com/benchmarks/) |
| Evaluation method | Success definitions under [Scoring](#scoring); implemented in `runner/index.mjs` |
| Expected output format | `data/*.json` (per-model results) and `data/*.csv` (per-model rows) — the runner overwrites these in place |
| Prices used | `pricing/llm-pricing.json` — the exact list-price snapshot the cost math consumed |

Run:

```bash
cp runner/.env.example runner/.env   # provider keys (models without a key are skipped)
node runner/index.mjs
```

**Current limitation on reproducibility**: the published numbers are modeled, so a "reproduction" today re-generates the estimate from `pricing/llm-pricing.json` plus the documented assumptions; a true reproduction requires the live run with provider keys. The modeled assumptions are listed explicitly in each file's `methodologyNote` rather than hidden in code.

## Pricing source

Public 2026 list prices (USD / 1M tokens), from official provider pricing pages — snapshot in [`pricing/llm-pricing.json`](pricing/llm-pricing.json), live copy at <https://harpd.com/data/llm-pricing.json>.

## Running live

```bash
node runner/index.mjs
```

Requires provider keys in env (see `runner/.env.example`). Models without a key are skipped. Output overwrites `data/*.json` + `data/*.csv`.
