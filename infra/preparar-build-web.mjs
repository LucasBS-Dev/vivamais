import { mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Contorno da restrição mkdir da sandbox Windows. Apenas saída gerada, sem apagar arquivos.
const raiz = fileURLToPath(new URL('../web/', import.meta.url));
const diretorios = new Set(['']);
async function percorrer(caminho = '') {
  for (const entrada of await readdir(join(raiz, 'app', caminho), { withFileTypes: true })) {
    const relativo = join(caminho, entrada.name);
    if (entrada.isDirectory()) {
      diretorios.add(relativo);
      diretorios.add(relativo.split(/[\\/]/).filter(parte => !parte.startsWith('(')).join('/'));
      await percorrer(relativo);
    }
  }
}
await percorrer();
for (const base of ['', 'dev']) {
  for (const pasta of ['cache', 'cache/webpack', 'diagnostics', 'trace', 'types', 'server', 'server/chunks', 'static', 'static/chunks', 'static/media']) {
    // O arquivo .next/trace não deve ser convertido em diretório.
    if (pasta !== 'trace') await mkdir(join(raiz, '.next', base, pasta), { recursive: true });
  }
  for (const prefixo of ['server/app', 'static/chunks/app', 'types/app'])
    for (const diretorio of diretorios) await mkdir(join(raiz, '.next', base, prefixo, diretorio), { recursive: true });
}
await mkdir(dirname(join(raiz, '.next/BUILD_ID')), { recursive: true });
console.log('Diretórios gerados do Next preparados. Para o build nesta sandbox, defina VIVA_BUILD_DIRETORIOS_PREPARADOS=1. Nenhum arquivo existente foi removido.');
