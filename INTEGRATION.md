<!-- forevenza-managed-integration/1 -->
# Decant

Decant converts a CSV or XLSX file into JSON rows under each sheet's header row, or a text PDF into its text page by page, from an upload of up to 5 MB or a public link, without storing the file; it reads one public web page into its title, headings, readable text, links and JSON-LD, honouring robots.txt; and it takes specifications for datasets to buy or license. Conversion and page reading are free within a daily allowance.

Operated by Forevenza.

- [Canonical website](https://decant.forevenza.com/)
- [Current OpenAPI description](https://decant.forevenza.com/openapi.json)
- MCP endpoint: https://decant.forevenza.com/mcp
- Business contact: hello@decant.forevenza.com

## Connect an MCP client

Use the remote Streamable HTTP endpoint in an MCP client that supports it. Clients that use a mcpServers configuration can start with:

```json
{
  "mcpServers": {
    "decant": {
      "type": "http",
      "url": "https://decant.forevenza.com/mcp"
    }
  }
}
```

Inspect the live tools before choosing an operation:

```sh
node examples/discover-mcp.mjs
```

This Node.js 20+ example initializes the connection and reads every page of tools/list. It prints each current tool's description, input schema and action annotations; it never invokes a tool or submits a customer request. If discovery fails, it reports an error rather than implying the operation is available. Review the operation's inputs and terms before calling it.

## Discover the current HTTP interface

The published OpenAPI description is the source of truth for HTTP operations, inputs and any authentication requirements. This repository contains integration documentation and client examples, not the server implementation. It does not promise that every operation is free or that a service request has been accepted. Follow the service's current terms before sending business information or creating a request.

```sh
curl --fail --silent --show-error 'https://decant.forevenza.com/openapi.json'
```

Run `node examples/discover.mjs` with Node.js 20 or later to list the current documented HTTP operations. It only reads the public specification and does not submit a customer request.
