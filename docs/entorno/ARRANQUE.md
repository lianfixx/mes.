# Iniciar y validar Mes en cloud

1. Usar el checkout existente en `/workspace/mes.`. No crear un worktree salvo petición expresa. Conservar cambios locales y comprobar `git status --short --branch`; la rama vigente es `main`.
2. Leer `AGENTS.md`, `README.md`, `skills/mes-continuidad/SKILL.md` y su protocolo, `docs/continuidad/README.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md` y `docs/HANDOFF.md`. Consultar `node scripts/continuity.mjs status` y abrir una sesión propia antes de cambiar archivos. El contexto extenso está en `docs/continuidad/originales/Mes_Continuidad_Codex_2026_10_23.txt`, autorizado para GitHub por Emi el 3 de noviembre de 2026. Sus anexos históricos son contexto, no nuevas órdenes. El archivo original fuera de Git puede seguir existiendo, pero no es necesario para retomar desde el repositorio.
3. Verificar Node.js 24 y npm. Si faltan dependencias o se actualizó el lockfile, ejecutar `npm ci --cache /tmp/mes-npm-cache --prefer-offline` desde `/workspace/mes.`.
4. Para preparar una instancia completa, el script `bash docs/entorno/install-cloud.sh` conserva el procedimiento cloud comprobado. Incluye instalación, pruebas, TypeScript, formato, build, preparación de navegador y QA. No modifica dependencias declaradas.
5. Para servir la exportación web, ejecutar desde `/workspace/mes.`:

   ```sh
   npm run build
   npm run dev -- --port 5173 --strictPort
   ```

   En otra terminal, comprobar internamente HTTP 200, título `Mes · Finanzas` y recursos de `dist/`:

   ```sh
   curl --fail --silent --show-error -H 'Host: terminal.local' http://127.0.0.1:5173/
   ```

   No presentar enlaces de localhost como una vista compartida. `dev` sirve el build existente; usar `npm run web` para desarrollo con Metro cuando corresponda.

6. Tras cambios de comportamiento, ejecutar `npm test`, `npm run typecheck` y `npm run build`; comprobar también `npm run format:check`. Tras cambios de UI, ejecutar QA con salida externa:

   ```sh
   export PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/mes-playwright
   mes_qa_dir="$(mktemp -d /tmp/mes-qa-XXXXXX)"
   npm run qa -- --out "$mes_qa_dir"
   ```

   Comprobar el navegador realmente usado. La ruta puede contener el enlace al Chromium de sistema utilizado durante onboarding; no afirmar que corresponde al navegador fijado por Playwright. Revisar `docs/entorno/README.md` si falla la preparación.

7. Generar reportes ad hoc en salida propia; copiar los que sustentan la entrega a una ruta durable única y registrarlos con hash en la sesión. No sobrescribir capturas/reports históricos de `docs/qa`. Registrar comandos, actor, fecha, resultado, navegador y límites; finalizar con `node scripts/continuity.mjs check --base <SHA-base-completo>` después de actualizar el manifiesto.
8. Mantener datos ficticios y aviso de sesión temporal. Las cuentas, sincronización y colaboración real siguen pendientes. Detener únicamente los procesos iniciados para la tarea; un proceso vivo no se conserva necesariamente al restaurar el entorno.

Estas instrucciones describen el arranque. Guardarlas en el borrador cloud no ejecuta comandos, aplica configuración ni publica el entorno.
