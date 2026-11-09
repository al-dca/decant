<!-- forevenza-managed-integration/1 -->
# Decant

Decant is a hosted MCP server and HTTP API that converts CSV and XLSX into JSON rows under each sheet's headers, and text PDFs into numbered page text. Send file bytes or a public URL without an account or API key. Files up to 5 MB are processed in memory and not stored. Conversion is free within a shared daily allowance; no OCR or arbitrary schema extraction. Decant also reads public web pages into title, headings, text, links and JSON-LD, honouring robots.txt, and takes specifications for datasets to buy or license.

Operated by Forevenza.

- [Canonical website](https://decant.forevenza.com/)
- [Current OpenAPI description](https://decant.forevenza.com/openapi.json)
- MCP endpoint: https://decant.forevenza.com/mcp
- Business contact: hello@decant.forevenza.com

## Convert a supplier file into usable rows

Use Decant when a program needs spreadsheet rows or text PDF pages as JSON without installing a converter. CSV and XLSX return sheet names, headers, rows, row counts and truncation flags; a text PDF returns page numbers and page text. A conversion does not place an order or create a sourcing request.

1. Connect the MCP endpoint below and inspect tools/list for convert\_document and its current input schema before sending a file.
2. For a public file, call convert\_document with url. For a private local file, supply file\_base64 instead, with optional filename and XLSX sheet; use exactly one input. Run node examples/convert-document.mjs --file supplier-prices.xlsx to send local bytes without publishing a URL. Raw HTTP upload remains available.
3. Run node examples/convert-document.mjs --self-test to convert the included synthetic supplier-price CSV and compare every field against the expected JSON. It checks numeric values, leading-zero part codes, a quoted comma and complete row delivery; the fixture is not a real offer or customer record.
4. Inspect the returned truncation fields before relying on completeness. Keep PDF page boundaries when passing text to the next step; PDF tables are not returned as cell grids.

- Files up to 5 MB; up to 20,000 spreadsheet rows per sheet. Free within a shared daily allowance; availability is not guaranteed.
- Files are processed in memory and are not stored. Remote processing sends the content to Decant; it is not local-only processing.
- No OCR, PDF table grids or arbitrary schema-based field extraction. Public URL fetching honours robots.txt and refuses private-network addresses.

- [Conversion guide and private-file upload](CONVERSION.md)
- [Executable conversion and self-test](examples/convert-document.mjs)
- [Synthetic supplier-price input](examples/synthetic-supplier-prices.csv)
- [Exact expected JSON output](examples/synthetic-supplier-prices.expected.json)

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
