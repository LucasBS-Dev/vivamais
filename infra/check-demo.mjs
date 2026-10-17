// Checagem operacional explícita antes de uma demo. Não é keepalive agendado.
const [api, web] = process.argv.slice(2);
if (!api || !web) { console.error('Uso: node infra/check-demo.mjs <API-HTTPS> <WEB-HTTPS>'); process.exit(2); }
for (const value of [api, web]) { const u = new URL(value); if (u.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(u.hostname)) throw new Error('URL pública precisa de HTTPS.'); }
const targets = [[api, '/actuator/health'], [web, '/'], [web, '/privacidade'], [web, '/suporte'], [web, '/exclusao-de-conta']];
let failed = false;
for (const [origin, path] of targets) {
  try {
    const r = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(15000), redirect: 'error', cache: 'no-store' });
    let healthy = r.ok;
    if (path === '/actuator/health' && healthy) healthy = (await r.json()).status === 'UP';
    console.log(`${healthy ? 'OK' : 'FAILED'} ${path} HTTP ${r.status}`);
    failed ||= !healthy;
  } catch { console.log(`FAILED ${path} indisponível`); failed = true; }
}
console.log('Ainda testar login, identidade e permissões com contas sintéticas; health sozinho não comprova o fluxo.');
process.exitCode = failed ? 1 : 0;
