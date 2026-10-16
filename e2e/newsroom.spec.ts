import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
const suffix = randomUUID().slice(0, 8),
  password = randomUUID() + randomUUID(),
  admin = `admin-${suffix}@example.test`,
  editor = `editor-${suffix}@example.test`;
test("Configuração, equipe, produção, revisão e publicação pelo navegador", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Seu nome")).toBeVisible();
  await page.getByLabel("Seu nome").fill("Admin da Redação");
  await page.getByLabel("E-mail profissional").fill(admin);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Criar ambiente" }).click();
  await expect(page.getByRole("heading", { name: /Olá,/ })).toBeVisible();
  await page.goto("/admin");
  await page.getByRole("button", { name: "Adicionar pessoa" }).click();
  await page.getByLabel("Nome", { exact: true }).fill("Editora de Política");
  await page.getByLabel("E-mail", { exact: true }).fill(editor);
  await page.getByLabel("Senha inicial").fill(password);
  await page.getByLabel("Papel").selectOption("editor");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: /Admin da Redação/ }).click();
  await page.getByRole("button", { name: "Sair da conta" }).click();
  await page.getByLabel("E-mail profissional").fill(editor);
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar na redação" }).click();
  await expect(page.getByRole("heading", { name: /Olá,/ })).toBeVisible();
  await page.goto("/pautas");
  await page.getByRole("button", { name: "Nova pauta" }).click();
  await page.getByLabel("Título da pauta").fill("Cobertura do novo parque municipal");
  await page
    .getByLabel("Briefing")
    .fill("Entrevistar moradores e verificar cronograma e orçamento da obra.");
  await page.getByLabel("Editor responsável").selectOption({ label: "Editora de Política" });
  await page.getByLabel("Prazo editorial").fill("2027-01-20T18:00");
  await page.getByRole("button", { name: "Criar pauta", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "Cobertura do novo parque municipal", exact: true }).click();
  await page.getByRole("button", { name: "Escrever matéria" }).click();
  await expect(page.getByRole("heading", { name: "Workspace da matéria" })).toBeVisible();
  await page
    .getByLabel("Linha fina", { exact: true })
    .fill("Moradores acompanham a transformação do bairro.");
  await page
    .getByLabel("Corpo da matéria")
    .fill(
      "A comunidade acompanha a implantação do novo parque municipal. A reportagem confirmou as informações com os responsáveis pela obra.",
    );
  await page
    .getByLabel("Resumo SEO")
    .fill("Entenda o projeto do novo parque municipal e os próximos passos da implantação.");
  await expect(page.getByText("Salvo no servidor", { exact: true })).toBeVisible({
    timeout: 15000,
  });
  for (const label of ["Em redação", "Aguardando revisão", "Aprovada", "Publicar no site local"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Confirmar transição" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  const href = await page
    .getByRole("link", { name: /Abrir página publicada/ })
    .getAttribute("href");
  await page.goto(href!);
  await expect(
    page.getByRole("heading", { name: "Cobertura do novo parque municipal" }),
  ).toBeVisible();
  await expect(page.getByText(/A comunidade acompanha/)).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Olá,/ })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  mkdirSync("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/dashboard.png", fullPage: true });
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
test("Login responsivo nas oito resoluções especificadas", async ({ page }) => {
  for (const [width, height] of [
    [320, 568],
    [375, 667],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1366, 768],
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/login");
    await expect(page.getByLabel("E-mail profissional")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
