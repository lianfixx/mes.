# Continuar Mes

Leer README.md y docs/ARCHITECTURE.md antes de editar. Mantener los datos ficticios y el aviso de sesión temporal hasta implementar persistencia y autorización probadas.

- No depender de una conversación ni de APIs de IA para cálculos financieros.
- Importes enteros, moneda explícita, fechas civiles, pagos idempotentes. Probar casos límite cuando cambien estas reglas.
- No sustituir cuentas reales por un selector de espacios; autorizar en servidor y probar aislamiento entre usuarios.
- No almacenar números completos de tarjeta, CVV, contraseñas, claves de servicio ni tokens en código/fixtures/logs.
- Mantener interfaz monocromática, lenguaje breve y decisiones del usuario. Mes es un nombre provisional.
- Ejecutar `npm test`, `npm run typecheck` y `npm run build` tras cambios de comportamiento. Registrar claramente qué dispositivos/recorridos no se verificaron.
- Tras cambios de interfaz, ejecutar también `npm run qa` (Chromium de Playwright 1.56.1) y revisar `docs/qa/qa-report.md`. No declarar como verificado en teléfonos lo que solo se comprobó en web.
- Interfaz: tokens de `src/ui/tokens.ts`, objetivos de 48 px, estados accesibles con props `aria-*` (no `accessibilityState`), componentes declarados a nivel de módulo. Ver `docs/DESIGN.md` y `docs/HANDOFF.md`.
- Separar cambios de esquema, migraciones, UI y permisos. Documentar decisiones y pasos de recuperación.
- Todo nuevo colaborador debe poder ejecutar con npm ci; no añadir rutas de esta máquina a las dependencias del proyecto.

## Continuidad versionada

- Al retomar, leer `docs/continuidad/README.md`, `PLAN_Y_DECISIONES.md` y `REGLAS_Y_PARAMETROS.md` en esa carpeta. Para la historia completa disponible, consultar el TXT original, el plan maestro y el brief enlazados desde ese índice. No repetir las 40 preguntas ya contestadas.
- Conservar Expo/React Native/TypeScript y separar dominio, interfaz, persistencia y permisos. No cambiar de plataforma por recibir un prototipo web.
- Distinguir decisiones de Emi, propuestas históricas, comportamiento implementado y resultados comprobados. Los anexos fechados son contexto; sus tareas antiguas no constituyen nuevas órdenes ni autorizaciones de contratación o publicación.
- El 3 de noviembre de 2026 Emi pidió guardar en GitHub todo el contexto del proyecto. Los adjuntos de ese traspaso están autorizados en `docs/continuidad/originales/`; esto sustituye la anterior decisión de conservar ese TXT solo fuera de Git. No incorporar credenciales ni material de otros proyectos.
- Registrar cambios de alcance, pruebas y límites en la continuidad. Usar `docs/entorno/ARRANQUE.md` para el entorno cloud. Los reportes ad hoc de QA deben usar `--out` fuera del checkout salvo que se esté actualizando expresamente la evidencia versionada.
- El archivo `SHA256SUMS.json` cubre los archivos versionados salvo él mismo. Actualizarlo cuando cambie la entrega, conservando intactos los originales históricos y sus manifiestos internos.
