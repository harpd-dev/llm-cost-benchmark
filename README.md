# llm-cost-benchmark

Public, reproducible LLM cost benchmarks from [Harpd](https://harpd.com). The headline metric is **cost per successful task** — not per-call price, not per-token cost — because that is the number production systems actually pay against.

## First benchmark: JSON extraction (100 tasks)

Structured JSON extraction from messy natural-language input (English + Japanese + Chinese). 8 models, 100 real tasks, temperature 0.

| Model | Success | $ / task | $ / successful task |
|-------|--------:|---------:|---------------------:|
| gpt-4o-mini | 88% | $0.00096 | $0.001091 |
| deepseek-v3 | 91% | $0.00174 | $0.001912 |
| gemini-2.5-flash | 90% | $0.00270 | $0.003000 |
| llama-3.1-70b | 84% | $0.00405 | $0.004819 |
| claude-haiku-4 | 93% | $0.00560 | $0.006022 |
| gemini-2.5-pro | 95% | $0.01100 | $0.011579 |
| gpt-4.1 | 96% | $0.01280 | $0.013333 |
| claude-sonnet-4 | 97% | $0.02100 | $0.021649 |

> The numbers above are a **methodology preview** (modeled from public 2026 list prices + assumed success/latency). Replace them with live runs:

```bash
cp runner/.env.example runner/.env   # add OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY, TOGETHER_API_KEY
node runner/index.mjs
```

The runner writes fresh `data/*.json` and `data/*.csv`. Everything is reproducible on a clean machine.

## Repository layout

```
data/          benchmark results (JSON + CSV, one file per run)
pricing/       list-price snapshot the benchmark cost math used
runner/        open-source benchmark runner (live runs overwrite data/)
scripts/       analysis helpers
DATA_DICTIONARY.md   field-level definitions for every dataset
METHODOLOGY.md       collection, validation, execution, scoring, limitations, update frequency, reproduction
```

## Website ↔ data

This repository and harpd.com mirror each other:

- **Harpd Research** (human-readable hub): <https://harpd.com/research/>
- **Methodology** (the four documented methods): <https://harpd.com/methodology/> · benchmark method: <https://harpd.com/methodology/benchmarks/>
- **Benchmark page** (status + modeled-preview table): <https://harpd.com/benchmarks/>
- **Live datasets**: benchmark — <https://harpd.com/data/benchmarks.json> / [.csv](https://harpd.com/data/benchmarks.csv) · pricing — <https://harpd.com/data/llm-pricing.json> / [.csv](https://harpd.com/data/llm-pricing.csv) · all endpoints — <https://harpd.com/data/>
- **Evidence register** (claim → data → method → updated): <https://harpd.com/evidence/>

The GitHub repo is the source of truth for raw benchmark artifacts and the runner; harpd.com serves the live machine-readable exports and the human-readable summaries. Every last-updated date on the site comes from the data itself (`generatedAt` / `verified_at`), never from a build.

## Why we publish the data

The cheapest model that *succeeds on your real tasks* is the only model that matters. Publishing raw CSV/JSON is the only way the community can verify that claim — and the only way [Harpd ModelSwitch](https://harpd.com/modelswitch) can earn the authority it needs.

## License

MIT.

---

## About Harpd

[Harpd](https://harpd.com) is the AI Cost Intelligence platform for the agent era — measure, optimize and control production AI spend, from **[cost per successful task](https://harpd.com/cost-per-successful-task/)** to agent-payment budgets ([x402](https://github.com/harpd-dev/observe) / USDC).

- Website: <https://harpd.com>
- GitHub org: <https://github.com/harpd-dev>
- Contact: <mailto:harpdsupport@gmail.com>

