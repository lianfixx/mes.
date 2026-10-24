# Traspaso · Mes 0.1.3

Para continuar sin depender de la conversación que produjo este cambio. Primero lee `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md` y `docs/DESIGN.md`.

## Ejecutar y comprobar

```sh
npm ci
npm test              # 39 pruebas: dominio (27 heredadas), derivados y formato
npm run typecheck
npm run format:check
npm run build         # exportación web en dist/
npm run qa            # matriz de QA sobre dist/ (requiere Chromium de Playwright 1.56.1)
node scripts/qa/scenarios.mjs   # capturas de los escenarios del brief
```

**Chromium para la QA:** si no está instalado, ejecuta `npx playwright install chromium`. La QA usa un reloj fijo (3 oct 2026 12:00, America/Mexico_City), por lo que los resultados no dependen del día real.

**Pruebas y fecha real:** `npm test` crea el demo con fecha fija, pero algunas reglas de `updateRecurring` usan `todayLocal()`; las pruebas heredadas ya convivían con eso.

## Mapa del código

| Ruta | Responsabilidad |
|---|---|
| `src/domain/model.ts` | Reglas financieras (sin cambios en 0.1.3). |
| `src/domain/derive.ts` | Cálculos de presentación puros que reutilizan `model.ts`: separar pendientes, próximas fechas, qué queda tras un pago, condiciones que se perderían al cambiar de tipo, aumento de precio, vista previa de un cambio de calendario. |
| `src/app/useMesApp.ts` | Estado temporal y comandos de interfaz (antes en `App.tsx`). Valida formularios por campo (`FieldError`), llama al dominio y ofrece deshacer seguro. |
| `src/app/context.ts` | Contexto de la app (`useApp`). |
| `src/ui/tokens.ts` | Tokens semánticos. |
| `src/ui/format.ts` | Formato de importes, fechas e intervalos (sin cálculos financieros). |
| `src/ui/icons.tsx` | Iconos SVG. |
| `src/ui/components/` | Componentes base (ver `DESIGN.md` §4). |
| `src/ui/rows.tsx` | Filas de vencimiento y de movimiento. |
| `src/ui/screens/` | Mes, Recurrentes, Movimientos. |
| `src/ui/sheets/` | Hojas: captura, recurrente, pago, detalle, presupuesto, meta, espacios, ajustes; selector de moneda y foco en errores (`shared.tsx`). |
| `src/ui/SheetHost.tsx` | Una sola Modal cuyo contenido cambia (detalle → pago sin cerrar). |
| `App.tsx` | Estructura: proveedores, barra superior o lateral, encabezado del período, franja de contexto, pie de acción, pestañas, aviso breve. |
| `scripts/qa/` | QA reproducible (`matrix.mjs`) y escenarios (`scenarios.mjs`). |
| `assets/brand/` | Marca provisional (maestros y variante de 16 px). |

## Reglas de interfaz que no deben perderse

Están trasladadas tal cual desde 0.1.2 a `useMesApp.ts`:

- **Pago vinculado:**
  - conserva tipo y moneda;
  - un importe distinto en una regla fija exige `differentTotal`;
  - retirarlo restaura el vencimiento con su instantánea (`removeEntry`).
- **Fecha futura:** un movimiento con fecha futura se rechaza («Para un pago futuro, crea un recurrente»).
- **Construcción de la regla (`buildRecord`)**, igual que en 0.1.2:
  - ancla conservada si la fecha no cambia;
  - estado activo al reanudar;
  - historial de precio al cambiar el importe;
  - `trialEnd` solo en suscripción y `endDate` solo en deuda (también lo limpia `updateRecurring`).
- **Alcance del calendario:** `dateAction` se exige al cambiar fecha o frecuencia (el dominio lanza el error; la UI lo asocia al campo `scope`).
- **Borradores:** «cambios sin guardar» se compara **al cerrar** (`isDirty()`). Calcularlo durante el render produce falsos positivos, como en la regresión descrita en `AUDIT_0.1.3.md`.
- **Deshacer:** restaura la instantánea anterior solo si `data === lastOp.after`. No lo conviertas en «aplicar la operación inversa» sin pruebas.

## Accesibilidad: decisiones y trampas conocidas

