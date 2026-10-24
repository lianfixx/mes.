import fs from "node:fs";
// Favicon: variante óptica de 16 px, con tema claro/oscuro dentro del SVG.
fs.copyFileSync("assets/brand/mark-16.svg", "dist/favicon.svg");
let html = fs.readFileSync("dist/index.html", "utf8");
html = html
  .replace(/<title>.*?<\/title>/, "<title>Mes · Finanzas</title>")
  .replace(/<html[^>]*>/, '<html lang="es-MX">')
  // Expo inserta description y theme-color desde app.json; se sustituyen por
  // las de abajo para que App.tsx actualice una sola etiqueta theme-color.
  .replace(/<meta name="(description|theme-color)"[^>]*>\s*/g, "");
// El foco visible usa --mes-focus, que la app fija según el tema (App.tsx).
// Los elementos con tabindex=-1 (títulos de hoja) reciben foco programático sin
// anillo; los controles conservan el suyo.
const css = [
  "html,body,#root{height:100%;margin:0}",
  "html{height:100dvh}",
  "body{background:var(--mes-bg,#fff);color:var(--mes-ink,#171717);overscroll-behavior:none}",
  "*{box-sizing:border-box}",
  "[dir=auto]{overflow-wrap:anywhere}",
  "button,[role=button],[role=radio],[role=checkbox],[role=tab]{-webkit-tap-highlight-color:transparent}",
  "*:focus-visible{outline:2px solid var(--mes-focus,#171717);outline-offset:2px}",
  '[tabindex="-1"]:focus{outline:none}',
  "input,textarea{outline-offset:2px}",
  "::-webkit-scrollbar{width:6px}",
  "::-webkit-scrollbar-thumb{background:var(--mes-thumb,#858585);border-radius:3px}",
  "@media(prefers-reduced-motion:no-preference){[role=button],[role=radio],[role=tab]{transition:opacity .16s ease,background-color .16s ease}}",
].join("");
html = html.replace(
  "</head>",
  `<meta name="description" content="Tus próximos pagos y tu mes, en un solo lugar. Versión de prueba de Sistemas Digitales."/><meta name="theme-color" content="#FFFFFF"/><meta name="color-scheme" content="light dark"/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/><style>${css}</style></head>`,
);
fs.writeFileSync("dist/index.html", html);
fs.writeFileSync(
  "dist/_headers",
  "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n",
);
console.log("Web metadata and brand assets prepared.");
