// Exploratory probe of the ORIGINAL 0.1.2 build. Not part of the repo.
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/opt/node-tools/node_modules/");
const { chromium } = require("playwright");
const BASE = process.argv[2] ?? "http://localhost:4310/";
const OUT = process.argv[3] ?? "./before";
fs.mkdirSync(OUT, { recursive: true });
const FIXED = new Date("2026-10-03T12:00:00-06:00");
const browser = await chromium.launch();
const report = {};
async function page(w, h) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    timezoneId: "America/Mexico_City",
    locale: "es-MX",
    deviceScaleFactor: 2,
  });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(FIXED);
  await p.goto(BASE);
  await p.waitForSelector("text=Registrar gasto");
  await p.waitForTimeout(300);
  return p;
}
const overflow = (p) =>
  p.evaluate(() => {
    const vw = window.innerWidth;
    const over = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width && r.height && (r.right > vw + 1 || r.left < -1)) {
        const t = (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 50);
        if (el.children.length === 0 || el.getAttribute("role")) over.push({ t, right: Math.round(r.right) });
      }
    }
    return { vw, scrollW: document.documentElement.scrollWidth, over: over.slice(0, 8) };
  });

// 1. First payment row position at several sizes, light screenshots
for (const [w, h] of [[390, 844], [320, 568], [1440, 900]]) {
  const p = await page(w, h);
  const row = await p.getByRole("button", { name: /^Ver pago de/ }).first().boundingBox();
  const footer = await p.getByTestId("add-expense").boundingBox();
  report[`firstRow_${w}x${h}`] = { rowTop: Math.round(row.y), rowBottom: Math.round(row.y + row.height), actionTop: Math.round(footer.y), viewportH: h };
  await p.screenshot({ path: `${OUT}/mes-${w}x${h}-light.png` });
  // dark
  await p.getByRole("button", { name: "Activar modo oscuro" }).click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/mes-${w}x${h}-dark.png` });
  await p.context().close();
}

// 2. Focus ring colour in dark mode
{
  const p = await page(390, 844);
  await p.getByRole("button", { name: "Activar modo oscuro" }).click();
  await p.keyboard.press("Tab");
  await p.keyboard.press("Tab");
  report.focusRingDark = await p.evaluate(() => {
    const el = document.activeElement;
    const cs = getComputedStyle(el);
    return { label: el.getAttribute("aria-label") || el.textContent.slice(0, 40), outlineColor: cs.outlineColor, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, bodyBg: getComputedStyle(document.querySelector("#root > div") || document.body).backgroundColor };
  });
  await p.screenshot({ path: `${OUT}/focus-dark-390.png` });
  await p.context().close();
}

// 3. Initial focus + dialog name for settings and entry sheets
{
  const p = await page(390, 844);
  await p.getByRole("button", { name: "Ajustes" }).click();
  await p.waitForTimeout(400);
  report.settingsSheet = await p.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const a = document.activeElement;
    return { dialogName: d?.getAttribute("aria-label"), activeLabel: a?.getAttribute("aria-label") || a?.textContent?.slice(0, 40), activeRect: a?.getBoundingClientRect() };
  });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  report.afterEscapeSettings = await p.evaluate(() => ({ dialogs: document.querySelectorAll('[role="dialog"]').length, active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName }));
  await p.getByTestId("add-expense").click();
  await p.waitForTimeout(400);
  report.entrySheet = await p.evaluate(() => ({ dialogName: document.querySelector('[role="dialog"]')?.getAttribute("aria-label"), active: document.activeElement?.getAttribute("aria-label") }));
  await p.screenshot({ path: `${OUT}/entry-390x844-light.png` });
  // 4. Zero amount error: focus target and aria-invalid
  await p.getByRole("button", { name: "Guardar en Personal" }).click();
  await p.waitForTimeout(300);
  report.zeroAmountError = await p.evaluate(() => {
    const alert = document.querySelector('[role="alert"]');
    const input = document.querySelector('[aria-label="Importe del movimiento"]');
    return { alert: alert?.textContent, active: document.activeElement?.getAttribute("aria-label"), ariaInvalid: input?.getAttribute("aria-invalid"), describedBy: input?.getAttribute("aria-describedby") };
  });
  await p.screenshot({ path: `${OUT}/entry-error-390x844-light.png` });
  await p.context().close();
}

// 5. Escape from a payment sheet opened by keyboard: does focus return to the ✓ trigger?
{
  const p = await page(390, 844);
  const trigger = p.getByRole("button", { name: "Registrar pago de Internet" });
  await trigger.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(400);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  report.returnFocusAfterEscape = await p.evaluate(() => ({ dialogs: document.querySelectorAll('[role="dialog"]').length, active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName }));
  // 6. Focus kept across a re-render (window resize)?
  await p.getByRole("button", { name: "Registrar pago de Internet" }).focus();
  await p.setViewportSize({ width: 391, height: 844 });
  await p.waitForTimeout(300);
  report.focusAfterResize = await p.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName);
  await p.context().close();
}

// 7. "Ver los N" link when nothing is hidden (Casa · ejemplo has 2 pending)
{
  const p = await page(390, 844);
  await p.getByRole("button", { name: /Personal/ }).first().click();
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: /Casa · ejemplo/ }).click();
  await p.waitForTimeout(400);
  report.casaLink = await p.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((b) => b.textContent).filter((t) => /Ver los|Mostrar menos/.test(t)));
  await p.context().close();
}

// 8. Huge amount at 320 px
{
  const p = await page(320, 568);
  await p.getByTestId("add-expense").click();
  await p.waitForTimeout(300);
  await p.getByLabel("Importe del movimiento").fill("9999999999.99");
  await p.getByRole("button", { name: "Guardar en Personal" }).click();
  await p.waitForTimeout(500);
  report.hugeAmount320 = await overflow(p);
  await p.getByText("GASTO NETO DEL MES").scrollIntoViewIfNeeded();
  await p.screenshot({ path: `${OUT}/huge-amount-320.png` });
  await p.context().close();
}

// 9. "Última cuota" date picker offers "Sin fecha"?
{
  const p = await page(390, 844);
  await p.getByRole("tab", { name: /Recurrentes/ }).click();
  await p.getByRole("button", { name: "+ Agregar" }).click();
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "Cuota de deuda" }).click();
  await p.getByRole("button", { name: /Prueba, cancelación/ }).click();
  const dateButtons = p.getByRole("button", { name: "Elegir fecha" });
  const n = await dateButtons.count();
  await dateButtons.nth(n - 1).click();
  await p.waitForTimeout(200);
  report.lastInstalmentPicker = await p.evaluate(() => [...document.querySelectorAll('[role="button"]')].map((b) => b.textContent).filter((t) => /Sin fecha|Hoy|Escribir fecha/.test(t)));
  report.dateButtonNames = await p.evaluate(() => [...document.querySelectorAll('[role="button"]')].filter((b) => /Elegir fecha/.test(b.textContent)).map((b) => b.getAttribute("aria-label")));
  await p.context().close();
}

// 10. Desktop FAB wrapper crop and other tabs
{
  const p = await page(1440, 900);
  await p.screenshot({ path: `${OUT}/fab-1440.png`, clip: { x: 1100, y: 760, width: 340, height: 140 } });
  await p.getByRole("tab", { name: /Recurrentes/ }).click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/recurrentes-1440x900-light.png` });
  await p.context().close();
}
for (const tab of ["Recurrentes", "Movimientos"]) {
  const p = await page(390, 844);
  await p.getByRole("tab", { name: new RegExp(tab) }).click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/${tab.toLowerCase()}-390x844-light.png` });
  report[`rows_${tab}`] = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('[role="button"]')].filter((b) => /^(Detalle de|Editar )/.test(b.getAttribute("aria-label") || ""));
    return rows.slice(0, 3).map((r) => Math.round(r.getBoundingClientRect().height));
  });
  await p.context().close();
}
await browser.close();
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
