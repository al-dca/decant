import { pathToFileURL } from 'node:url';

// Decant's stateless Streamable HTTP endpoint. Node.js 20+, no npm dependencies.
// This calls a read-only conversion operation; it never submits a commercial request.
export async function convertPublicDocument(url, sheet, fetcher = fetch) {
  const source = new URL(url);
  if (!['https:', 'http:'].includes(source.protocol)) throw new Error('Supply a public HTTP(S) file URL.');
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
  const result = await rpc('tools/call', { name: 'convert_document', arguments: { url: source.href, ...(sheet ? { sheet } : {}) } });
  return JSON.parse(result.content.find((c) => c.type === 'text').text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) { console.error('Usage: node examples/convert-document.mjs <public-file-url> [sheet-name]'); process.exitCode = 2; }
  else try { console.log(JSON.stringify(await convertPublicDocument(process.argv[2], process.argv[3]), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
