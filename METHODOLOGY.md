# Methodology

## Task

Structured JSON extraction from messy natural-language input (en + ja + zh). Each task provides a free-text prompt and an expected JSON key set. A response scores as *success* when the parsed JSON contains all expected keys with value types that match.

## Protocol

1. **Real tasks only.** No LLM-generated prompts in the test set — those measure how well a model imitates other LLMs, not how it handles your work.
2. **Same prompt, same seed.** Every model gets the identical prompt and task instance. Temperature 0 for JSON tasks; deterministic seeds. Re-runs reproducible via the published JSON config.
3. **Cost is primary.** We report `cost_per_successful_task = cost_per_task / success_rate` as the headline.
4. **Open data.** Tasks, prompts, raw responses, judge outputs ship as CSV + JSON.
5. **Multiple runs.** Every model runs 3× per non-deterministic task; reported = median; outliers kept in data, not dropped.
6. **No vendor sponsorship.** List price via public API. Any promotional credit disclosed here.

## Pricing source

Public 2026 list prices (USD / 1M tokens), mirrored from `harpd/marketing/src/lib/llm-pricing.ts`.

## Running live

```bash
node runner/index.mjs
```

Requires provider keys in env (see `runner/.env.example`). Models without a key are skipped. Output overwrites `data/*.json` + `data/*.csv`.
