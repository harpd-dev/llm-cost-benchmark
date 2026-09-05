# Data Dictionary

Field-level definitions for every dataset in this repository and the live
Harpd `/data/*` endpoints it mirrors. The goal: any developer can pick up any
file here and know exactly what each field means, where it came from, and when
it was last updated.

Conventions applied to **all** public Harpd datasets:

- Formats: JSON and CSV (same records, same order).
- Every dataset carries `source` (where the record comes from) and a
  data-derived `last_updated` timestamp — it moves only when the data
  actually changes, never on a rebuild.
- Records are whitelisted field-by-field. Internal fields, credentials,
  user data and unapproved listings are never exported.
- License: CC BY 4.0 (site datasets) / MIT (code in this repo).

---

## 1. Benchmark results — `data/*.json`, `data/*.csv`

One file per benchmark run (currently `2026-08-json-extraction`).
JSON = one result object per model; CSV = long format, one row per
(model × metric).

### File-level fields (JSON)

| Field | Meaning |
|---|---|
| `benchmark` | Stable benchmark id, e.g. `json-extraction-v1`. |
| `title` | Human-readable benchmark title. |
| `task` | What the models are asked to do. |
| `taskCount` | Number of tasks in the benchmark. |
| `generatedAt` | ISO-8601 timestamp of the run that produced this data. **The dataset's canonical last-updated date.** |
| `isModeled` | `true` when the numbers are a modeled estimate, not a live measured run. |
| `methodologyNote` | Honesty note — how the numbers were produced and how to replace them. |
| `pricingSource` | Where the per-token prices used for the cost math came from. |

### Per-model result fields (JSON) / metric rows (CSV)

| Field | Meaning |
|---|---|
| `model` | Model identifier under test (e.g. `claude-sonnet-4`). |
| `successRate` | Fraction of tasks scored as success (0–1). CSV metric name: `success_rate`, unit `ratio`. |
| `p50LatencyMs` / `p95LatencyMs` | Median / 95th-percent end-to-end latency in milliseconds. CSV metric names: `p50_latency_ms`, `p95_latency_ms`, unit `ms`. |
| `avgInputTokens` / `avgOutputTokens` | Mean tokens per task. CSV metric names: `avg_input_tokens`, `avg_output_tokens`, unit `tokens`. |
| `costPerTask` | USD cost of one average task at the prices in `pricingSource`. CSV metric: `cost_per_task`, unit `usd`. |
| `costPerSuccessfulTask` | `costPerTask / successRate` — the headline metric: what one *successful* outcome costs. CSV metric: `cost_per_successful_task`, unit `usd`. |

### Wide-format CSV (`data/*.csv`)

One row per model, same fields as the JSON result objects:
`model,successRate,p50LatencyMs,p95LatencyMs,avgInputTokens,avgOutputTokens,costPerTask,costPerSuccessfulTask`.

### Long-format CSV (site export, `/data/benchmarks.csv` on harpd.com)

The harpd.com endpoint <https://harpd.com/data/benchmarks.csv> normalizes the
same data to one row per (model × metric):

| Field | Meaning |
|---|---|
| `id` | Stable record id: `<benchmark>--<model>--<metric>`. |
| `name` | Benchmark title. |
| `model` | Model identifier under test. |
| `task` | What the models are asked to do. |
| `metric` | One of: `success_rate`, `p50_latency_ms`, `p95_latency_ms`, `avg_input_tokens`, `avg_output_tokens`, `cost_per_task`, `cost_per_successful_task`. |
| `score` | Value of the metric for that model. |
| `cost` | Same as `score` when the metric is a cost metric (`usd`), `null` otherwise. |
| `unit` | `ratio` \| `ms` \| `tokens` \| `usd`. |
| `timestamp` | ISO-8601 timestamp of the run that produced the value. |
| `source` | Origin of the record (the benchmark id). |
| `last_updated` | Data-derived date — moves only when the benchmark data changes. |

---

## 2. Model pricing snapshot — `pricing/llm-pricing.json`, `pricing/llm-pricing.csv`

Snapshot of the list prices used by the benchmark cost math. The **live
canonical copy** is served at <https://harpd.com/data/llm-pricing.json>
(+: `.csv`); this snapshot exists so every historical benchmark run stays
reproducible against the exact prices it used.

| Field | Meaning |
|---|---|
| `id` | Stable model id (primary key of the record). |
| `name` | Model display name as shown on harpd.com. |
| `provider` | Billing / API provider (e.g. `Anthropic`, `OpenAI`). |
| `model` | Same as `name` (kept for backward compatibility). |
| `input_per_million` | USD per 1,000,000 input tokens (list price). |
| `cached_input_per_million` | USD per 1M cached-input tokens, when published; `null` otherwise. |
| `output_per_million` | USD per 1,000,000 output tokens (list price). |
| `batch_discount` | Fraction off list for batch APIs (0.5 = 50% off); `null` if none. |
| `context_window` | Approximate context window in tokens; display-only. |
| `status` | Lifecycle status, e.g. `available`, `deprecated`. |
| `effective_at` | ISO date the listed price took effect. |
| `verified_at` / `last_updated` | ISO date (YYYY-MM-DD) the price was last confirmed against `source`. Both fields carry the same value; `last_updated` is the canonical name going forward. |
| `source` | URL of the official provider pricing page the price was verified against. |
| `note` | Free-form caveat (intro pricing windows, peak/off-peak, resale, etc.). |

File-level: `updated_at` / `last_updated` = the most recent verification date
across all records; `methodology` = <https://harpd.com/methodology/model-pricing/>.

---

## 3. Live Harpd `/data/*` endpoints

The ranking datasets are served live from harpd.com (documented at
<https://harpd.com/data/> with a machine-readable schema at
`/data/schema.json`). Summary of the shared contract:

| Field (rank records) | Meaning |
|---|---|
| `id` | Stable record id — equal to `slug`. |
| `name` | Product display name. |
| `slug` | Stable URL slug used in profile URLs. |
| `url` | Canonical Harpd product profile URL. |
| `category` / `categoryName` | Category slug and display name. |
| `rank` | Current position on the overall board. |
| `rankPoints` | Permanent Rank Points (1 completed Credit spend = 1 Rank Point). Promotional placement, not an editorial recommendation. |
| `verified` | `true` when Harpd verified the listing. |
| `updatedAt` | Last public update timestamp of the record. |

Envelope: `schemaVersion`, `generatedAt` (serialization time), `lastUpdated`
(most recent record-level data change), `source`, `methodology`, `license`,
`count`.

### Generic field meanings (applies across datasets)

| Field | Meaning |
|---|---|
| `name` | Display name of the thing the record describes (product, model, benchmark). |
| `provider` | The company that bills for the model (pricing datasets). |
| `price` | USD list price, always with an explicit unit (per 1M tokens). |
| `score` | Value of a metric for a benchmark record; unit is always adjacent. |
| `metric` | Which measurement the score represents. |
| `source` | Where the record came from — an official provider page URL, a benchmark run id, or "Harpd Rank". |
| `timestamp` / `last_updated` | When this data was produced or last verified. Data-derived only. |
