import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
const mobile = "http://127.0.0.1:8081";
test("Expo: ativação, plano real, fila offline, OCR confirmado e refeição privada", async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(120000);
  const password = process.env.E2E_PASSWORD;
  test.skip(!password, "Defina credencial sintética no ambiente.");
  const login = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "profissional.a@demo.vivamais.invalid", password },
  });
  expect(login.status()).toBe(200);
  const pro = await login.json();
  const headers = { Authorization: `Bearer ${pro.accessToken}` };
  const email = `mobile-${Date.now()}@demo.invalid`;
  const created = await request.post(`${api}/api/v1/patients`, {
    headers,
    data: { displayName: "Pessoa Sintética Mobile", email, modality: "APP" },
  });
  expect(created.status()).toBe(200);
  const { patient, activationToken } = await created.json();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  expect(
    (
      await request.post(`${api}/api/v1/patients/${patient.id}/medications`, {
        headers,
        data: {
          name: "Plano compartilhado E2E",
          instruction: "Instrução sintética de teste",
          startsOn: date,
          endsOn: null,
          timeZone: "America/Sao_Paulo",
          schedules: ["08:00", "20:00"],
        },
      })
    ).status(),
  ).toBe(200);
  await page.goto(mobile);
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Ativar conta ou usar código de recuperação",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Código de ativação", { exact: true })
    .fill(activationToken);
  await page.getByLabel("Nova senha", { exact: true }).fill(password!);
  await page.getByLabel("Confirme a senha", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "Ativar conta", exact: true }).click();
  await page
    .getByRole("button", { name: "Ir para entrar", exact: true })
    .click();
  await expect(page).toHaveURL(`${mobile}/login`);
  await page.getByRole("textbox", { name: "E-mail", exact: true }).fill(email);
  await page
    .getByLabel("Senha", { exact: true })
    .filter({ visible: true })
    .fill(password!);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(`${mobile}/home`);
  await page.getByTestId("module-medications").click();
  await expect(
    page.getByText("Plano compartilhado E2E", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Sem confirmação", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Tomei", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("Tomei (autorrelato)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Sem confirmação", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await page.getByTestId("module-blood-pressure").click();
  await expect(
    page.getByRole("heading", { name: "Registrar pressão", exact: true }),
  ).toBeVisible();
  const writes: string[] = [];
  await page.route("**/api/v1/patients/*/readings", async (route) => {
    if (route.request().method() === "POST") {
      writes.push(route.request().postData() || "");
      await route.abort("internetdisconnected");
    } else await route.continue();
  });
  await page.getByLabel("Sistólica", { exact: true }).fill("11");
  await page.getByLabel("Diastólica", { exact: true }).fill("7");
  await page
    .getByRole("button", { name: "Salvar pressão", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("confirme");
  await page
    .getByRole("button", { name: "Confirmar estes valores", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar pressão", exact: true })
    .click();
  await expect(
    page.getByText("Registro protegido na fila. Aguardando envio para a API.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(writes.length).toBeGreaterThan(0);
  await page.unroute("**/api/v1/patients/*/readings");
  await page
    .getByRole("button", { name: "Sincronizar agora", exact: true })
    .click();
  await expect(page.getByText("110 / 70 mmHg", { exact: true })).toBeVisible();
  await expect(
    page.getByText("0 registros pendentes de sincronização", { exact: true }),
  ).toBeVisible();
  const readings = await request.get(
    `${api}/api/v1/patients/${patient.id}/readings`,
    { headers },
  );
  expect((await readings.json()).total).toBe(1);
  // Simulate a lost acknowledgement: resend the exact operation, as a professional cannot impersonate its original actor.
  const patientLogin = await request.post(`${api}/api/v1/auth/login`, {
    data: { email, password },
  });
  const own = await patientLogin.json();
  const ownHeaders = { Authorization: `Bearer ${own.accessToken}` };
  expect(
    (
      await request.post(`${api}/api/v1/patients/${patient.id}/readings`, {
        headers: ownHeaders,
        data: JSON.parse(writes[0]!),
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await (
        await request.get(`${api}/api/v1/patients/${patient.id}/readings`, {
          headers,
        })
      ).json()
    ).total,
  ).toBe(1);
  // Real Tesseract OCR, using a synthetic image of a device display.
  const image =
    process.env.E2E_OCR_IMAGE || "tests/fixtures/pressure-display.png";
  expect(
    image,
    "Defina E2E_OCR_IMAGE para a imagem sintética de visor",
  ).toBeTruthy();
  const imageBytes = await readFile(image!);
  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page
      .getByRole("button", { name: "Escolher foto da galeria", exact: true })
      .click(),
  ]);
  await chooser.setFiles({
    name: "visor-sintetico.png",
    mimeType: "image/png",
    buffer: imageBytes,
  });
  await page
    .getByRole("button", { name: "Enviar foto para OCR", exact: true })
    .click();
  await expect(
    page.getByText(
      "OCR concluído. Confira os números no formulário e confirme antes de salvar.",
      { exact: true },
    ),
  ).toBeVisible({ timeout: 45000 });
  await expect(page.getByLabel("Sistólica", { exact: true })).toHaveValue(
    "118",
  );
  expect(
    (
      await (
        await request.get(`${api}/api/v1/patients/${patient.id}/readings`, {
          headers,
        })
      ).json()
    ).total,
  ).toBe(1);
  await page
    .getByRole("button", { name: "Confirmar estes valores", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Salvar pressão", exact: true })
    .click();
  await expect(page.getByText("118 / 76 mmHg", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar ao início", exact: true })
    .click();
  await page.getByTestId("module-food").click();
  const [mealChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page
      .getByRole("button", { name: "Escolher foto da galeria", exact: true })
      .click(),
  ]);
  await mealChooser.setFiles({
    name: "refeicao-sintetica.png",
    mimeType: "image/png",
    buffer: imageBytes,
  });
  await page
    .getByRole("button", { name: "Enviar refeição e foto", exact: true })
    .click();
  await expect(
    page.getByText("Foto privada e refeição salvas.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Foto privada da refeição", exact: true }),
  ).toBeVisible();
  const mealPage = await (
    await request.get(`${api}/api/v1/patients/${patient.id}/meals`, { headers })
  ).json();
  expect(mealPage.total).toBe(1);
  const meal = mealPage.items[0];
  const analysis = await (
    await request.post(`${api}/api/v1/meals/${meal.id}/analyze`, {
      headers: ownHeaders,
      data: {},
    })
  ).json();
  expect(analysis.providerCalled).toBe(false);
  expect(analysis.status).toBe("UNAVAILABLE");
  const foreign = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "paciente.b@demo.vivamais.invalid", password },
  });
  const other = await foreign.json();
  expect(
    (
      await request.post(`${api}/api/v1/files/${meal.fileId}/link`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
        data: {},
      })
    ).status(),
  ).toBe(403);
  // Portal uses the same protected photo through its BFF.
  await context.addCookies([
    {
      name: "viva_session",
      value: pro.accessToken,
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
  const portal = await context.newPage();
  await portal.goto(`http://127.0.0.1:3000/pacientes/${patient.id}`);
  await expect(
    portal.getByText("110 / 70 mmHg", { exact: true }),
  ).toBeVisible();
  await expect(
    portal.getByText("118 / 76 mmHg", { exact: true }),
  ).toBeVisible();
  await expect(
    portal.getByRole("img", { name: "Foto privada de refeição sintética" }),
  ).toBeVisible();
  await portal.getByRole("button", { name: "Sair", exact: true }).click();
  for (const token of [pro.accessToken, own.accessToken, other.accessToken])
    await request.post(`${api}/api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    });
});
