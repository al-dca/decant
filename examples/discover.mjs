// forevenza-managed-integration/1: public discovery only; no customer request is submitted.
const response = await fetch("https://decant.forevenza.com/openapi.json");
if (!response.ok) throw new Error('Specification request failed: ' + response.status);
const spec = await response.json();
console.log(spec.info?.title ?? "Decant");
for (const [path, methods] of Object.entries(spec.paths ?? {})) {
  for (const method of Object.keys(methods)) {
    if (['get','post','put','patch','delete','head','options'].includes(method)) console.log(method.toUpperCase(), path);
  }
}
