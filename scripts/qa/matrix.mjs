// QA reproducible de la exportación web (no sustituye pruebas en teléfonos).
// Uso: npm run build && npm run qa [-- --out docs/qa --shots]
// Requiere Chromium de Playwright 1.56.1 (npx playwright install chromium).
// Reloj fijo: 3 oct 2026 12:00, America/Mexico_City, es-MX.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import axe from "axe-core";

const args = process.argv.slice(2);
const OUT = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : "docs/qa";
const SHOTS = args.includes("--shots");
const DIST = path.resolve("dist");
const FIXED = new Date("2026-10-03T12:00:00-06:00");
fs.mkdirSync(path.join(OUT, "despues"), { recursive: true });

// Servidor estático mínimo para dist/ (SPA).
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let file = path.join(DIST, url);
  if (
    !file.startsWith(DIST) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  )
    file = path.join(DIST, "index.html");
  res.writeHead(200, {
    "content-type": types[path.extname(file)] ?? "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
const report = {
  generated: new Date().toISOString(),
  fixedClock: FIXED.toISOString(),
  base: "dist/ (exportación web)",
  layout: [],
  firstRow: [],
  sheets: [],
  flows: {},
  axe: [],
  errors: [],
};

async function open({ w, h, scheme = "light", at = FIXED }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    timezoneId: "America/Mexico_City",
    locale: "es-MX",
    colorScheme: scheme,
    deviceScaleFactor: SHOTS ? 2 : 1,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.errors.push(`${w}x${h} ${scheme}: ${e}`));
  page.on(
    "console",
    (m) =>
      m.type() === "error" &&
      report.errors.push(`${w}x${h} ${scheme}: ${m.text()}`),
  );
  await page.clock.setFixedTime(at);
  await page.goto(BASE);
  await page.getByTestId("add-expense").first().waitFor();
  await page.waitForTimeout(250);
  return page;
}
const close = (page) => page.context().close();
const shot = async (page, name) =>
  SHOTS && page.screenshot({ path: path.join(OUT, "despues", `${name}.png`) });

/** Desborde horizontal y objetivos táctiles < 48 en lo visible. */
const audit = (page) =>
  page.evaluate(() => {
    const vw = innerWidth;
    const label = (el) =>
      (el.getAttribute("aria-label") || el.textContent || el.tagName)
        .trim()
        .slice(0, 60);
    const shown = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        cs.visibility !== "hidden" &&
        cs.display !== "none" &&
        cs.opacity !== "0"
      );
    };
    const overflow = [];
    for (const el of document.querySelectorAll("body *")) {
      if (el.children.length || !shown(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1)
        overflow.push({
          label: label(el),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
    }
    const small = [];
    for (const el of document.querySelectorAll(
      "[role=button],[role=radio],[role=checkbox],[role=switch],[role=tab],input,textarea",
    )) {
      if (!shown(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 47.5 || r.height < 47.5)
        small.push({
          label: label(el),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
    }
    return {
      scrollWidth: document.documentElement.scrollWidth,
      vw,
      overflow: overflow.slice(0, 6),
      overflowCount: overflow.length,
      small: small.slice(0, 6),
      smallCount: small.length,
    };
  });

const tab = async (page, name) => {
  await page.getByRole("tab", { name }).first().click();
  await page.waitForTimeout(150);
};

// 1. Matriz de reflujo: pantallas × anchos × temas.
const widths = [
  320, 379, 381, 390, 430, 768, 800, 959, 961, 1024, 1199, 1201, 1440,
];
for (const scheme of ["light", "dark"])
  for (const w of widths) {
    const h = w === 320 ? 568 : w >= 961 ? 900 : 844;
    const page = await open({ w, h, scheme });
    for (const screen of ["Mes", "Recurrentes", "Movimientos"]) {
      await tab(page, screen);
      report.layout.push({ screen, w, h, scheme, ...(await audit(page)) });
      if ([320, 390, 1440].includes(w))
        await shot(page, `${screen.toLowerCase()}-${w}x${h}-${scheme}`);
    }
    await close(page);
  }
// Zoom del 200 % emulado como viewport CSS a la mitad (1280×800 → 640×400) y
// teléfono corto (390×390). No equivale a la escala de texto del sistema.
for (const [w, h, note] of [
  [640, 400, "zoom 200 % emulado (1280×800)"],
  [390, 390, "altura reducida"],
]) {
  const page = await open({ w, h });
  for (const screen of ["Mes", "Recurrentes", "Movimientos"]) {
    await tab(page, screen);
    report.layout.push({
      screen,
      w,
      h,
      scheme: "light",
      note,
      ...(await audit(page)),
    });
  }
  await shot(page, `mes-${w}x${h}-light`);
  await close(page);
}

// 2. Próximo pago visible al abrir (Mes, teléfono).
for (const [w, h] of [
  [320, 568],
  [390, 844],
  [430, 932],
  [390, 667],
]) {
  const page = await open({ w, h });
  const row = await page
    .getByRole("button", { name: /^Ver detalle\./ })
    .first()
    .boundingBox();
  const action = await page.getByTestId("add-expense").first().boundingBox();
  report.firstRow.push({
    w,
    h,
    rowTop: Math.round(row.y),
    rowBottom: Math.round(row.y + row.height),
    actionTop: Math.round(action.y - 8),
    visibleOnOpen: row.y + row.height <= action.y - 8,
  });
  await close(page);
}

// 3. Hojas: nombre accesible, foco inicial, acción final visible, reflujo.
const sheets = {
  "Registrar gasto": (p) => p.getByTestId("add-expense").first().click(),
  "Registrar pago": (p) =>
    p.getByRole("button", { name: /^Registrar pago de Laptop/ }).click(),
  iCloud: (p) =>
    p.getByRole("button", { name: /^Ver detalle\. iCloud/ }).click(),
  "Nuevo recurrente": async (p) => {
    await tab(p, "Recurrentes");
    await p.getByRole("button", { name: "Agregar recurrente" }).click();
  },
  "Ajustes de la prueba": (p) =>
    p.getByRole("button", { name: "Ajustes de la prueba" }).first().click(),
};
for (const [w, h, scheme] of [
  [320, 568, "light"],
  [390, 844, "light"],
  [390, 390, "light"],
  [1440, 900, "dark"],
])
  for (const [title, openSheet] of Object.entries(sheets)) {
    const page = await open({ w, h, scheme });
    await openSheet(page);
    await page.waitForTimeout(450);
    const info = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const a = document.activeElement;
      const r = a?.getBoundingClientRect();
      return {
        dialogName: d?.getAttribute("aria-label"),
        active: (
          a?.getAttribute("aria-label") ||
          a?.textContent ||
          a?.tagName ||
          ""
        )
          .trim()
          .slice(0, 50),
        activeIsFullScreen:
          !!r && r.width >= innerWidth && r.height >= innerHeight,
      };
    });
    const footer = page
      .locator('[role="dialog"]')
      .getByRole("button", {
        name: /^(Guardar|Registrar pago del|Agregar recurrente)/,
      })
      .first();
    const fb = (await footer.count()) ? await footer.boundingBox() : null;
    report.sheets.push({
      sheet: title,
      w,
      h,
      scheme,
      ...info,
      primaryVisible: fb ? fb.y >= 0 && fb.y + fb.height <= h : null,
      ...(await audit(page)),
    });
    if ((w === 390 && h === 844) || w === 1440 || (w === 390 && h === 390))
      await shot(
        page,
        `sheet-${title.replace(/\s+/g, "-").toLowerCase()}-${w}x${h}-${scheme}`,
      );
    await close(page);
  }

// 4. Teclado y foco.
{
  const page = await open({ w: 390, h: 844, scheme: "dark" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const a = document.activeElement;
    const cs = getComputedStyle(a);
    return {
      label: a.getAttribute("aria-label") || a.textContent,
      outlineColor: cs.outlineColor,
      outlineStyle: cs.outlineStyle,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });
  report.flows.focusRingDark = ring;
  const trigger = page.getByRole("button", {
    name: /^Registrar pago de Internet/,
  });
  // Abrir y cerrar sin cambios no pide confirmación (también la primera vez).
  await page.getByTestId("add-expense").first().click();
  await page.waitForTimeout(350);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  report.flows.closeUnchangedFirstTime = {
    dialogsAfterEscape: await page.locator('[role="dialog"]').count(),
  };
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const inDialog = await page.evaluate(() =>
    document.querySelector('[role="dialog"]')?.contains(document.activeElement),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  report.flows.escapeReturnsFocus = {
    focusInsideDialogWhileOpen: inDialog,
    dialogsAfterEscape: await page.locator('[role="dialog"]').count(),
    activeAfter: await page.evaluate(() =>
      document.activeElement?.getAttribute("aria-label"),
    ),
  };
  await trigger.focus();
  await page.setViewportSize({ width: 391, height: 844 });
  await page.waitForTimeout(300);
  report.flows.focusSurvivesResize = await page.evaluate(() =>
    document.activeElement?.getAttribute("aria-label"),
  );
  await close(page);
}

// 5. Errores: conservan lo escrito, se asocian al campo y reciben foco.
{
  const page = await open({ w: 390, h: 844 });
  await page.getByTestId("add-expense").first().click();
  await page.waitForTimeout(300);
  await page.locator("[role=dialog]").getByLabel("Importe en MXN").fill("0");
  await page.getByRole("radio", { name: "Transporte", exact: true }).click();
  await page.getByTestId("save-entry").click();
  await page.waitForTimeout(300);
  report.flows.zeroAmount = await page.evaluate(() => {
    const input = document.querySelector('[aria-label="Importe en MXN"]');
    const described = input?.getAttribute("aria-describedby");
    return {
      alert: document.querySelector('[role="alert"]')?.textContent,
      focusOnAmount: document.activeElement === input,
      ariaInvalid: input?.getAttribute("aria-invalid"),
      describedByText: described
        ? document.getElementById(described)?.textContent
        : null,
      categoryKept: [
        ...document.querySelectorAll('[role="radio"][aria-checked="true"]'),
      ].map((r) => r.textContent),
    };
  });
  await shot(page, "error-zero-amount-390x844-light");
  await close(page);
}
{
  const page = await open({ w: 320, h: 568 });
  await tab(page, "Recurrentes");
  await page.getByRole("button", { name: "Agregar recurrente" }).click();
  await page
    .locator("[role=dialog]")
    .getByLabel("Nombre", { exact: true })
    .fill("Prueba de fechas");
  await page
    .locator("[role=dialog]")
    .getByLabel("Importe previsto")
    .fill("100");
  await page.getByRole("button", { name: /^Próximo cobro/ }).click();
  await page.getByRole("button", { name: "Escribir fecha" }).click();
  const manual = page
    .locator("[role=dialog]")
    .getByLabel("Próximo cobro, formato año-mes-día");
  const results = {};
  for (const value of ["2026-", "2026-02-30", "2101-01-01", "1899-12-31"]) {
    await manual.fill(value);
    await page.getByTestId("save-recurring").click();
    await page.waitForTimeout(200);
    results[value] = {
      shown: await page
        .getByRole("button", { name: /^Próximo cobro/ })
        .getAttribute("aria-label"),
      error: await page
        .locator('[role="alert"]')
        .first()
        .textContent()
        .catch(() => null),
    };
  }
  report.flows.partialAndInvalidDates = {
    ...results,
    scrollWidth: (await audit(page)).scrollWidth,
  };
  await close(page);
}

// 6. Extremos: importe máximo y nombre de 120 caracteres a 320 px.
{
  const page = await open({ w: 320, h: 568 });
  await page.getByTestId("add-expense").first().click();
  await page
    .locator("[role=dialog]")
    .getByLabel("Importe en MXN")
    .fill("9999999999.99");
  await page.getByRole("button", { name: /^Detalles/ }).click();
  await page
    .locator("[role=dialog]")
    .getByLabel("Nombre", { exact: true })
    .fill("N".repeat(60) + " " + "x".repeat(59));
  await page.getByTestId("save-entry").click();
  await page.waitForTimeout(400);
  const hero = await page.evaluate(() => {
    const el = [...document.querySelectorAll("div")].findLast(
      (d) =>
        d.textContent === "$10,000,003,129.49" ||
        d.textContent?.startsWith("$10,000,003,129"),
    );
    const r = el?.getBoundingClientRect();
    const fs = el ? parseFloat(getComputedStyle(el).fontSize) : 0;
    return {
      text: el?.textContent,
      height: r && Math.round(r.height),
      fontSize: fs,
      singleLine: !!r && r.height < fs * 1.9,
    };
  });
  report.flows.extremeAmount = { hero, ...(await audit(page)) };
  await shot(page, "extreme-amount-320x568-light");
  await tab(page, "Movimientos");
  report.flows.longName = await audit(page);
  await shot(page, "long-name-320x568-light");
  await close(page);
}

// 7. Recorridos de dominio desde la interfaz.
{
  const page = await open({ w: 390, h: 844 });
  // Favorito + deshacer seguro.
  await tab(page, "Movimientos");
  const before = await page.locator('[aria-label^="Editar "]').count();
  await page.getByTestId("add-expense").first().click();
  await page.getByRole("radio", { name: /^Café/ }).click();
  await page.getByTestId("save-entry").click();
  await page.waitForTimeout(300);
  const toast = await page.getByRole("button", { name: "Deshacer" }).count();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await tab(page, "Movimientos");
  report.flows.favoriteAndUndo = {
    undoOffered: toast === 1,
    entriesBefore: before,
    entriesAfterUndo: await page.locator('[aria-label^="Editar "]').count(),
  };
  await tab(page, "Mes");
  // Importe distinto al fijo: exige reconocer total completo.
  await page.getByRole("button", { name: /^Registrar pago de Laptop/ }).click();
  await page
    .locator("[role=dialog]")
    .getByLabel("Importe pagado (MXN)")
    .fill("100");
  await page.getByTestId("confirm-payment").click();
  await page.waitForTimeout(200);
  const blocked = await page.locator('[role="alert"]').first().textContent();
  await page.getByRole("checkbox").click();
  await page.getByTestId("confirm-payment").click();
  await page.waitForTimeout(300);
  report.flows.differentTotal = {
    blockedWith: blocked,
    closedAfterConfirm: (await page.locator('[role="dialog"]').count()) === 0,
  };
  await close(page);
}
{
  const page = await open({ w: 390, h: 844 });
  // A1: el mismo tipo dos veces conserva la última cuota; un cambio real pide confirmar.
  await tab(page, "Recurrentes");
  await page.getByRole("button", { name: "Agregar recurrente" }).click();
  await page
    .getByRole("radio", { name: "Cuota de deuda", exact: true })
    .click();
  await page.getByRole("button", { name: /^Detalles/ }).click();
  await page.getByRole("button", { name: /^Última cuota/ }).click();
  await page.getByRole("button", { name: "Escribir fecha" }).last().click();
  await page
    .locator("[role=dialog]")
    .getByLabel("Última cuota, formato año-mes-día")
    .fill("2026-12-12");
  await page
    .getByRole("radio", { name: "Cuota de deuda", exact: true })
    .click();
  const kept = await page
    .getByRole("button", { name: /^Última cuota/ })
    .getAttribute("aria-label");
  await page.getByRole("radio", { name: "Servicio", exact: true }).click();
  const asked = await page.getByText("¿Cambiar a Servicio?").count();
  await page.getByRole("button", { name: "Conservar Cuota de deuda" }).click();
  const stillKept = await page
    .getByRole("button", { name: /^Última cuota/ })
    .getAttribute("aria-label");
  report.flows.sameKindAndKindChange = {
    afterSameKind: kept,
    confirmationShown: asked === 1,
    afterKeeping: stillKept,
  };
  await close(page);
}
{
  const page = await open({ w: 390, h: 844 });
  // Cambio de próximo cobro con alcance explícito y vista previa.
  await page.getByRole("button", { name: /^Ver detalle\. Spotify/ }).click();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByRole("button", { name: /^Próximo cobro/ }).click();
  await page.getByRole("button", { name: "Escribir fecha" }).click();
  await page
    .getByLabel("Próximo cobro, formato año-mes-día")
    .fill("2026-10-04");
  await page.waitForTimeout(150);
  const future = page.getByRole("radio", { name: /^Conservar pendientes/ });
  const futureDisabled = await future.getAttribute("aria-disabled");
  await page.getByTestId("save-recurring").click();
  await page.waitForTimeout(200);
  const needsChoice = await page
    .locator('[role="alert"]')
    .first()
    .textContent();
  await page.getByRole("radio", { name: /^Mover el calendario/ }).click();
  await page.getByTestId("save-recurring").click();
  await page.waitForTimeout(300);
  report.flows.scheduleScope = {
    futureDisabled,
    needsChoice,
    savedRow: await page
      .getByRole("button", { name: /^Ver detalle\. Spotify/ })
      .getAttribute("aria-label"),
  };
  await close(page);
}

{
  // Varios vencimientos el mismo día: cada fila dice «Vence hoy». El 24 oct el
  // demo agrupa en hoy las reglas cuyo día ancla ya pasó.
  const page = await open({
    w: 390,
    h: 844,
    at: new Date("2026-10-24T12:00:00-06:00"),
  });
  report.flows.sameDayDue = await page.evaluate(() => {
    const rows = [
      ...document.querySelectorAll('[aria-label^="Ver detalle."]'),
    ].map((el) => el.getAttribute("aria-label"));
    const today = rows.filter((l) => l.includes("vence el 24 de octubre"));
    return {
      dueToday: today.length,
      taggedToday: today.filter((l) => l.includes("Vence hoy")).length,
    };
  });
  await close(page);
}

// 8. axe-core en pantallas y hojas (reglas WCAG 2.x A/AA). Automático: no
// sustituye revisión con lectores de pantalla.
for (const scheme of ["light", "dark"]) {
  const page = await open({ w: 390, h: 844, scheme });
  await page.addScriptTag({ content: axe.source });
  const run = async (where) => {
    const r = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (
        await axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
          },
        })
      ).violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        count: v.nodes.length,
        sample: v.nodes[0]?.target?.join(" "),
      })),
    );
    report.axe.push({ where, scheme, violations: r });
  };
  await run("Mes");
  await tab(page, "Recurrentes");
  await run("Recurrentes");
  await tab(page, "Movimientos");
  await run("Movimientos");
  await tab(page, "Mes");
  for (const [title, openSheet] of Object.entries(sheets)) {
    await openSheet(page);
    await page.waitForTimeout(400);
    await run(`Hoja ${title}`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (await page.locator('[role="dialog"]').count()) {
      await page
        .getByRole("button", { name: /^Descartar/ })
        .click()
        .catch(() => {});
      await page.waitForTimeout(300);
    }
    await tab(page, "Mes");
  }
  await close(page);
}

