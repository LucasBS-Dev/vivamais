import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Mesmo com trace/foto/vídeo desativados, Playwright pode criar snapshots textuais em falhas.
const raiz = fileURLToPath(new URL('../test-results/', import.meta.url));
const senha = process.env.E2E_PASSWORD;
async function percorrer(pasta) {
  let entradas;
  try { entradas = await readdir(pasta, { withFileTypes: true }); } catch (erro) { if (erro.code === 'ENOENT') return; throw erro; }
  for (const entrada of entradas) {
    const arquivo = join(pasta, entrada.name);
    if (entrada.isDirectory()) await percorrer(arquivo);
    else if (/\.(md|json|txt|log)$/.test(entrada.name)) {
      let texto = await readFile(arquivo, 'utf8');
      if (senha) texto = texto.replaceAll(senha, '[oculto]');
      texto = texto.replace(/value="[^"]*"/g, 'value="[oculto]"').replace(/\b\d{11}\b/g, '[documento sintético oculto]').replace(/Bearer\s+\S+/gi, 'Bearer [oculto]').replace(/[A-Za-z0-9_-]{40,}/g, '[valor longo oculto]');
      await writeFile(arquivo, texto);
    }
  }
}
await percorrer(raiz);
