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
