const [ram, cpu, egress] = process.argv.slice(2).map(Number);
if (![ram, cpu, egress].every((n) => Number.isFinite(n) && n >= 0)) {
  console.error('Uso: node infra/cost-estimate.mjs <GB-RAM-medios> <vCPU-media> <GB-saida-mes>');
  process.exit(2);
}
const estimate = Math.max(5, ram * 10 + cpu * 20 + egress * 0.05);
console.log(JSON.stringify({ estimatedRailwayUsd: Number(estimate.toFixed(2)), budgetUsd: 25, threshold: estimate >= 25 ? 'OVER_BUDGET' : estimate >= 20 ? 'WARNING' : 'WITHIN_PLAN', excludes: ['taxes', 'volumes', 'AI', 'SMS', 'email', 'other providers'], note: 'Estimativa; não é medição nem limite no provedor.' }, null, 2));
if (estimate >= 25) process.exitCode = 1;
