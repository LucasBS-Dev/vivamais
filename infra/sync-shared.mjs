import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const raiz = fileURLToPath(new URL("../", import.meta.url));
// Pacotes locais podem ser cópias, links ou arquivos ligados pelo pnpm no Windows.
// Atualizar somente nossos fontes/metadados, sem copiar um arquivo sobre ele mesmo.
function copiarSeDiferente(origem, destino) {
  if (existsSync(destino) && realpathSync(origem) === realpathSync(destino))
    return;
  if (statSync(origem).isDirectory()) {
    mkdirSync(destino, { recursive: true });
    for (const nome of readdirSync(origem))
      copiarSeDiferente(resolve(origem, nome), resolve(destino, nome));
  } else if (
    !existsSync(destino) ||
    !readFileSync(origem).equals(readFileSync(destino))
  )
    copyFileSync(origem, destino);
}
for (const aplicativo of ["", "web"]) {
  if (!existsSync(resolve(raiz, aplicativo, "node_modules"))) continue;
  for (const nome of ["contracts", "design-tokens"]) {
    const origem = resolve(raiz, "packages", nome),
      destino = resolve(raiz, aplicativo, "node_modules", "@viva", nome);
    mkdirSync(destino, { recursive: true });
    for (const arquivo of ["src", "package.json"])
      copiarSeDiferente(resolve(origem, arquivo), resolve(destino, arquivo));
  }
}