- **Usa props `aria-*`** (`aria-checked`, `aria-selected`, `aria-expanded`, `aria-disabled`), **no `accessibilityState`**: react-native-web 0.21 no traduce `accessibilityState` a ARIA. React Native las acepta en nativo.
- **`aria-invalid` y `aria-describedby`** no están en los tipos de React Native. Se pasan con `webAria()` solo en web.
- **`announceForAccessibility` no hace nada en web.** Los avisos usan la región viva permanente de `Toast` y los errores `ErrorSummary` (`alert`). En iOS se anuncia explícitamente; en Android basta la región viva.
- **Modal:** react-native-web ya da rol `dialog`, Escape, trampa de foco y retorno al activador.
  - El retorno solo funciona si el activador sigue en el DOM. Por eso **no declares componentes dentro de otros componentes**: se remontan y el foco se pierde.
  - El título de la hoja tiene `tabIndex={-1}` para ser el foco inicial.
  - El fondo de la hoja es un `View` con responder, no un `Pressable`, para no ser enfocable.
- **Objetivos de 48:** no reduzcas `minHeight`/`minWidth` al compactar. El `Switch` nativo se sustituyó por `SwitchRow` porque en web mide unos 40×20.

## Dependencias

| Paquete | Tipo | Motivo |
|---|---|---|
| `react-native-svg` 15.15.4 | ejecución | Iconos vectoriales nativos y web; versión fijada por el SDK 57 de Expo (`npx expo install`). |
| `playwright` 1.56.1 | desarrollo | QA reproducible de reflujo, foco y recorridos sobre la exportación web. Coincide con Chromium 1194. |
| `axe-core` 4.10.3 | desarrollo | Comprobación automática de reglas WCAG en la QA. No sustituye una revisión con lector de pantalla. |

No se añadió ningún kit visual ni dependencia de IA.

## Trabajo de dominio o backend que la interfaz ya anticipa

1. **Presupuesto versionado por mes:** hoy se rotula la limitación. Propuesta:
   - `budgets[space][currency]` pasa a ser una lista `{ desde: "AAAA-MM", amount }`;
   - el límite de un mes es el último con `desde ≤ mes`;
   - prueba: editar el límite en noviembre no cambia el «restante» de septiembre.
2. **Abonos parciales:** hoy un importe distinto se trata como total corregido. Un modelo de abonos requeriría:
   - saldo pendiente por vencimiento;
   - varias entradas por `occurrenceId`;
   - estados «parcial» y «cubierto»;
   - no se insinúa en la interfaz.
3. **Favoritos editables:** hoy son fijos en MXN (`favorites` en `useMesApp.ts`). Requieren persistencia; nunca deben convertirse de moneda.
4. **Meta con fecha:** para sugerir un aporte (`máximo(0, objetivo − aportado) / períodos restantes`) hace falta fecha objetivo y períodos válidos. Hoy no se muestra ninguna sugerencia.
5. **Tarjetas:** alias, corte y «Fecha de cobro» (el día del cargo del servicio, no el corte del estado de cuenta). No se diseñaron controles ficticios.

## Primera beta · requiere implementación posterior a la alfa

Especificación de estados para mantener la coherencia del diseño. **Nada de esto existe en 0.1.3** y la interfaz no lo simula.

| Estado | Contenido mínimo | Regla |
|---|---|---|
| Invitación | «Emi te invitó a Casa» · correo verificado · permisos que tendrás | Uso limitado; caduca; se puede rechazar. |
| Correo verificado | Confirmación enviada · reenviar · cambiar correo | Sin acceso a datos compartidos hasta verificar. |
| Aceptación | Qué verá cada persona · el espacio personal sigue privado | Autor, pagador y participante son conceptos distintos; colaborar no implica dividir al 50 %. |
| Permiso insuficiente | «No puedes editar este pago; pide acceso a Emi» | Autorización en servidor (RLS), no en el selector. |
| Salida o revocación | Qué conserva cada parte · desde cuándo | Los movimientos ya registrados no se reescriben. |
| Pendiente de sincronizar | «Guardado en este teléfono · se enviará al reconectar» | Nunca «Sincronizado» sin confirmación del servidor. |
| Conflicto | Dos versiones lado a lado · elegir · conservar ambas | Sin pérdida silenciosa. |
| Recuperación | Restaurar desde respaldo con fecha · qué se reemplaza | Prueba de restauración antes de lanzar. |

**Recordatorios** (punto de partida a validar):

- el teléfono como canal;
- tres días antes y el día del cobro a las 9:00, con un seguimiento opcional;
- sin importes en la pantalla bloqueada;
- el permiso se pide al activar; si se niega, se conserva la agenda;
- no se promete entrega exacta.

## Para seguir

- Repite `npm run qa` después de cada cambio de interfaz. Si cambian los textos, ajusta los selectores del script.
- Antes de la beta, ejecuta la lista «Pendiente» de `AUDIT_0.1.3.md` en iPhone y Android físicos con VoiceOver y TalkBack.
- Si se añaden traducciones, mide con textos reales; las fichas y filas ya envuelven.
