import assert from "node:assert/strict";

const endereco = process.env.RESTORE_API_BASE_URL;
const senha = process.env.E2E_PASSWORD;
if (!endereco || !senha)
  throw new Error(
    "Defina RESTORE_API_BASE_URL e E2E_PASSWORD fora do repositório.",
  );
const sessoes = [];
async function acessar(email) {
  const resposta = await fetch(`${endereco}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: senha }),
  });
  assert.equal(resposta.status, 200, "Login no banco restaurado");
  const sessao = await resposta.json();
  sessoes.push(sessao.accessToken);
  return { Authorization: `Bearer ${sessao.accessToken}` };
}
async function consultar(caminho, cabecalhos, metodo = "GET") {
  return fetch(`${endereco}/api/v1${caminho}`, {
    method: metodo,
    headers: cabecalhos,
  });
}
try {
  const profissional = await acessar("profissional.a@demo.vivamais.invalid");
  const outraClinica = await acessar("profissional.b@demo.vivamais.invalid");
  const resposta = await consultar("/patients", profissional);
  assert.equal(resposta.status, 200);
  const pacientes = await resposta.json();
  assert.ok(pacientes.length > 0);
  let idArquivo;
  for (const paciente of pacientes) {
    const refeicoes = await consultar(
      `/patients/${paciente.id}/meals`,
      profissional,
    );
    assert.equal(refeicoes.status, 200);
    const pagina = await refeicoes.json();
    if (pagina.items[0]) {
      idArquivo = pagina.items[0].fileId;
      break;
    }
  }
  assert.ok(
    idArquivo,
    "Foto do backup precisa existir para validar a chave de cifra preservada",
  );
  const negado = await consultar(
    `/files/${idArquivo}/link`,
    outraClinica,
    "POST",
  );
  assert.equal(
    negado.status,
    403,
    "Foto restaurada permanece isolada por clínica",
  );
  const concessao = await consultar(
    `/files/${idArquivo}/link`,
    profissional,
    "POST",
  );
  assert.equal(concessao.status, 200);
  const { path: caminho } = await concessao.json();
  const fotografia = await fetch(new URL(caminho, endereco));
  assert.equal(
    fotografia.status,
    200,
    "Objeto restaurado deve ser decifrado com a chave preservada",
  );
  assert.match(
    fotografia.headers.get("content-type") || "",
    /^image\/(png|jpeg)/,
  );
  const tamanho = (await fotografia.arrayBuffer()).byteLength;
  assert.ok(tamanho > 0);
  console.log(
    JSON.stringify({
      resultado: "APROVADO",
      login: true,
      isolamentoFoto: true,
      fotoDecifrada: true,
      bytesFotografia: tamanho,
    }),
  );
} finally {
  for (const token of sessoes)
    await consultar(
      "/auth/logout",
      { Authorization: `Bearer ${token}` },
      "POST",
    );
}
