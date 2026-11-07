import { pathToFileURL } from 'node:url';
import { readFile, stat } from 'node:fs/promises';
import { basename } from 'node:path';
import assert from 'node:assert/strict';

// Decant's stateless Streamable HTTP endpoint. Node.js 20+, no npm dependencies.
// This calls a read-only conversion operation; it never submits a commercial request.
export async function convertDocument(input, fetcher = fetch) {
  const endpoint = 'https://decant.forevenza.com/mcp';
  let id = 0;
  const rpc = async (method, params) => {
    const response = await fetcher(endpoint, {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': '2025-11-25' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }), signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Decant returned HTTP ${response.status}`);
    const message = await response.json();
    if (message.error) throw new Error(message.error.message ?? 'MCP request failed');
    if (message.result?.isError) throw new Error(message.result.content?.map((c) => c.text ?? '').join('\n') ?? 'Conversion refused');
    return message.result;
  };
  await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'decant-conversion-example', version: '1.0.0' } });
  const discovery = await rpc('tools/list', {});
  const tool = discovery.tools?.find((t) => t.name === 'convert_document');
  if (!tool || tool.annotations?.readOnlyHint !== true) throw new Error('Read-only document conversion is not currently available.');
  const result = await rpc('tools/call', { name: 'convert_document', arguments: input });
  return JSON.parse(result.content.find((c) => c.type === 'text').text);
}

export async function convertPublicDocument(url, sheet, fetcher = fetch) {
  const source = new URL(url);
  if (!['https:', 'http:'].includes(source.protocol)) throw new Error('Supply a public HTTP(S) file URL.');
  return convertDocument({url:source.href,...(sheet ? {sheet} : {})},fetcher);
}

// The file is sent to Decant for processing; it need not be publicly hosted.
export async function convertLocalDocument(path, sheet, fetcher = fetch) {
  const info = await stat(path);
  if (!info.isFile() || info.size > 5 * 1024 * 1024) throw new Error('Supply a regular file up to 5 MB.');
  const bytes = await readFile(path);
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error('Supply a nonempty file up to 5 MB.');
  return convertDocument({file_base64:bytes.toString('base64'),filename:basename(path instanceof URL ? path.pathname : path),...(sheet ? {sheet} : {})},fetcher);
}

// The fixture is illustrative synthetic data, never a supplier offer or customer record.
export async function selfTest(fetcher = fetch, inline = false) {
  const url = 'https://raw.githubusercontent.com/al-dca/decant/main/examples/synthetic-supplier-prices.csv';
  const expected = JSON.parse(await readFile(new URL('./synthetic-supplier-prices.expected.json', import.meta.url), 'utf8'));
  const result = inline
    ? await convertLocalDocument(new URL('./synthetic-supplier-prices.csv', import.meta.url), undefined, fetcher)
    : await convertPublicDocument(url, undefined, fetcher);
  assert.deepEqual(result, expected, 'Conversion differs from the documented synthetic fixture: inspect before relying on it.');
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) { console.error('Usage: node examples/convert-document.mjs <public-file-url> [sheet-name] | --file <local-file> [sheet-name] | --self-test | --self-test-inline'); process.exitCode = 2; }
  else try { console.log(JSON.stringify(process.argv[2] === '--self-test' ? await selfTest() : process.argv[2] === '--self-test-inline' ? await selfTest(fetch, true) : process.argv[2] === '--file' ? await convertLocalDocument(process.argv[3], process.argv[4]) : await convertPublicDocument(process.argv[2], process.argv[3]), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
