// Runs in CI against the production build served by the Express server.
import { expect, test } from "@playwright/test";

test("a customer files a claim end to end", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Harbour Insurance claims" })).toBeVisible();
  await expect(page.getByRole("table")).toContainText("CL-2026-0005");
  await page.screenshot({ path: `e2e-shots/${process.env.DEMO ? "demo-" : ""}claims.png`, fullPage: true });

  await page.getByRole("button", { name: "New claim" }).click();
  await page.getByRole("button", { name: "Submit claim" }).click();
  await expect(page.getByRole("alert")).toContainText("Please fix 4 fields");
  await page.screenshot({ path: `e2e-shots/${process.env.DEMO ? "demo-" : ""}form-errors.png`, fullPage: true });

  await page.getByLabel("Policy").selectOption("HB-1001");
  await page.getByLabel("What is the claim for?").selectOption("Vision");
  await page.getByLabel("Date of the expense").fill(new Date().toLocaleDateString("en-CA"));
  await page.getByLabel("Amount (CAD)").fill("99.99");
  await page.getByRole("button", { name: "Submit claim" }).click();
  await expect(page.getByRole("status").first()).toContainText("was submitted");
  await expect(page.getByRole("table")).toContainText("CL-2026-0006");
});
