<!-- forevenza-managed-integration/1 -->
# Decant

Decant converts a CSV or XLSX file into JSON rows under each sheet's header row, or a text PDF into its text page by page, from an upload of up to 5 MB or a public link, without storing the file; it reads one public web page into its title, headings, readable text, links and JSON-LD, honouring robots.txt; and it takes specifications for datasets to buy or license. Conversion and page reading are free within a daily allowance.

Operated by Forevenza.

- [Canonical website](https://decant.forevenza.com/)
- [Current OpenAPI description](https://decant.forevenza.com/openapi.json)
- MCP endpoint: https://decant.forevenza.com/mcp
- Business contact: hello@decant.forevenza.com

## Discover the current interface

The published OpenAPI description is the source of truth for operations, inputs and any authentication requirements. This repository contains integration documentation; it does not promise that every operation is free or that a service request has been accepted. Follow the service's current terms before sending business information or creating a request.

```sh
curl --fail --silent --show-error 'https://decant.forevenza.com/openapi.json'
```

Run `node examples/discover.mjs` with Node.js 20 or later to list the current documented HTTP operations. It only reads the public specification and does not submit a customer request.