await browser.close();
server.close();

// Resumen legible.
const bad = report.layout.filter(
  (l) => l.scrollWidth > l.vw || l.overflowCount || l.smallCount,
);
const lines = [
  "# QA web 0.1.3 · resultado generado",
  "",
  `Generado: ${report.generated} · reloj fijo ${report.fixedClock} · Chromium (Playwright 1.56.1) · exportación web.`,
  "",
  `- Reflujo: ${report.layout.length} combinaciones pantalla×ancho×tema; con desborde u objetivos <48: ${bad.length}.`,
  ...bad.map(
    (l) =>
      `  - ${l.screen} ${l.w}×${l.h} ${l.scheme}: scroll ${l.scrollWidth}/${l.vw}, desbordes ${l.overflowCount}, objetivos <48 ${l.smallCount} ${JSON.stringify(l.small)}`,
  ),
  `- Próximo pago visible al abrir: ${report.firstRow.map((f) => `${f.w}×${f.h} ${f.visibleOnOpen ? "sí" : "no"} (fila ${f.rowTop}–${f.rowBottom}, acción ${f.actionTop})`).join("; ")}.`,
  `- Hojas: ${report.sheets.map((s) => `${s.sheet} ${s.w}×${s.h}: nombre «${s.dialogName}», foco en «${s.active}»${s.activeIsFullScreen ? " (¡fondo!)" : ""}, acción visible ${s.primaryVisible}, desbordes ${s.overflowCount}, <48 ${s.smallCount}`).join("; ")}.`,
  `- Recorridos: ${JSON.stringify(report.flows)}`,
  `- axe: ${report.axe.map((a) => `${a.where} ${a.scheme}: ${a.violations.length ? a.violations.map((v) => `${v.id}(${v.impact}, ${v.count})`).join(", ") : "sin infracciones automáticas"}`).join("; ")}.`,
  `- Errores de consola/página: ${report.errors.length ? report.errors.join(" | ") : "ninguno"}.`,
];
fs.writeFileSync(
  path.join(OUT, "qa-report.json"),
  JSON.stringify(report, null, 2),
);
fs.writeFileSync(path.join(OUT, "qa-report.md"), lines.join("\n") + "\n");
console.log(lines.join("\n"));
