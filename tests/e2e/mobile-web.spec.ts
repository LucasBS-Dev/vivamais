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
  const email =
    process.env.E2E_PATIENT_EMAIL || "paciente.a@demo.vivamais.invalid";
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto(mobileBaseURL);
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await expect(page).toHaveURL(`${mobileBaseURL}/login`);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(password!);
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/v1/auth/login" &&
      response.request().method() === "POST",
  );
  const identityResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/v1/patients/me" &&
      response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status()).toBe(200);
  const auth: {
    accessToken: string;
    user: { displayName: string; role: string; organizationId: string };
  } = await loginResponse.json();
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

  await expect(page).toHaveURL(`${mobileBaseURL}/home`);
  await expect(
    page.getByRole("heading", {
      name: `Olá, ${auth.user.displayName}.`,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("✓ Conexão com a API confirmada", { exact: true }),
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
  await expect(
    page.getByRole("heading", { name: "Registrar pressão", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Sistólica",{exact:true})).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  const apiOrigin = new URL(loginResponse.url()).origin;
  const logoutResponsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${apiOrigin}/api/v1/auth/logout` &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Sair da minha conta", exact: true })
    .click();
  expect((await logoutResponsePromise).status()).toBe(204);
  await expect(page).toHaveURL(`${mobileBaseURL}/login`);
  await expect(
    page.getByText("Sessão encerrada.", { exact: true }),
  ).toBeVisible();
  const revoked = await request.get(`${apiOrigin}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  expect(revoked.status()).toBe(401);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Vamos entrar?", exact: true }),
  ).toBeVisible();
  await page.goto(`${mobileBaseURL}/home`);
  await expect(page).toHaveURL(`${mobileBaseURL}/login`);
  expect(browserErrors).toEqual([]);
});
