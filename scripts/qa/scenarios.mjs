// Capturas de los escenarios del brief (sección 9) con fecha fija.
// Uso: npm run build && node scripts/qa/scenarios.mjs [--out docs/qa/escenarios]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const OUT = args.includes("--out")
  ? args[args.indexOf("--out") + 1]
  : "docs/qa/escenarios";
const DIST = path.resolve("dist");
fs.mkdirSync(OUT, { recursive: true });
const server = http.createServer((req, res) => {
  let file = path.join(
    DIST,
    decodeURIComponent((req.url ?? "/").split("?")[0]),
  );
  if (
    !file.startsWith(DIST) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  )
    file = path.join(DIST, "index.html");
  const type = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
  }[path.extname(file)];
  res.writeHead(200, { "content-type": type ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch();
const done = [];

async function scenario(
  name,
  { w = 390, h = 844, scheme = "light" } = {},
  run,
) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    timezoneId: "America/Mexico_City",
    locale: "es-MX",
    colorScheme: scheme,
    deviceScaleFactor: w > 900 ? 1 : 2,
  });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date("2026-10-03T12:00:00-06:00"));
  await p.goto(BASE);
  await p.getByTestId("add-expense").first().waitFor();
  await p.waitForTimeout(250);
  const dlg = () => p.locator("[role=dialog]");
  const tab = (n) => p.getByRole("tab", { name: n }).first().click();
  await run(p, { dlg, tab });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `${name}.png`) });
  done.push(name);
  await ctx.close();
}
const blank = async (p) => {
  await p.getByRole("button", { name: "Ajustes de la prueba" }).first().click();
  await p.getByRole("button", { name: "Empezar en blanco" }).click();
  await p.getByRole("button", { name: "Empezar en blanco" }).last().click();
  await p.waitForTimeout(300);
};

