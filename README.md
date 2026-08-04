# mcp-disease

Disease MCP — wraps disease.sh API (COVID-19 statistics, no auth required)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_global_stats` | Check worldwide COVID-19 totals. Returns cumulative cases, deaths, recovered, active cases, plus today's new cases and deaths. |
| `get_country_stats` | Check COVID-19 stats for a specific country (e.g., "US", "India", "GB"). Returns cases, deaths, recovered, active cases, today's change, and population. |
| `get_historical` | Get daily COVID-19 timeline for a country or globally. Returns historical progression of cases, deaths, and recoveries by date. |
| `get_vaccine_stats` | Check COVID-19 vaccination progress for a country or globally. Returns cumulative doses administered daily over the past 30 days. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "disease": {
      "url": "https://gateway.pipeworx.io/disease/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Disease data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
