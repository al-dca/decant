# Convert a supplier file into usable data

[Decant](https://decant.forevenza.com/) turns CSV and XLSX files into JSON rows and text PDFs into text per page. Conversion is free within a daily allowance. Files are processed in memory and are not stored.

For a file already available at a public URL, an agent can connect to `https://decant.forevenza.com/mcp`, inspect `tools/list`, and call `convert_document` with `url` and an optional XLSX `sheet` name. The response retains sheet names and headers, or PDF page numbers. Check the returned truncation fields before relying on a complete result.

The dependency-free Node.js 20+ example initializes MCP, checks that the read-only tool is available, then converts the file:

```sh
node examples/convert-document.mjs 'https://example.org/supplier-prices.xlsx' 'Prices'
```

Replace the example URL with a file you have permission to process. The tool honors robots.txt and refuses private-network addresses. It supports files up to 5 MB and up to 20,000 spreadsheet rows per sheet. PDF tables are page text, not cell grids; scanned PDFs require OCR that this operation does not provide.

For a private file, use the direct upload instead of publishing it:

```sh
curl --fail-with-body --silent --show-error \
  -H 'Content-Type: text/csv' \
  --data-binary @supplier-prices.csv \
  https://decant.forevenza.com/document-conversion/op/convert
```

For XLSX use `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; for PDF use `application/pdf`. Review the [current API specification](https://decant.forevenza.com/openapi.json) and [privacy notice](https://decant.forevenza.com/privacy/) before sending a file. An HTTP or MCP conversion does not place an order or create a sourcing request.
