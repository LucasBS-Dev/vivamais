import { cadastrarComCodigo, entrarNaTela } from "./apoio-acesso-paciente";
import { expect, test } from "@playwright/test";

const mobileBaseURL = "http://127.0.0.1:8081";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test("preview Expo entrega rotas e bloqueia arquivos fora do bundle", async ({
  request,
}) => {
  const route = await request.get(`${mobileBaseURL}/home`);
  expect(route.status()).toBe(200);
  expect(route.headers()["content-type"]).toContain("text/html");
  expect(route.headers()["cache-control"]).toBe("no-store");
  const traversal = await request.get(
    `${mobileBaseURL}/..%2f..%2fpackage.json`,
  );
  expect(traversal.status()).toBe(403);
  const hidden = await request.get(`${mobileBaseURL}/.env`);
  expect(hidden.status()).toBe(403);
  const missingAsset = await request.get(`${mobileBaseURL}/missing-asset.js`);
  expect(missingAsset.status()).toBe(404);
});

test("paciente usa o Expo web com API real e encerra a sessão revogada", async ({
  page,
  request,
}) => {
  const password = process.env.E2E_PASSWORD;
  test.skip(
    !password,
    "Defina E2E_PASSWORD fora do repositório para testar a API real.",
  );
  const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
  const loginProfissional = await request.post(api + "/api/v1/auth/login", {
    data: { email: "profissional.a@demo.vivamais.invalid", password },
  });
  expect(loginProfissional.status()).toBe(200);
  const profissional = await loginProfissional.json();
  const criado = await cadastrarComCodigo(
    request,
    { Authorization: "Bearer " + profissional.accessToken },
    { displayName: "Pessoa Sintetica Expo", modality: "APP" },
  );
  const browserErrors: string[] = [];
  page.on("pageerror", (erro) => browserErrors.push(erro.message));
  const identityResponsePromise = page.waitForResponse(
    (resposta) =>
      new URL(resposta.url()).pathname === "/api/v1/patients/me" &&
      resposta.request().method() === "GET",
  );
  const auth = await entrarNaTela(
    page,
    criado.cpf,
    criado.dataNascimento,
    criado.activationToken,
  );
  // Keep credentials and tokens out of assertion output, traces and screenshots.
  expect(
    typeof auth.accessToken === "string" && auth.accessToken.length > 0,
  ).toBe(true);
  expect(auth.user.role).toBe("PATIENT");
  const identityResponse = await identityResponsePromise;
  expect(identityResponse.status()).toBe(200);
  const patient: { organizationId: string; modality: string } =
    await identityResponse.json();
  expect(patient.organizationId).toBe(auth.user.organizationId);
  expect(patient.modality).toBe("APP");

  await expect(page).toHaveURL(`${mobileBaseURL}/inicio`);
  await expect(
    page.getByRole("heading", {
      name: `Olá, ${auth.user.displayName.split(" ")[0]}!`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("✓ Conectado à sua equipe", { exact: false }),
  ).toBeVisible();
  for (const title of [
    "Minha Pressão",
    "Meus Medicamentos",
    "Minha Alimentação",
    "Atividade Física",
  ]) {
    await expect(
      page.getByRole("button", {
        name: `${title}. Abrir módulo.`,
        exact: true,
      }),
    ).toBeVisible();
  }
  const persistedToken = await page.evaluate(
    (token) =>
      [...Object.values(localStorage), ...Object.values(sessionStorage)].some(
        (value) => value.includes(token),
      ),
    auth.accessToken,
  );
  expect(persistedToken).toBe(false);

  await page.getByTestId("module-blood-pressure").click();
  await expect(
    page.getByRole("heading", { name: "Minha Pressão", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Digitar os valores", exact: true })
    .click();
  await expect(page.getByLabel("Sistólica", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar à pressão", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  const apiOrigin = new URL(api).origin;
  const logoutResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${apiOrigin}/api/v1/auth/logout` &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Sair da minha conta", exact: true })
    .click();
  expect((await logoutResponsePromise).status()).toBe(204);
  await expect(page).toHaveURL(`${mobileBaseURL}/acesso`);
  await expect(
    page.getByText("Sessão encerrada. Seu aparelho continua autorizado.", {
      exact: true,
    }),
  ).toBeVisible();
  const revoked = await request.get(`${apiOrigin}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  expect(revoked.status()).toBe(401);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Entrar no Viva+", exact: true }),
  ).toBeVisible();
  await page.goto(`${mobileBaseURL}/home`);
  await expect(page).toHaveURL(`${mobileBaseURL}/acesso`);
  expect(browserErrors).toEqual([]);
});

test("rotas internas do aplicativo exigem sessão sem carregamento infinito", async ({
  page,
}) => {
  for (const rota of [
    "/inicio",
    "/pressao",
    "/pressao/digitar",
    "/pressao/foto",
    "/pressao/resultado",
    "/pressao/historico",
    "/medicamentos",
    "/alimentacao",
    "/alimentacao/resultado",
    "/atividade-fisica",
    "/atividade-fisica/ilustracoes",
    "/atividade-fisica/historico",
    "/atividade-fisica/como-esta-hoje",
    "/atividade-fisica/verificacao-pressao",
    "/atividade-fisica/suas-informacoes",
    "/atividade-fisica/atividade-hoje",
    "/atividade-fisica/passo-a-passo",
    "/atividade-fisica/video",
    "/atividade-fisica/alternativa",
    "/atividade-fisica/registro",
    "/atividade-fisica/orientacoes",
    "/perfil",
    "/historico",
    "/lembretes",
    "/mensagens",
    "/configuracoes",
    "/home",
    "/profile",
    "/history",
    "/module/activity",
  ]) {
    await page.goto(`${mobileBaseURL}${rota}`);
    await expect(page).toHaveURL(`${mobileBaseURL}/acesso`);
    await expect(page.getByLabel("CPF", { exact: true })).toBeVisible();
  }
});
