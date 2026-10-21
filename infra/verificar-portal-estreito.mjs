import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const senha = process.env.E2E_PASSWORD;
if (!senha) throw new Error("Credencial sintética privada obrigatória.");
const navegador = await chromium.launch();
const verificacoes = [];
try {
  const pagina = await navegador.newPage({ viewport: { width: 390, height: 844 } });
  await pagina.goto("http://127.0.0.1:3000/");
  await pagina.getByLabel("E-mail institucional").fill("profissional.b@demo.vivamais.invalid");
  await pagina.getByLabel("Senha", { exact: true }).fill(senha);
  await pagina.getByRole("button", { name: "Entrar na plataforma", exact: true }).click();
  await pagina.waitForURL("**/painel");
  const id = await pagina.evaluate(async () => {
    const resposta = await fetch(`/api/domain/patients/search?q=${encodeURIComponent("Pessoa Sintética Visual")}&size=20`);
    if (!resposta.ok) throw new Error("Consulta sintética indisponível.");
    return (await resposta.json()).items[0]?.id;
  });
  if (!id) throw new Error("Execute as capturas principais antes do ensaio responsivo.");
  for (const [rota, nome] of [["/configuracoes", "configuracoes"], [`/pacientes/${id}?aba=consultations`, "consultas"]]) {
    await pagina.goto(`http://127.0.0.1:3000${rota}`);
    await pagina.getByRole("heading", { name: nome === "configuracoes" ? "Configurações" : "Pessoa Sintética Visual", exact: true }).waitFor();
    if (nome === "consultas") await pagina.getByRole("table").waitFor();
    const largura = await pagina.evaluate(() => ({ pagina: document.documentElement.scrollWidth, janela: innerWidth }));
    if (largura.pagina > largura.janela + 2) throw new Error("A página excede a largura disponível.");
    await pagina.screenshot({ path: `docs/evidencias/profissionalizacao/extra_web_${nome}_390.png`, fullPage: true });
    verificacoes.push({ tela: nome, largura: 390, rolagemHorizontalPagina: false });
  }
  await pagina.getByRole("button", { name: "Sair", exact: true }).click();
  await writeFile("docs/evidencias/profissionalizacao/responsividade.json", JSON.stringify({ dataUtc: new Date().toISOString(), verificacoes }, null, 2));
  console.log("APROVADO: configurações e consultas do portal em390px, duas capturas sem rolagem horizontal da página.");
} catch {
  console.error("Verificação responsiva falhou; detalhes privados não foram exibidos.");
  process.exitCode = 1;
} finally { await navegador.close(); }
