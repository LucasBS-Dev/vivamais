import { lerSmsLocal } from "./caixa-sms-local.cjs";
import { chromium, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { randomUUID, randomInt } from "node:crypto";
const senha = process.env.E2E_PASSWORD;
const emailProfissional =
  process.env.CAPTURE_PROFESSIONAL_EMAIL ||
  "profissional.a@demo.vivamais.invalid";
if (!senha) throw new Error("Defina E2E_PASSWORD fora do repositório.");
const api = "http://127.0.0.1:8080",
  web = "http://127.0.0.1:3000",
  app = "http://127.0.0.1:8081";
const destino = process.env.CAPTURE_OUTPUT_DIRECTORY
  ? new URL(
      `${process.env.CAPTURE_OUTPUT_DIRECTORY.replaceAll("\\", "/").replace(/\/$/, "")}/`,
      new URL("../", import.meta.url),
    )
  : new URL("../docs/evidencias/visual/", import.meta.url);
await mkdir(destino, { recursive: true });
const sessoes = [],
  capturas = [];
async function requisicao(caminho, token, metodo = "GET", corpo) {
  const resposta = await fetch(`${api}/api/v1${caminho}`, {
    method: metodo,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(corpo ? { "Content-Type": "application/json" } : {}),
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  if (!resposta.ok)
    throw new Error(`API da captura: HTTP ${resposta.status} em ${caminho}`);
  return resposta.status === 204 ? null : resposta.json();
}
async function acessar(email) {
  const resposta = await requisicao("/auth/login", null, "POST", {
    email,
    password: senha,
  });
  sessoes.push(resposta.accessToken);
  return resposta.accessToken;
}
async function capturar(pagina, nome, paginaCompleta = false) {
  await pagina.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((imagem) =>
        imagem.decode().catch(() => {}),
      ),
    );
  });
  await pagina.screenshot({
    mask: [
      pagina.locator(
        'input[type="password"]:visible, input[autocomplete="current-password"]:visible, input[autocomplete="new-password"]:visible, textarea[readonly]:visible',
      ),
    ],
    fullPage: paginaCompleta,
    caret: "initial",
    path: fileURLToPath(new URL(`${nome}.png`, destino)),
  });
  const verificacao = await pagina.evaluate(() => {
    const visivel = (elemento) =>
      !!(
        elemento.getClientRects().length &&
        getComputedStyle(elemento).visibility !== "hidden" &&
        !elemento.closest('[aria-hidden="true"], [inert]')
      );
    const imagens = Array.from(document.images).filter(visivel);
    const controles = Array.from(
      document.querySelectorAll(
        'button,[role="button"],input:not([type="hidden"]),select,textarea',
      ),
    ).filter(visivel);
    const nomeAcessivel = (controle) =>
      controle.getAttribute("aria-label") ||
      controle.getAttribute("aria-labelledby") ||
      controle.labels?.length ||
      controle.textContent?.trim() ||
      (controle.tagName === "INPUT" &&
        ["submit", "button"].includes(controle.type) &&
        controle.value);
    return {
      controlesSemNome: controles.filter((controle) => !nomeAcessivel(controle))
        .length,
      imagensSemAlternativa: imagens.filter(
        (imagem) =>
          !imagem.hasAttribute("alt") && !imagem.getAttribute("aria-label"),
      ).length,
      imagensQuebradas: imagens.filter(
        (imagem) => !imagem.complete || !imagem.naturalWidth,
      ).length,
      rolagemHorizontalPagina:
        document.documentElement.scrollWidth > innerWidth + 2,
    };
  });
  capturas.push({ tela: nome, arquivo: `${nome}.png`, verificacao });
  await writeFile(
    new URL("capturas.json", destino),
    JSON.stringify({ estado: "EM_EXECUCAO", capturas }, null, 2),
  );
}
function gerarCpfSintetico() {
  let digitos;
  do {
    digitos = Array.from({ length: 9 }, () => randomInt(10));
  } while (new Set(digitos).size === 1);
  for (let p = 9; p < 11; p++)
    digitos.push(
      ((digitos.reduce((s, d, i) => s + d * (p + 1 - i), 0) * 10) % 11) % 10,
    );
  return digitos.join("");
}
async function botao(pagina, nome) {
  await pagina.getByRole("button", { name: nome, exact: true }).click();
}
let preferenciasOriginais, profissionalCaptura;
const navegador = await chromium.launch();
try {
  const profissional = await acessar(emailProfissional);
  profissionalCaptura = profissional;
  preferenciasOriginais = await requisicao("/conta/preferencias", profissional);
  if (
    preferenciasOriginais.textoAmpliado ||
    preferenciasOriginais.tamanhoPagina !== 20
  )
    await requisicao("/conta/preferencias", profissional, "PUT", {
      ...preferenciasOriginais,
      textoAmpliado: false,
      tamanhoPagina: 20,
    });
  const cpf = gerarCpfSintetico();
  const email = `visual-${Date.now()}@demo.invalid`;
  const cadastro = await requisicao("/patients", profissional, "POST", {
    displayName: "Pessoa Sintética Visual",
    modality: "APP",
    email,
    cpf,
    dataNascimento: "1954-01-07",
    telefone: "+55119" + String(randomInt(100000000)).padStart(8, "0"),
    sexo: "NAO_INFORMADO",
  });
  const idPaciente = cadastro.patient.id,
    base = `/patients/${idPaciente}`;
  const estadoSms = await requisicao(base + "/access-status", profissional);
  if (estadoSms.provedorSms !== "LOCAL")
    throw new Error(
      "Capturas exigem SMS de teste local; nenhum SMS real foi solicitado.",
    );
  const emissao = await requisicao(
    base + "/access-reset",
    profissional,
    "POST",
    { senhaProfissional: senha, identidadeConferida: true },
  );
  const contextoMovel = await navegador.newContext({
      viewport: { width: 390, height: 780 },
      isMobile: true,
      hasTouch: true,
    }),
    movel = await contextoMovel.newPage();
  movel.on("response", async (resposta) => {
    if (
      new URL(resposta.url()).pathname === "/api/v1/auth/paciente/renovar" &&
      resposta.status() === 200
    ) {
      try {
        const dados = await resposta.json();
        if (dados.sessao) sessoes.push(dados.sessao.accessToken);
      } catch {}
    }
  });
  await movel.goto(app);
  await movel.getByTestId("start-button").waitFor();
  await capturar(movel, "app_01_boas_vindas");
  await botao(movel, "Cadastrar ou ativar minha conta");
  await capturar(movel, "extra_cadastro_aplicativo");
  await botao(movel, "Já tenho código: ativar conta");
  await movel.getByLabel("CPF", { exact: true }).waitFor();
  await capturar(movel, "app_02_acesso_cpf");
  await movel.getByLabel("CPF", { exact: true }).fill(cpf);
  await movel
    .getByLabel("Data de nascimento", { exact: true })
    .fill("07011954");
  await botao(movel, "ENTRAR");
  await movel.getByLabel("Código de ativação", { exact: true }).waitFor();
  await capturar(movel, "extra_ativacao_aplicativo");
  const sessaoPaciente = movel.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === "/api/v1/auth/paciente/renovar" &&
      r.status() === 200,
  );
  await movel
    .getByLabel("Código de ativação", { exact: true })
    .fill(lerSmsLocal(emissao.idEnvio).codigo);
  await botao(movel, "ATIVAR CONTA");
  const paciente = (await (await sessaoPaciente).json()).sessao.accessToken;
  await botao(movel, "Ir para o início");
  for (let indice = 0; indice < 7; indice++)
    await requisicao(`${base}/readings`, paciente, "POST", {
      id: randomUUID(),
      systolic: 110 + indice,
      diastolic: 70 + indice,
      pulse: 71,
      measuredAt: new Date(
        Date.now() - (6 - indice) * 86400000 - 60000,
      ).toISOString(),
      source: "MANUAL",
    });
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  await requisicao(`${base}/medications`, profissional, "POST", {
    name: "Medicamento de demonstração",
    instruction: "Instrução sintética cadastrada pela equipe",
    startsOn: dia,
    timeZone: "America/Sao_Paulo",
    schedules: ["08:00", "20:00"],
  });
  await requisicao(`${base}/activity-profile`, profissional, "PUT", {
    mobility: "Mobilidade informada pela equipe (teste)",
    balance: "Equilíbrio informado pela equipe (teste)",
    restrictions: "Restrições sintéticas",
    professionalGuidance: "Material personalizado ainda aguarda validação.",
  });
  await requisicao(`${base}/activities`, paciente, "POST", {
    id: randomUUID(),
    type: "Atividade sintética registrada",
    durationMinutes: 10,
    occurredAt: new Date().toISOString(),
    feeling: "WELL",
    notes: "Registro voluntário de teste; sem recomendação automática.",
  });
  await requisicao(`${base}/consultations`, profissional, "POST", {
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    notes: "Consulta sintética para inspeção da interface.",
    goals: "Objetivo de demonstração registrado pelo profissional.",
    carePlan: "Plano sintético, sem orientação de tratamento real.",
  });
  const formularioFoto = new FormData();
  formularioFoto.append("purpose", "MEAL");
  formularioFoto.append(
    "file",
    new Blob(
      [
        await readFile(
          new URL("../assets/images/refeicao-exemplo.png", import.meta.url),
        ),
      ],
      { type: "image/png" },
    ),
    "refeicao-sintetica.png",
  );
  const envioFoto = await fetch(`${api}/api/v1${base}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${paciente}` },
    body: formularioFoto,
  });
  if (!envioFoto.ok)
    throw new Error(`Foto da captura: HTTP ${envioFoto.status}`);
  const arquivoFoto = await envioFoto.json();
  await requisicao(`${base}/meals`, paciente, "POST", {
    fileId: arquivoFoto.id,
    occurredAt: new Date().toISOString(),
    notes:
      "Imagem sintética do material de referência; registro exclusivo de teste.",
  });
  const diario = await requisicao("/patients", profissional, "POST", {
    displayName: "Pessoa Sintética Diário Visual",
    modality: "BRACELET_DIARY",
    telefone: "+55119" + String(randomInt(100000000)).padStart(8, "0"),
  });
  const idDiario = diario.patient.id;
  await requisicao(`/patients/${idDiario}/diary`, profissional, "POST", {
    id: randomUUID(),
    occurredAt: new Date().toISOString(),
    systolic: 118,
    diastolic: 76,
    pulse: 71,
    medicationReport: "Relato sintético transcrito pela equipe",
    notes: "Entrada real na API, dados de teste.",
  });
  await requisicao(`/patients/${idDiario}/device`, profissional, "POST", {
    label: "Pulseira de teste (sem hardware)",
    serialNumber: "SINTETICA-VISUAL",
  });
  await requisicao(
    `/patients/${idDiario}/device/configurations`,
    profissional,
    "POST",
    { schedules: ["08:00", "20:00"], adapter: "SIMULATED" },
  );
  const contexto = await navegador.newContext({
      viewport: { width: 1280, height: 900 },
    }),
    pagina = await contexto.newPage();
  await pagina.goto(web);
  for (const [rota, titulo, nome] of [
    ["/privacidade", "Privacidade", "extra_web_privacidade"],
    ["/suporte", "Ajuda e suporte", "extra_web_suporte"],
    ["/exclusao-de-conta", "Exclusão de conta e dados", "extra_web_exclusao"],
  ]) {
    await pagina.goto(`${web}${rota}`);
    await pagina.getByRole("heading", { name: titulo, exact: true }).waitFor();
    await capturar(pagina, nome, true);
  }
  await pagina.goto(web);
  await pagina
    .getByRole("heading", { name: "Acesso do Profissional", exact: true })
    .waitFor();
  await capturar(pagina, "web_01_login_profissional");
  await pagina.getByLabel("E-mail institucional").fill(emailProfissional);
  await pagina.getByLabel("Senha", { exact: true }).fill(senha);
  await botao(pagina, "Entrar na plataforma");
  await pagina.waitForURL("**/painel");
  await pagina.locator(".cabecalho-painel").waitFor();
  await capturar(pagina, "web_02_painel_inicial");
  await pagina.goto(`${web}/pacientes/novo`);
  await pagina
    .getByRole("heading", { name: "Cadastrar novo paciente", exact: true })
    .waitFor();
  await capturar(pagina, "web_03_cadastro_paciente");
  await pagina.goto(`${web}/pacientes/${idPaciente}`);
  await pagina.getByLabel("Visão geral dos cuidados").waitFor();
  await pagina.getByText("116 / 76", { exact: true }).waitFor();
  await capturar(pagina, "web_04_perfil_paciente");
  await botao(pagina, "Editar cadastro");
  await pagina.getByLabel("Nome completo", { exact: true }).waitFor();
  await capturar(pagina, "extra_web_editar_cadastro", true);
  await botao(pagina, "Cancelar edição");
  for (const [rotulo, nome, segmento] of [
    ["Pressão arterial", "web_05_historico_pressao", "readings"],
    ["Medicamentos", "web_06_medicamentos", "medications"],
    ["Alimentação", "web_07_alimentacao", "meals"],
    ["Atividade física", "web_08_atividade_fisica", "activities"],
    ["Consultas", "web_12_historico_consultas", "consultations"],
  ]) {
    const carregamento = pagina.waitForResponse(
      (resposta) =>
        new URL(resposta.url()).pathname ===
          `/api/domain/patients/${idPaciente}/${segmento}` &&
        resposta.request().method() === "GET",
    );
    await pagina.getByRole("tab", { name: rotulo, exact: true }).click();
    await carregamento;
    await expect(
      pagina.getByText("Carregando informações…", { exact: true }),
    ).toHaveCount(0);
    await capturar(pagina, nome);
    if (segmento === "medications") {
      await pagina
        .getByRole("combobox", {
          name: "Período dos autorrelatos",
          exact: true,
        })
        .selectOption("7");
      await expect(
        pagina.getByText("Carregando informações…", { exact: true }),
      ).toHaveCount(0);
      await pagina
        .getByText("Autorrelatos do período de sete dias", { exact: true })
        .waitFor();
      await capturar(pagina, "extra_web_autorrelatos_semana", true);
    }
  }
  await botao(pagina, "Nova consulta");
  await pagina
    .getByRole("heading", { name: "Novo registro", exact: true })
    .scrollIntoViewIfNeeded();
  await capturar(pagina, "web_11_resumo_consulta");
  await pagina.goto(`${web}/pacientes/${idDiario}`);
  for (const [rotulo, nome, segmento] of [
    ["Pulseira", "web_09_configuracao_pulseira", "device"],
    ["Diário impresso", "web_10_registro_diario", "diary"],
  ]) {
    const carregamento = pagina.waitForResponse(
      (resposta) =>
        new URL(resposta.url()).pathname ===
          `/api/domain/patients/${idDiario}/${segmento}` &&
        resposta.request().method() === "GET",
    );
    await pagina.getByRole("tab", { name: rotulo, exact: true }).click();
    await carregamento;
    await expect(
      pagina.getByText("Carregando informações…", { exact: true }),
    ).toHaveCount(0);
    await capturar(pagina, nome);
  }
  await pagina.goto(`${web}/pacientes`);
  await pagina
    .getByRole("heading", { name: "Pacientes", exact: true })
    .waitFor();
  await capturar(pagina, "extra_web_lista_pacientes");
  for (const [rota, titulo, nome] of [
    ["/consultas", "Consultas de enfermagem", "extra_web_consultas"],
    ["/relatorios", "Relatórios e resumos", "extra_web_relatorios"],
    ["/configuracoes", "Configurações", "extra_web_configuracoes"],
  ]) {
    await pagina.goto(`${web}${rota}`);
    await pagina.getByRole("heading", { name: titulo, exact: true }).waitFor();
    await capturar(pagina, nome, true);
  }
  await botao(pagina, "Sair");
  await movel.goto(app + "/inicio");
  await movel.waitForURL("**/inicio");
  await movel.getByText("✓ Conectado à sua equipe", { exact: false }).waitFor();
  await movel
    .getByLabel("Meu acompanhamento")
    .getByText("Última pressão:", { exact: false })
    .waitFor();
  await capturar(movel, "app_03_pagina_inicial");
  await capturar(movel, "atividade_01_inicio_atividade");
  await movel.getByTestId("module-blood-pressure").click();
  await capturar(movel, "app_04_pressao_entrada");
  await botao(movel, "Digitar os valores");
  await movel.getByLabel("Sistólica", { exact: true }).fill("11");
  await movel.getByLabel("Diastólica", { exact: true }).fill("7");
  await botao(movel, "Salvar");
  await capturar(movel, "app_05_pressao_digitacao");
  await botao(movel, "Corrigir");
  await botao(movel, "Voltar à pressão");
  await botao(movel, "Tirar foto do aparelho");
  await movel
    .getByRole("img", { name: "Exemplo ilustrativo; nenhuma foto enviada" })
    .waitFor();
  await capturar(movel, "app_06_pressao_foto");
  await botao(movel, "Digitar os valores");
  await movel.getByLabel("Sistólica", { exact: true }).fill("11");
  await movel.getByLabel("Diastólica", { exact: true }).fill("7");
  await botao(movel, "Salvar");
  await botao(movel, "Sim, está correto");
  await movel
    .getByText("Pressão registrada com sucesso!", { exact: true })
    .waitFor();
  await capturar(movel, "app_07_pressao_resultado");
  await botao(movel, "Ver meu histórico");
  await movel
    .getByRole("heading", { name: "Gráfico da pressão", exact: true })
    .waitFor();
  await capturar(movel, "app_08_pressao_historico");
  await botao(movel, "Voltar ao início");
  await movel.getByTestId("module-medications").click();
  await movel
    .getByText("Medicamento de demonstração", { exact: true })
    .first()
    .waitFor();
  await capturar(movel, "app_09_medicamentos");
  await botao(movel, "Voltar ao início");
  await movel.getByTestId("module-food").click();
  await movel
    .getByRole("img", { name: "Exemplo ilustrativo; nenhuma foto enviada" })
    .waitFor();
  await capturar(movel, "app_11_alimentacao_foto");
  const [seletor] = await Promise.all([
    movel.waitForEvent("filechooser"),
    botao(movel, "Escolher foto da galeria"),
  ]);
  await seletor.setFiles(
    fileURLToPath(
      new URL("../assets/images/refeicao-exemplo.png", import.meta.url),
    ),
  );
  await botao(movel, "Enviar refeição e foto");
  await movel
    .getByRole("img", { name: "Foto privada da refeição", exact: true })
    .first()
    .waitFor();
  await movel
    .getByText("Foto privada e refeição salvas.", { exact: false })
    .waitFor();
  await movel
    .getByRole("button", { name: "Ver resultado da refeição", exact: true })
    .first()
    .click();
  await movel
    .getByText("Análise educativa indisponível", { exact: true })
    .waitFor();
  await movel
    .getByRole("img", { name: "Foto privada da refeição", exact: true })
    .waitFor();
  await capturar(movel, "app_12_alimentacao_resultado");
  await botao(movel, "Ver minhas refeições");
  await botao(movel, "Voltar ao início");
  await botao(movel, "Atividade Física. Abrir módulo.");
  await capturar(movel, "atividade_02_entrada");
  await botao(movel, "Ver minhas informações");
  await movel.getByRole("radio", { name: "Estou bem", exact: true }).click();
  await capturar(movel, "atividade_03_como_esta_hoje");
  await botao(movel, "Continuar");
  await movel
    .getByRole("radio", { name: "Sim, já verifiquei", exact: true })
    .click();
  await capturar(movel, "atividade_04_verificacao_pressao");
  await botao(movel, "Continuar");
  await movel
    .getByText("Mobilidade informada pela equipe (teste)", { exact: true })
    .waitFor();
  await capturar(movel, "atividade_05_suas_informacoes");
  await botao(movel, "Ver orientações da atividade");
  await capturar(movel, "atividade_06_atividade_hoje");
  await botao(movel, "Passo a passo e materiais");
  await capturar(movel, "atividade_07_passo_a_passo");
  await botao(movel, "Vídeo demonstrativo");
  await capturar(movel, "atividade_08_video_demonstrativo");
  await movel.goBack();
  await movel.goBack();
  await botao(movel, "Hoje preciso de algo mais leve");
  await capturar(movel, "atividade_09_alternativa_mais_leve");
  await movel.goBack();
  await botao(movel, "Registrar atividade já realizada");
  await movel.getByLabel("Atividade realizada", { exact: true }).waitFor();
  await botao(movel, "Estou bem");
  await movel
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Atividade concluída de teste");
  await movel.getByLabel("Duração em minutos", { exact: true }).fill("5");
  await botao(movel, "Registrar atividade realizada");
  await movel.getByText("Registro salvo.", { exact: true }).waitFor();
  await capturar(movel, "atividade_10_registro_atividade");
  await botao(movel, "Ver minha semana de atividades");
  await movel
    .getByText("Atividade sintética registrada", { exact: true })
    .waitFor();
  await capturar(movel, "atividade_11_historico_atividades");
  await botao(movel, "Voltar ao início");
  await botao(movel, "Mensagens");
  await capturar(movel, "atividade_12_orientacoes");
  await botao(movel, "Início");
  await botao(movel, "Meu Perfil");
  await movel
    .getByText("Nome: Pessoa Sintética Visual", { exact: true })
    .waitFor();
  await capturar(movel, "extra_perfil_paciente", true);
  await botao(movel, "Configurações e acessibilidade");
  await capturar(movel, "extra_configuracoes_aplicativo", true);
  await botao(movel, "Voltar ao início");
  await botao(movel, "Meus Lembretes");
  await movel.getByText("Meus Lembretes", { exact: true }).waitFor();
  await capturar(movel, "extra_lembretes_aplicativo", true);
  await botao(movel, "Voltar ao início");
  await botao(movel, "Atividade Física. Abrir módulo.");
  await botao(movel, "Ilustrações das atividades");
  await capturar(movel, "extra_ilustracoes_atividades", true);
  await botao(movel, "Voltar à atividade física");
  await botao(movel, "Mensagens e orientações da atividade");
  await movel
    .getByRole("heading", { name: "Mensagens e orientações", exact: true })
    .waitFor();
  await capturar(movel, "extra_orientacoes_atividade", true);
  await botao(movel, "Início");
  await botao(movel, "Meu Histórico");
  await movel
    .getByRole("heading", { name: "Gráfico da pressão", exact: true })
    .waitFor();
  await capturar(movel, "extra_historico_geral", true);
  await botao(movel, "Voltar ao início");
  await botao(movel, "Sair da minha conta");
  await writeFile(
    new URL("capturas.json", destino),
    JSON.stringify(
      {
        executadoEm: new Date().toISOString(),
        origem:
          "Navegador Chromium com Java/PostgreSQL reais e contas sintéticas exclusivas do ensaio",
        capturas,
        naoCapturada: [
          {
            tela: "app_10_notificacao_medicamento",
            motivo:
              "Notificação nativa exige Android/iOS; navegador não comprova entrega/aparência do SO.",
          },
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    `${capturas.length} capturas reais concluídas. Notificação nativa permanece sem captura; comparação visual deve ser registrada separadamente.`,
  );
} finally {
  if (profissionalCaptura && preferenciasOriginais) {
    const atual = await requisicao("/conta/preferencias", profissionalCaptura);
    await requisicao("/conta/preferencias", profissionalCaptura, "PUT", {
      ...preferenciasOriginais,
      versao: atual.versao,
    });
  }
  for (const token of sessoes)
    await requisicao("/auth/logout", token, "POST").catch(() => {});
  await navegador.close();
}
