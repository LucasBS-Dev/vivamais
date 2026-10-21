import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cadastrarComCodigo, entrarNaTela } from "./apoio-acesso-paciente";

const pasta = resolve("docs/evidencias/cadastro-sms-interface");
async function capturar(pagina: Page, nome: string) {
  if (process.env.VIVA_CAPTURAR_INTERFACE !== "true") return;
  await mkdir(pasta, { recursive: true });
  await pagina.screenshot({
    path: resolve(pasta, nome + ".png"),
    fullPage: true,
    mask: [
      pagina.locator(
        "input[type=password],input[name=cpf],input[name=dataNascimento],input[name=telefone]",
      ),
    ],
  });
}
async function entrarProfissional(pagina: Page) {
  await pagina.goto("http://127.0.0.1:3000/");
  await pagina
    .getByLabel("E-mail institucional")
    .fill("admin.a@demo.vivamais.invalid");
  await pagina
    .getByLabel("Senha", { exact: true })
    .fill(process.env.E2E_PASSWORD!);
  await pagina
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(pagina).toHaveURL(/\/painel$/);
}
test("configurações responsivas e logo original em tela de alta densidade", async ({
  browser,
}) => {
  test.setTimeout(120000);
  expect(Boolean(process.env.E2E_PASSWORD)).toBe(true);
  const contexto = await browser.newContext({ deviceScaleFactor: 2 });
  const pagina = await contexto.newPage();
  const medidas = [];
  try {
    await entrarProfissional(pagina);
    await pagina.goto("http://127.0.0.1:3000/configuracoes");
    for (const [largura, altura] of [
      [1366, 900],
      [1440, 900],
      [1920, 1080],
      [768, 1024],
      [390, 844],
    ]) {
      await pagina.setViewportSize({ width: largura!, height: altura! });
      await expect(
        pagina.getByRole("heading", { name: "Configurações", exact: true }),
      ).toBeVisible();
      await expect(
        pagina.getByLabel("Registros por página na ficha"),
      ).toBeVisible();
      const logo = pagina.locator(".sidebar .brand img");
      await expect(logo).toBeVisible();
      await expect
        .poll(() =>
          logo.evaluate(
            (imagem: HTMLImageElement) =>
              imagem.complete && imagem.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const dimensoes = await logo.evaluate((imagem: HTMLImageElement) => ({
        largura: imagem.getBoundingClientRect().width,
        altura: imagem.getBoundingClientRect().height,
        origem: imagem.currentSrc,
        natural: imagem.naturalWidth,
      }));
      expect(dimensoes.origem).toContain("logo_viva_mais_sem_slogan");
      expect(
        Math.abs(dimensoes.largura / dimensoes.altura - 1278 / 1230),
      ).toBeLessThan(0.02);
      const rolagemHorizontal = await pagina.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(rolagemHorizontal).toBe(false);
      const caixa = await pagina.locator(".configuracoes-pagina").boundingBox();
      expect(caixa!.width).toBeLessThanOrEqual(1121);
      medidas.push({
        largura,
        altura,
        densidade: 2,
        rolagemHorizontal,
        proporcaoLogoPreservada: true,
      });
      await capturar(pagina, "portal_configuracoes_" + largura);
    }
    await pagina.setViewportSize({ width: 1366, height: 900 });
    for (const rota of ["painel", "pacientes"]) {
      await pagina.goto("http://127.0.0.1:3000/" + rota);
      expect(
        await pagina.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
    }
    if (process.env.VIVA_CAPTURAR_INTERFACE === "true")
      await writeFile(
        resolve(pasta, "portal-responsivo.json"),
        JSON.stringify(
          { executadoEm: new Date().toISOString(), medidas },
          null,
          2,
        ),
      );
  } finally {
    await contexto.close();
  }
});
test("navegação permanece fora da rolagem em todas as telas consumidoras", async ({
  browser,
  request,
}) => {
  test.setTimeout(120000);
  const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
  const login = await request.post(api + "/api/v1/auth/login", {
    data: {
      email: "profissional.b@demo.vivamais.invalid",
      password: process.env.E2E_PASSWORD,
    },
  });
  expect(login.status()).toBe(200);
  const cabecalhos = {
    Authorization: "Bearer " + (await login.json()).accessToken,
  };
  const cadastro = await cadastrarComCodigo(request, cabecalhos, {
    displayName: "Pessoa Sintética Layout",
    modality: "APP",
  });
  const contexto = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const pagina = await contexto.newPage(),
    medidas = [];
  try {
    await pagina.goto("http://127.0.0.1:8081/acesso");
    await entrarNaTela(
      pagina,
      cadastro.cpf,
      "1950-01-01",
      cadastro.activationToken,
    );
    const rotas = [
      "inicio",
      "mensagens",
      "atividade-fisica",
      "atividade-fisica/historico",
      "atividade-fisica/orientacoes",
      "atividade-fisica/como-esta-hoje",
      "atividade-fisica/verificacao-pressao",
      "atividade-fisica/suas-informacoes",
      "atividade-fisica/atividade-hoje",
      "atividade-fisica/passo-a-passo",
      "atividade-fisica/video",
      "atividade-fisica/alternativa",
    ];
    for (const rota of rotas) {
      await pagina.goto("http://127.0.0.1:8081/" + rota);
      const barra = pagina.getByTestId("barra-navegacao"),
        rolagem = pagina.getByTestId("conteudo-rolavel");
      await expect(barra).toBeVisible();
      expect(
        await barra.evaluate(
          (elemento) =>
            elemento.closest('[data-testid="conteudo-rolavel"]') === null,
        ),
      ).toBe(true);
      const antes = await barra.boundingBox();
      await rolagem.evaluate((elemento) => {
        elemento.scrollTop = elemento.scrollHeight;
      });
      const depois = await barra.boundingBox(),
        conteudo = await rolagem.boundingBox();
      expect(Math.abs(antes!.y - depois!.y)).toBeLessThan(1);
      expect(conteudo!.y + conteudo!.height).toBeLessThanOrEqual(depois!.y + 1);
      medidas.push({ rota, barraForaDaRolagem: true, sobreposicao: false });
    }
    for (const [largura, altura] of [
      [320, 568],
      [375, 667],
      [430, 932],
    ]) {
      await pagina.setViewportSize({ width: largura!, height: altura! });
      await pagina.goto("http://127.0.0.1:8081/atividade-fisica");
      await expect(pagina.getByTestId("barra-navegacao")).toBeVisible();
      await pagina.getByTestId("conteudo-rolavel").evaluate((elemento) => {
        elemento.scrollTop = elemento.scrollHeight;
      });
      await expect(
        pagina.getByRole("button", {
          name: "Mensagens e orientações da atividade",
          exact: true,
        }),
      ).toBeInViewport();
      const barra = await pagina.getByTestId("barra-navegacao").boundingBox();
      expect(barra!.y + barra!.height).toBeLessThanOrEqual(altura! + 1);
      expect(
        await pagina.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
      ).toBe(false);
      await capturar(pagina, "app_atividade_" + largura);
    }
    if (process.env.VIVA_CAPTURAR_INTERFACE === "true")
      await writeFile(
        resolve(pasta, "navegacao-responsiva.json"),
        JSON.stringify(
          {
            executadoEm: new Date().toISOString(),
            medidas,
            largurasPequenas: [320, 375, 430],
            ensaioFisico: false,
          },
          null,
          2,
        ),
      );
  } finally {
    await contexto.close();
    await request.post(api + "/api/v1/auth/logout", { headers: cabecalhos });
  }
});
