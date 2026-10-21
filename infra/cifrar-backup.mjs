import { readFile, writeFile, readdir, mkdir, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "node:crypto";
import assert from "node:assert/strict";

const [modo, pasta, pastaChaves, origemArquivos] = process.argv.slice(2);
if (!["criar", "restaurar"].includes(modo) || !pasta || !pastaChaves)
  throw Error("Informe modo e diretórios privados.");
const pacote = join(pasta, "backup.viva");
const arquivoChave = join(pastaChaves, "backup.key");
const resumo = (bytes) => createHash("sha256").update(bytes).digest("hex");
function decifrar(bytes, chave) {
  assert.equal(bytes.subarray(0, 5).toString(), "VIVA1");
  const cifra = createDecipheriv("aes-256-gcm", chave, bytes.subarray(5, 17));
  cifra.setAuthTag(bytes.subarray(17, 33));
  return Buffer.concat([cifra.update(bytes.subarray(33)), cifra.final()]);
}
if (modo === "criar") {
  if (!origemArquivos) throw Error("Diretório de objetos privados ausente.");
  const arquivos = {};
  for (const nome of await readdir(origemArquivos)) {
    if (
      ![".encryption-key", ".patient-auth-key"].includes(nome) &&
      !/^[a-f0-9-]{36}\.bin$/.test(nome)
    )
      continue;
    const bytes = await readFile(join(origemArquivos, nome));
    arquivos[nome] = {
      conteudo: bytes.toString("base64"),
      sha256: resumo(bytes),
    };
  }
  assert.ok(
    arquivos[".encryption-key"],
    "Chave dos objetos deve acompanhar o backup cifrado",
  );
  const dump = await readFile(join(pasta, "dados.dump"));
  const dados = Buffer.from(
    JSON.stringify({
      versao: 1,
      dump: dump.toString("base64"),
      hashDump: resumo(dump),
      arquivos,
    }),
  );
  const chave = randomBytes(32),
    iv = randomBytes(12);
  const cifra = createCipheriv("aes-256-gcm", chave, iv);
  const bytesCifrados = Buffer.concat([cifra.update(dados), cifra.final()]);
  const bytes = Buffer.concat([
    Buffer.from("VIVA1"),
    iv,
    cifra.getAuthTag(),
    bytesCifrados,
  ]);
  assert.deepEqual(decifrar(bytes, chave), dados);
  const corrompido = Buffer.from(bytes);
  corrompido[corrompido.length - 1] ^= 1;
  assert.throws(() => decifrar(corrompido, chave));
  await writeFile(arquivoChave, chave, { flag: "wx", mode: 0o600 });
  await writeFile(pacote, bytes, { flag: "wx", mode: 0o600 });
  await writeFile(
    join(pasta, "integridade.json"),
    JSON.stringify(
      {
        algoritmo: "AES-256-GCM",
        sha256: resumo(bytes),
        bytes: bytes.length,
        objetos: Object.keys(arquivos).filter((nome) => nome.endsWith(".bin"))
          .length,
        chaveAcessoPaciente: Boolean(arquivos[".patient-auth-key"]),
        autenticidade: true,
        adulteracaoRecusada: true,
      },
      null,
      2,
    ),
  );
  await unlink(join(pasta, "dados.dump"));
} else {
  const bytes = await readFile(pacote),
    chave = await readFile(arquivoChave);
  const integridade = JSON.parse(
    await readFile(join(pasta, "integridade.json"), "utf8"),
  );
  assert.equal(resumo(bytes), integridade.sha256);
  const dados = JSON.parse(decifrar(bytes, chave));
  assert.equal(dados.versao, 1);
  const dump = Buffer.from(dados.dump, "base64");
  assert.equal(resumo(dump), dados.hashDump);
  const destino = resolve(pasta, "restauracao-arquivos");
  await mkdir(destino, { recursive: false });
  for (const [nome, arquivo] of Object.entries(dados.arquivos)) {
    assert.ok(
      [".encryption-key", ".patient-auth-key"].includes(nome) ||
        /^[a-f0-9-]{36}\.bin$/.test(nome),
    );
    const conteudo = Buffer.from(arquivo.conteudo, "base64");
    assert.equal(resumo(conteudo), arquivo.sha256);
    await writeFile(join(destino, nome), conteudo, { flag: "wx", mode: 0o600 });
  }
  await writeFile(join(pasta, "restauracao.dump"), dump, {
    flag: "wx",
    mode: 0o600,
  });
}
console.log(`Backup: ${modo} validado; nenhum conteúdo privado foi exibido.`);
