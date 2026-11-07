// forevenza-managed-integration/1: live schema discovery only; no tools/call or commercial request.
import { pathToFileURL } from 'node:url';
export async function discoverTools(fetcher = fetch) {
  const endpoint = "https://decant.forevenza.com/mcp";
  let id = 0; let session; let protocol = '2025-11-25';
  const rpc = async (method, params, notification = false) => {
    const response = await fetcher(endpoint, {
      method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': protocol, ...(session ? { 'mcp-session-id': session } : {}) },
      body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id: ++id }), method, params }), signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error('MCP discovery HTTP ' + response.status);
    session = response.headers.get('mcp-session-id') ?? session;
    if (notification) return;
    const message = await response.json();
    if (message.error) throw new Error(message.error.message ?? 'MCP discovery failed');
    if (!message.result || typeof message.result !== 'object') throw new Error('Malformed MCP discovery result');
    return message.result;
  };
  const initialized = await rpc('initialize', { protocolVersion: protocol, capabilities: {}, clientInfo: { name: "decant-discovery-example", version: '1.0.0' } });
  if (typeof initialized.protocolVersion === 'string') protocol = initialized.protocolVersion;
  await rpc('notifications/initialized', {}, true);
  const tools = []; const cursors = new Set(); let cursor;
  for (let page = 0; page < 10; page++) {
    const result = await rpc('tools/list', cursor ? { cursor } : {});
    if (!Array.isArray(result.tools) || result.tools.some((t) => !t || typeof t.name !== 'string' || !t.inputSchema)) throw new Error('Malformed tools/list result');
    tools.push(...result.tools);
    if (!result.nextCursor) return tools;
    if (typeof result.nextCursor !== 'string' || cursors.has(result.nextCursor)) throw new Error('Invalid tools/list cursor');
    cursors.add(result.nextCursor); cursor = result.nextCursor;
  }
  throw new Error('tools/list pagination limit reached; discovery incomplete');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await discoverTools(), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
