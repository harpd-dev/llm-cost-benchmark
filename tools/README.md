# Tools

Runnable tools maintained by Harpd that consume or produce the datasets in
this repository (and the live [harpd.com/data](https://harpd.com/data/)
endpoints).

## In this repository

- **[`runner/`](../runner/)** — the benchmark runner. Runs every model in the
  benchmark against the task corpus and writes fresh `data/*.json` +
  `data/*.csv`. See [`METHODOLOGY.md`](../METHODOLOGY.md#reproducibility).

## Elsewhere in the harpd-dev org

| Repo | What it does |
|---|---|
| [observe](https://github.com/harpd-dev/observe) | x402 V2 observability + budget-control SDK for agent payments. |
| [observe-py](https://github.com/harpd-dev/observe-py) | Python port of `observe`. |
| [agent-budget-policy](https://github.com/harpd-dev/agent-budget-policy) | Local, synchronous budget-control SDK — declare caps, evaluate before payment. |
| [agent-transaction-audit-schema](https://github.com/harpd-dev/agent-transaction-audit-schema) | Canonical protocol-agnostic audit record for agent payments. |
| [x402-logging-middleware](https://github.com/harpd-dev/x402-logging-middleware) | Drop-in x402 payment logging middleware for Node HTTP/Express. |
| [mcp-paid-tool-starter](https://github.com/harpd-dev/mcp-paid-tool-starter) | Starter SDK for paid MCP tools (definePaidTool / enforcePayment). |
| [agent-market](https://github.com/harpd-dev/agent-market) | Build paid APIs that AI agents discover and buy via x402 on Base. |
| [cost-per-successful-task](https://github.com/harpd-dev/cost-per-successful-task) | The headline metric used across these benchmarks. |
| [model-replacement-benchmark](https://github.com/harpd-dev/model-replacement-benchmark) | Decide whether a cheaper model can safely replace yours. |
| [ai-agent-cost-calculator](https://github.com/harpd-dev/ai-agent-cost-calculator) | Estimate an autonomous agent's monthly bill per model. |

Full catalog of public datasets: <https://harpd.com/data/> — field meanings in
[`DATA_DICTIONARY.md`](../DATA_DICTIONARY.md).
