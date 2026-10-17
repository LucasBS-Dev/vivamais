import { test, expect } from "@playwright/test";
test("cadastro no portal, ativação e leitura compartilhada persistem na API", async ({
  page,
  request,
}) => {
  const password = process.env.E2E_PASSWORD;
  test.skip(!password, "Senha de teste definida no ambiente.");
  const email = `pessoa-${Date.now()}@demo.invalid`;
  await page.goto("/");
  await page
    .getByLabel("E-mail institucional")
    .fill("profissional.a@demo.vivamais.invalid");
  await page.getByLabel("Senha", { exact: true }).fill(password!);
  await page
    .getByRole("button", { name: "Entrar na plataforma", exact: true })
    .click();
  await expect(page).toHaveURL(/\/painel$/);
  await page
    .getByRole("link", { name: "Cadastrar paciente", exact: true })
    .click();
  await page.getByLabel("Nome completo").fill("Pessoa Teste Cadastro");
  await page.getByLabel("E-mail de ativação").fill(email);
  await page
    .getByRole("button", { name: "Salvar paciente", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Paciente cadastrado" }),
  ).toBeVisible();
  const code = await page.getByLabel("Código de ativação").inputValue();
  const href = await page
    .getByRole("link", { name: "Abrir ficha do paciente" })
    .getAttribute("href");
  const patientId = href!.split("/").pop()!;
  const api = process.env.API_BASE_URL || "http://127.0.0.1:8080";
  const active = await request.post(`${api}/api/v1/auth/activate`, {
    data: { token: code, password },
  });
  expect(active.status()).toBe(204);
  const login = await request.post(`${api}/api/v1/auth/login`, {
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  const auth = await login.json();
  const reading = {
    id: crypto.randomUUID(),
    systolic: 118,
    diastolic: 76,
    pulse: 71,
    measuredAt: new Date(Date.now() - 60000).toISOString(),
    source: "MANUAL",
  };
  for (let i = 0; i < 2; i++)
    expect(
      (
        await request.post(`${api}/api/v1/patients/${patientId}/readings`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          data: reading,
        })
      ).status(),
    ).toBe(200);
  await page.getByRole("link", { name: "Abrir ficha do paciente" }).click();
  await expect(
    page.getByRole("heading", { name: "Histórico da pressão", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("118 / 76 mmHg", { exact: true })).toBeVisible();
  await expect(page.locator(".care-table tbody tr")).toHaveCount(1);
  await page.getByRole("tab", { name: "Medicamentos", exact: true }).click();
  await page.getByLabel("Nome do medicamento").fill("Plano Sintético E2E");
  await page
    .getByLabel("Dose e instrução profissional")
    .fill("Instrução fictícia da equipe");
  await page
    .getByLabel("Horários separados por vírgula, ex.: 08:00, 20:00")
    .fill("08:00, 20:00");
  await page
    .getByRole("button", { name: "Salvar registro", exact: true })
    .click();
  await expect(
    page.getByText("Plano Sintético E2E", { exact: true }).first(),
  ).toBeVisible();
  const plans = await request.get(
    `${api}/api/v1/patients/${patientId}/medications`,
    { headers: { Authorization: `Bearer ${auth.accessToken}` } },
  );
  expect(plans.status()).toBe(200);
  expect((await plans.json())[0].name).toBe("Plano Sintético E2E");
  const denied = await request.post(`${api}/api/v1/auth/login`, {
    data: { email: "profissional.b@demo.vivamais.invalid", password },
  });
  const other = await denied.json();
  expect(
    (
      await request.get(`${api}/api/v1/patients/${patientId}/readings`, {
        headers: { Authorization: `Bearer ${other.accessToken}` },
      })
    ).status(),
  ).toBe(403);
  for (const accessToken of [auth.accessToken, other.accessToken])
    await request.post(`${api}/api/v1/auth/logout`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  await page.getByRole("button", { name: "Sair", exact: true }).click();
});
