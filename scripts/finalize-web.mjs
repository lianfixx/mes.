import fs from "node:fs";
const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#171717"/><path d="M15 43V26q0-9 8-9t8 9v17M31 26q0-9 8-9t8 9v17" fill="none" stroke="white" stroke-width="6" stroke-linecap="round"/></svg>';
fs.writeFileSync("dist/favicon.svg", icon);
fs.mkdirSync("assets", { recursive: true });
fs.writeFileSync("assets/mark.svg", icon);
let html = fs.readFileSync("dist/index.html", "utf8");
html = html
  .replace(/<title>.*?<\/title>/, "<title>Mes · Finanzas</title>")
  .replace(/<html[^>]*>/, '<html lang="es-MX">');
html = html.replace(
  "</head>",
  '<meta name="description" content="Tus próximos pagos y tu mes, en un solo lugar. Versión de prueba de Sistemas Digitales."/><meta name="theme-color" content="#171717"/><link rel="icon" href="/favicon.svg" type="image/svg+xml"/><style>html,body,#root{height:100%;margin:0}html{height:100dvh}*{box-sizing:border-box} [dir=auto]{overflow-wrap:anywhere}button,[role=button]{-webkit-tap-highlight-color:transparent}*:focus-visible{outline:2px solid currentColor;outline-offset:4px}input,textarea{outline-offset:2px}body{overscroll-behavior:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#999;border-radius:3px}@media(prefers-reduced-motion:no-preference){[role=button]{transition:opacity .16s ease,background-color .16s ease}}</style></head>',
);
fs.writeFileSync("dist/index.html", html);
fs.writeFileSync(
  "dist/_headers",
  "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n",
);
console.log("Web metadata and brand assets prepared.");