await scenario("01-usuario-nuevo", {}, async (p) => blank(p));
await scenario("02-habitual-mes", {}, async () => {});
await scenario("03-habitual-anteriores-y-todos", { h: 1700 }, async (p) => {
  await p
    .getByRole("button", { name: /meses anteriores por confirmar/ })
    .click();
  await p.getByRole("button", { name: /^Ver los 8 pagos/ }).click();
});
await scenario("04-mes-sin-pagos-pendientes", {}, async (p) => {
  for (let i = 0; i < 2; i++)
    await p.getByRole("button", { name: /^Mes anterior/ }).click();
});
await scenario("05-busqueda-sin-resultados", {}, async (p, { tab }) => {
  await tab("Movimientos");
  await p.getByLabel(/^Buscar movimientos/).fill("zzz");
});
await scenario("06-tema-oscuro", { scheme: "dark" }, async () => {});
await scenario("07-favorito-y-deshacer", {}, async (p) => {
  await p.getByTestId("add-expense").first().click();
  await p.getByRole("radio", { name: /^Café/ }).click();
  await p.getByTestId("save-entry").click();
});
await scenario("08-registrar-despues-otra-fecha", {}, async (p) => {
  await p.getByTestId("add-expense").first().click();
  await p.getByRole("radio", { name: "Otra fecha" }).click();
});
await scenario("09-error-importe-sin-perdida", {}, async (p, { dlg }) => {
  await p.getByTestId("add-expense").first().click();
  await dlg().getByLabel("Importe en MXN").fill("0");
  await p.getByRole("radio", { name: "Transporte", exact: true }).click();
  await p.getByTestId("save-entry").click();
});
await scenario("10-dos-monedas-usd", {}, async (p) => {
  await p.getByRole("button", { name: /^Moneda de la vista/ }).click();
  await p.getByRole("radio", { name: /^USD/ }).click();
});
await scenario("11-deuda-terminada-detalle", {}, async (p, { dlg }) => {
  await p.getByRole("button", { name: /^Ver detalle\. Laptop/ }).click();
  await p.getByRole("button", { name: "Editar" }).click();
  await p.getByRole("button", { name: /^Detalles/ }).click();
  await p.getByRole("button", { name: /^Última cuota/ }).click();
  await p.getByRole("button", { name: "Escribir fecha" }).last().click();
  await dlg()
    .getByLabel("Última cuota, formato año-mes-día")
    .fill("2026-10-12");
  await p.getByTestId("save-recurring").click();
  await p.getByRole("button", { name: /^Registrar pago de Laptop/ }).click();
  await p.getByTestId("confirm-payment").click();
  await tab2(p, "Recurrentes");
  await p.getByRole("radio", { name: /^Todos/ }).click();
  await p.getByRole("button", { name: /^Ver detalle\. Laptop/ }).click();
});
async function tab2(p, n) {
  await p.waitForTimeout(300);
  await p.getByRole("tab", { name: n }).first().click();
}
await scenario("12-retirar-pago-vinculado", {}, async (p, { tab }) => {
  await p.getByRole("button", { name: /^Registrar pago de Spotify/ }).click();
  await p.getByTestId("confirm-payment").click();
  await p.waitForTimeout(300);
  await tab("Movimientos");
  await p.getByRole("button", { name: /^Editar Spotify/ }).click();
  await p.getByRole("button", { name: "Retirar movimiento" }).click();
});
await scenario("13-importe-distinto-al-fijo", {}, async (p, { dlg }) => {
  await p.getByRole("button", { name: /^Registrar pago de Laptop/ }).click();
  await dlg().getByLabel("Importe pagado (MXN)").fill("100");
  await p.getByTestId("confirm-payment").click();
});
await scenario(
  "14-cambio-de-fecha-con-alcance",
  { h: 1500 },
  async (p, { dlg }) => {
    await p.getByRole("button", { name: /^Ver detalle\. Spotify/ }).click();
    await p.getByRole("button", { name: "Editar" }).click();
    await p.getByRole("button", { name: /^Próximo cobro/ }).click();
    await p.getByRole("button", { name: "Escribir fecha" }).click();
    await dlg()
      .getByLabel("Próximo cobro, formato año-mes-día")
      .fill("2026-12-08");
    await p.getByRole("radio", { name: /^Conservar pendientes/ }).click();
  },
);
await scenario(
  "15-importe-nuevo-conserva-vencidos",
  { h: 1300 },
  async (p, { dlg, tab }) => {
    await tab("Recurrentes");
    await p.getByRole("button", { name: /^Ver detalle\. Teléfono/ }).click();
    await p.getByRole("button", { name: "Editar" }).click();
    await dlg().getByLabel("Importe previsto").fill("349");
  },
);
await scenario(
  "16-cambio-de-tipo-pide-confirmar",
  { h: 1100 },
  async (p, { dlg, tab }) => {
    await tab("Recurrentes");
    await p.getByRole("button", { name: "Agregar recurrente" }).click();
    await p.getByRole("radio", { name: "Cuota de deuda", exact: true }).click();
    await p.getByRole("button", { name: /^Detalles/ }).click();
    await p.getByRole("button", { name: /^Última cuota/ }).click();
    await p.getByRole("button", { name: "Escribir fecha" }).last().click();
    await dlg()
      .getByLabel("Última cuota, formato año-mes-día")
      .fill("2026-12-12");
    await p.getByRole("radio", { name: "Cuota de deuda", exact: true }).click();
    await p.getByRole("radio", { name: "Servicio", exact: true }).click();
    await dlg().getByText("¿Cambiar a Servicio?").scrollIntoViewIfNeeded();
  },
);
await scenario(
  "17-fecha-parcial",
  { w: 320, h: 568 },
  async (p, { dlg, tab }) => {
    await tab("Recurrentes");
    await p.getByRole("button", { name: "Agregar recurrente" }).click();
    await p.getByRole("button", { name: /^Próximo cobro/ }).click();
    await p.getByRole("button", { name: "Escribir fecha" }).click();
    await dlg().getByLabel("Próximo cobro, formato año-mes-día").fill("2026-");
    await dlg().getByText("Formato AAAA-MM-DD").scrollIntoViewIfNeeded();
  },
);
await scenario("18-casa-ejemplo", {}, async (p) => {
  await p.getByRole("button", { name: /^Espacio:/ }).click();
  await p.getByRole("radio", { name: /^Casa · ejemplo/ }).click();
});
await scenario("19-escritorio-claro", { w: 1440, h: 900 }, async () => {});
await scenario(
  "20-escritorio-oscuro-recurrentes",
  { w: 1440, h: 900, scheme: "dark" },
  async (p, { tab }) => tab("Recurrentes"),
);
await scenario(
  "21-tablet-movimientos",
  { w: 768, h: 1024 },
  async (p, { tab }) => tab("Movimientos"),
);
await scenario("22-mes-pasado-presupuesto-rotulado", { h: 1700 }, async (p) => {
  await p.getByRole("button", { name: /^Mes anterior/ }).click();
});

await browser.close();
server.close();
console.log(`Escenarios capturados (${done.length}): ${done.join(", ")}`);
