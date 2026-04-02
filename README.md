# mcp-disease

MCP server for COVID-19 statistics via [disease.sh](https://disease.sh). No authentication required.

## Tools

| Tool | Description |
|------|-------------|
| `get_global_stats` | Get global COVID-19 statistics |
| `get_country_stats` | Get COVID-19 stats for a specific country |
| `get_historical` | Get historical case/death/recovery timeline |
| `get_vaccine_stats` | Get vaccination coverage timeline |

## Quickstart via Pipeworx Gateway

Call any tool through the hosted gateway with zero setup:

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "disease_get_global_stats",
      "arguments": {}
    }
  }'
```

## License

MIT
