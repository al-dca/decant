# Convert a supplier file into usable data

[Decant](https://decant.forevenza.com/) turns CSV and XLSX files into JSON rows and text PDFs into text per page. Conversion is free within a daily allowance. Files are processed in memory and are not stored.

An agent can connect to `https://decant.forevenza.com/mcp`, inspect `tools/list`, and call `convert_document` with either `file_base64` (an uploaded file encoded as standard padded base64) or `url` (a public file URL), and an optional XLSX `sheet` name. Use exactly one input. Local files need not be published; the bytes are sent to Decant for processing. The response retains sheet names and headers, or PDF page numbers. Check the returned truncation fields before relying on a complete result.

The dependency-free Node.js 20+ example initializes MCP, checks that the read-only tool is available, then converts the file:

```sh
node examples/convert-document.mjs --file ./supplier-prices.xlsx 'Prices'
# Or convert a file already hosted publicly:
node examples/convert-document.mjs 'https://example.org/supplier-prices.xlsx' 'Prices'
```

Try the included [synthetic supplier-price CSV](examples/synthetic-supplier-prices.csv), which contains two invented example rows and is not a supplier offer, customer record, or endorsement:

```sh
node examples/convert-document.mjs --self-test
node examples/convert-document.mjs --self-test-inline
```

Run this from the repository with its companion [expected JSON](examples/synthetic-supplier-prices.expected.json). `--self-test` fetches the public fixture through Decant MCP; `--self-test-inline` sends the local fixture bytes through the same tool. Each checks the entire result before printing it. The example checks that part codes `007` and `010` remain text, quantities and prices become numbers, the quoted comma stays in its description, and both rows are returned without truncation. A failed assertion or unavailable service exits with an error; it is not a successful conversion. This demonstration is a test, not customer demand.

Replace the example URL with a file you have permission to process. URL fetching honors robots.txt and refuses private-network addresses. It supports files up to 5 MB and up to 20,000 spreadsheet rows per sheet. PDF tables are page text, not cell grids; scanned PDFs require OCR that this operation does not provide.

The same conversion is also available as a direct HTTP upload:

```sh
curl --fail-with-body --silent --show-error \
  -H 'Content-Type: text/csv' \
  --data-binary @supplier-prices.csv \
  https://decant.forevenza.com/document-conversion/op/convert
```

For XLSX use `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; for PDF use `application/pdf`. Review the [current API specification](https://decant.forevenza.com/openapi.json) and [privacy notice](https://decant.forevenza.com/privacy/) before sending a file. The MCP inline upload uses `file_base64`, with an optional `filename` for format detection. Base64 is encoding, not encryption; transport uses HTTPS. Both the MCP inline call and HTTP command send bytes to Decant without making the file publicly accessible. An assistant needs access to the actual attachment bytes to use inline conversion; a local path alone is not an upload. Neither path performs arbitrary field extraction against a supplied schema. An HTTP or MCP conversion does not place an order or create a sourcing request.
