const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { createDecipheriv } = require("node:crypto");
const { resolve, dirname } = require("node:path");

// Leitor administrativo da caixa cifrada. Não existe endpoint público de leitura.
function lerSmsLocal(
  idEnvio,
  diretorioArquivos = resolve(__dirname, "../.local/private-files"),
) {
  if (!/^[0-9a-f-]{36}$/i.test(idEnvio))
    throw new Error("Referência local inválida.");
  const pasta = resolve(diretorioArquivos, "sms-teste");
  const chave = Buffer.from(
    readFileSync(resolve(pasta, ".chave"), "utf8").trim(),
    "base64",
  );
  const envelope = readFileSync(resolve(pasta, idEnvio + ".sms"));
  if (chave.length !== 32 || envelope.length < 29)
    throw new Error("Caixa local inválida.");
  const cifra = createDecipheriv(
    "aes-256-gcm",
    chave,
    envelope.subarray(0, 12),
  );
  cifra.setAuthTag(envelope.subarray(-16));
  const mensagem = JSON.parse(
    Buffer.concat([
      cifra.update(envelope.subarray(12, -16)),
      cifra.final(),
    ]).toString("utf8"),
  );
  if (
    mensagem.idEnvio !== idEnvio ||
    mensagem.somenteTesteLocal !== true ||
    !/^\d{4}$/.test(mensagem.codigo)
  )
    throw new Error("Mensagem local inválida.");
  if (Date.parse(mensagem.expiraEm) <= Date.now())
    throw new Error(
      "Código local expirado. Solicite outro respeitando o prazo de reenvio.",
    );
  return mensagem;
}

exports.lerSmsLocal = lerSmsLocal;

if (require.main === module) {
  try {
    const mensagem = lerSmsLocal(process.argv[2] ?? "");
    const destino = resolve(
      __dirname,
      "../.local/private-files/sms-teste/consulta-privada.json",
    );
    // O diretório já tem ACL privada estabelecida pela API; não gravar fora dele.
    if (!existsSync(dirname(destino)))
      throw new Error("Caixa de desenvolvimento não iniciada.");
    writeFileSync(destino, JSON.stringify(mensagem, null, 2) + "\n", {
      mode: 0o600,
    });
    console.log(
      "TESTE LOCAL: nenhum SMS real enviado. Abra o arquivo privado no seu computador:",
    );
    console.log(destino);
  } catch {
    console.error(
      "Não foi possível consultar o SMS local. Confira a referência, a validade e a configuração de desenvolvimento.",
    );
    process.exitCode = 1;
  }
}
