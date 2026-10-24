# Auditoría y comprobaciones · Mes 0.1.3

## Base y procedencia

- **ZIP leído:** `Mes_Codigo_v0_1_2_2026_10_15.zip` (Drive: `mes./.1`). Sus 20 archivos coinciden con `SHA256SUMS.json`.
- **Commit de origen** según su `VERSION.txt`: `1590eb3c52aae6b777287964fddd86dc10c1a379`. Se importó sin cambios como primer commit de esta rama.
- **ZIP y sitio publicado son la misma versión:**
  - `npm run build` sobre esa base reproduce exactamente `index-0df75a1f78bb49eb081cff47dabaf108.js`, la compilación final que cita `AUDIT_0.1.2.md`;
  - el sitio publicado sirve ese mismo nombre de bundle (comprobado con una petición HTTP al HTML, sin renderizar el sitio ni iniciar sesión).
- **Entorno:** contenedor Linux, Node 22.22 (el README pide 24; pruebas, typecheck y exportación pasan con 22), Chromium 1194 de Playwright 1.56.1.
  - Reloj fijo: 3 oct 2026 12:00, zona America/Mexico_City.
  - Datos ficticios del demo.
- **Sin teléfonos físicos, sin lectores de pantalla reales y sin usuarios.**

## Diagnóstico de 0.1.2 (priorizado)

**Tipos de evidencia:**

- **Código:** lectura del fuente.
- **Medido:** Playwright sobre la compilación 0.1.2, con la sonda `docs/qa/antes/sonda-0.1.2.mjs`, resultados en `sonda-0.1.2.json` y capturas en `docs/qa/antes/`.
- **Inferido:** razonado, sin medición directa.

No se repiten como hallazgos los defectos que 0.1.1/0.1.2 ya habían cerrado.

| # | Hallazgo en 0.1.2 | Evidencia | Estado en 0.1.3 |
|---|---|---|---|
| 1 | El próximo pago no se ve al abrir en un teléfono pequeño. A 320×568 la primera fila empezaba en y=489, detrás del pie de acción (445). A 390×844 empezaba en y=431. | Medido | **Corregido y medido.** Fila en 327–435 (acción en 440) a 320×568; en 344 a 390×844 / 390×667 / 430×932. |
| 2 | El foco de teclado se pierde: `PaymentRow`, `Empty` y `Separator` se declaraban dentro de `App` y se remontaban en cada render. Tras Escape en la hoja abierta desde ✓, y tras redimensionar, el foco iba a `BODY`. | Código + Medido | **Corregido y medido.** Componentes a nivel de módulo; el foco vuelve a «Registrar pago de Internet del 9 oct 2026» y sobrevive al redimensionar. |
| 3 | Anillo de foco invisible en oscuro: `outline: currentColor` resolvía a negro sobre #111 (1.11:1). | Medido | **Corregido y medido.** `--mes-focus` por tema; en oscuro rgb(245,245,245) sobre rgb(17,17,17) da 17.3:1. |
| 4 | Diálogo único llamado «Formulario de Mes» para 8 hojas. En Ajustes, el foco inicial caía en el fondo «Cerrar ventana» de pantalla completa. | Medido | **Corregido y medido.** Nombre = título de la hoja; foco inicial en el título (o en el importe en captura); el fondo ya no es enfocable. |
| 5 | Estados accesibles ausentes en web: react-native-web 0.21 no traduce `accessibilityState` a ARIA, así que fichas, pestañas y días no exponían seleccionado, marcado ni expandido. | Código (fuente de RNW) + Medido en 0.1.3 inicial (axe `aria-required-attr`) | **Corregido y medido.** Props `aria-*`; axe sin infracciones automáticas en 3 pantallas y 5 hojas, en ambos temas. |
| 6 | `announceForAccessibility` no hace nada en web, y el aviso breve se montaba solo con mensaje (región viva poco fiable). | Código (fuente de RNW) | **Corregido; pendiente en lector real.** Región viva permanente; anuncio explícito solo en iOS para no duplicar en Android. |
| 7 | Error sin asociación ni foco: importe 0 → mensaje arriba, foco en ningún campo, sin `aria-invalid`. | Medido | **Corregido y medido.** Foco en el importe, `aria-invalid=true`, `aria-describedby` → «El importe debe ser mayor que cero.»; categoría y fecha conservadas. Se mantiene el resumen superior. |
| 8 | «POR PAGAR ESTE MES» fijo al navegar a otro mes, sin intervalo, mezclando fechas pasadas con futuras. | Código | **Rediseñado.** «Por pagar · 3–31 oct» y «Por confirmar · 1–2 oct» aparte (concilian con el total; prueba). |
| 9 | Un solo interruptor para «meses anteriores» y «Ver los N»; el enlace aparecía sin nada oculto («Ver los 2» en Casa) y decía «1 pagos». | Código + Medido | **Corregido.** Interruptores separados; «Ver los N» solo con más de 5; plurales. |
| 10 | Fila de pago: «Cuota mensual» fija aunque la frecuencia fuera otra; «Prueba gratuita» sobre el primer cobro; estimado solo con «≈»; ✓ deshabilitado al 30 % sin motivo. | Código | **Corregido.** «Cuota de deuda · semanal/mensual/anual»; «Primer cobro tras la prueba (6 oct)»; «Estimado»; «Se confirma después del 28 sep». |
| 11 | Filas dobles en teléfono: el importe pasaba a otra línea por debajo de 600 px. Alturas a 390 px: Recurrentes 156, Movimientos 136. | Código + Medido | **Corregido y medido.** Recurrentes 77–105, Movimientos 66–67. Se apilan solo por debajo de 380 px o con importes largos. |
| 12 | «Última cuota» sin «Sin fecha» (dependía de `label.includes("opcional")`); botón de fecha sin el nombre del campo. | Medido | **Corregido y medido.** Prop `optional`; nombre «Última cuota: 12 de diciembre de 2026. Cambiar fecha». |
| 13 | Cifra máxima (9 999 999 999.99): sin desborde, pero partida a mitad de número («$10,000,003,12 / 9.49»). | Medido | **Corregido y medido.** Ajuste al ancho: una línea a 29 px en 320 px. |
| 14 | Botón flotante de escritorio con caja blanca rectangular y sombra detrás de la píldora. | Medido (captura) | **Corregido.** Sombra en la píldora. |
| 15 | Cambio real de tipo que borra la prueba o la última cuota sin aviso (la selección idéntica ya estaba protegida). | Código | **Corregido y medido.** Confirmación en línea; «Conservar» mantiene la fecha. |
| 16 | Alcance del calendario sin las fechas resultantes; «Conservar» con fecha anterior solo fallaba al guardar. | Código | **Corregido y medido.** Vista previa del dominio; opción deshabilitada con su motivo; guardar sin elegir sigue exigiendo la decisión. |
| 17 | Presupuesto: límite actual aplicado a otros meses sin rótulo; «Cuotas por pagar $0» siempre visible. | Código | **Corregido.** Rótulo de límite no versionado; cuotas solo si son mayores que 0. |
| 18 | Observación genérica («Una cosa a la vez.») con frase de relleno; el aumento sin diferencia, porcentaje ni período. | Código | **Corregido.** Solo con evidencia: dato, %, período y acción. |
| 19 | Captura: favoritos sin importe ni categoría ni estado elegido; fecha solo en Detalles; prefijo «$» para USD (las listas decían «USD»); Guardar dentro del desplazamiento. | Código + Node (`Intl`) | **Corregido.** Favoritos con detalle; Hoy/Ayer/Otra; prefijo de `formatToParts`; zona de acción fija. |
| 20 | Tema siempre claro al iniciar, aunque `app.json` declara `automatic`; interruptor duplicado en la cabecera. | Código | **Corregido.** «Según el sistema» por defecto; elección en Ajustes. |
| 21 | Eslóganes, género incoherente y aviso de demo en MAYÚSCULAS de 12 px. | Código | **Corregido.** |
| 22 | Iconos de caracteres; tokens solo de color (`muted` = `faint`). | Código | **Corregido.** Familia SVG propia; tokens completos (`docs/DESIGN.md`). |

### Regresión introducida y corregida durante este trabajo

La primera iteración calculaba «cambios sin guardar» durante el render. La primera apertura de cada hoja pedía confirmación al cerrar sin cambios. La QA la detectó (Escape no cerraba la hoja de pago) y se corrigió volviendo a comparar al cerrar, como hacía 0.1.2. Hay una comprobación propia en `npm run qa` (`closeUnchangedFirstTime`).

## Invariantes conservadas

- **Pruebas:** las 27 de dominio de 0.1.2 siguen sin cambios y en verde. Se añaden 9 de `derive.test.ts` y 3 de `format.test.ts`; 39 en total.
- **Sin cambios de reglas:** `model.ts` no se tocó. La interfaz llama a los mismos comandos (`confirmPayment`, `removeEntry`, `updateRecurring`, `pauseRecurring`, `changeRecurringKind`).
- **Recorridos de dominio comprobados desde la interfaz:**
  - importe distinto al fijo bloqueado hasta marcar «total completo» (A4);
  - el mismo tipo dos veces conserva la última cuota (A1);
  - alcance de calendario obligatorio (A5/A7), con «Conservar» deshabilitado si la fecha es anterior;
  - favorito y deshacer restauran el conteo de movimientos;
  - deuda terminada «Finalizado · sin próximos cobros» con edición de datos (escenario 11);
  - retirar un pago vinculado explica que el vencimiento vuelve a quedar por confirmar (escenario 12);
  - nuevo importe con un vencido sin confirmar avisa que conserva sus condiciones (escenario 15).

## Lista de comprobaciones

Origen: **H** = heredada de 0.1.2 (no repetida aquí salvo indicación); **P** = propia de este trabajo.

### Verificado

| Comprobación | Pantalla/estado | Viewport · escala | Tema | Método | Resultado | Origen |
|---|---|---|---|---|---|---|
| Pruebas de dominio | — | — | — | `npm test` | 39/39 (27 heredadas + 12 nuevas) | P (27 H) |
| TypeScript estricto | — | — | — | `npm run typecheck` | Sin errores | P |
| Formato | — | — | — | `npm run format:check` | Conforme | P |
| Exportación web | — | — | — | `npm run build` | 580 KB JS, sin errores | P |
| Reflujo | Mes, Recurrentes, Movimientos | 320, 379, 381, 390, 430, 768, 800, 959, 961, 1024, 1199, 1201, 1440 · escala 1 | claro y oscuro | `npm run qa` | 78 combinaciones sin desborde ni controles <48 | P |
| Zoom 200 % emulado | 3 pantallas | 640×400 (1280×800 al 200 %) | claro | `npm run qa` | Sin desborde ni <48 | P |
| Altura reducida | 3 pantallas y 5 hojas | 390×390 | claro | `npm run qa` | Sin desborde; acción final visible | P |
| Próximo pago al abrir | Mes, demo | 320×568, 390×667, 390×844, 430×932 | claro | `npm run qa` | Visible en los cuatro | P |
| Hojas | Registrar gasto, Registrar pago, Detalle, Nuevo recurrente, Ajustes | 320×568, 390×844, 390×390, 1440×900 | claro y oscuro | `npm run qa` | Nombre = título; foco inicial en título o importe, nunca en el fondo; acción visible | P |
| Escape y retorno de foco | Pago abierto con ✓ por teclado | 390×844 | oscuro | `npm run qa` | Cierra y devuelve el foco al ✓ | P |
| Cerrar sin cambios | Registrar gasto, 1.ª apertura | 390×844 | oscuro | `npm run qa` | Cierra sin pedir confirmación | P |
| Foco visible | Primer control enfocable | 390×844 | oscuro | estilo calculado | Anillo #F5F5F5 sobre #111111 (17.3:1) | P |
| Error asociado | Importe 0 | 390×844 | claro | `npm run qa` | Foco, `aria-invalid`, descripción y campos conservados | P |
| Fechas parcial/inválida/límite | «2026-», 2026-02-30, 2101-01-01, 1899-12-31 | 320×568 | claro | `npm run qa` | Sin rotura; «Fecha incompleta» / «Fecha no válida»; mensajes del dominio | P |
| Importe máximo | Gasto neto | 320×568 | claro | `npm run qa` + captura | Una línea, sin desborde | P |
| Nombre de 120 caracteres | Movimientos | 320×568 | claro | `npm run qa` | Sin desborde | P |
| axe-core 4.10.3 (WCAG 2.0–2.2 A/AA automáticas) | 3 pantallas y 5 hojas | 390×844 | claro y oscuro | `npm run qa` | Sin infracciones automáticas | P |
| Contraste de tokens | Pares usados | — | ambos | fórmula WCAG (tabla en DESIGN.md) | Texto ≥5.11; controles ≥3.38; foco ≥16.1 | P |
| Escenarios del brief | 22 casos | 320–1440 | ambos | `scripts/qa/scenarios.mjs` | Capturas en `docs/qa/escenarios` | P |
| Marca a 16/24/48 | Favicon y maestros | — | ambos | captura | Reconocible; `docs/design/marca-16-24-48.png` | P |
| Bundle = sitio publicado | Base 0.1.2 | — | — | build reproducible + HTTP | Mismo `index-0df75a1f…` | P |

### Pendiente (no se afirma)

- **Teléfonos físicos:**
  - teclado nativo y `KeyboardAvoidingView` con la zona de acción fija;
  - `autoFocus` en iOS web;
  - safe areas reales e indicador inferior;
  - barras del navegador que cambian de altura.
- **Tecnologías de asistencia reales:** VoiceOver, TalkBack y NVDA, incluidas la lectura de la región viva, el anuncio de errores y el foco de accesibilidad nativo (`setAccessibilityFocus`).
- **Texto ampliado:**
  - Dynamic Type / escala del sistema hasta 200 % en nativo;
  - escala de fuente del navegador. En web los tamaños están en px y el zoom del navegador sí reorganiza (emulado); la preferencia de tamaño de letra sola no.
- **Rendimiento:** listas largas (cientos de movimientos), memoria, equipos lentos. La virtualización se decide al medir.
- **Exportaciones nativas:** iOS y Android (`expo export` por plataforma) no se repitieron en esta sesión. Las de 0.1.2 están en H.
- **Pruebas con personas:** identificar el próximo cobro sin explicación, registrar un favorito en menos de 10 s, configurar tres recurrentes en menos de 5 min y entender que el presupuesto restante no es saldo bancario.
- **Revisión visual humana del tema oscuro** en pantallas OLED y con brillo bajo; el borde de la hoja frente al velo en oscuro.
- **Traducciones largas:** el texto envuelve, pero no hay traducciones con las que medir.
- **Marca:** disponibilidad del nombre y validación del símbolo.

### Fuera de alcance (no simulado)

- Cuentas, autenticación, persistencia, sincronización, colaboración real e invitaciones.
- Notificaciones, OCR, conexión bancaria y cobros comerciales.
- Conversión de moneda.
- Modelo de abonos parciales y presupuesto versionado por mes (solo se rotula).
- Importador.
- Publicación en tiendas.
- Cambios en el sitio publicado o en su acceso.

## Fuentes de criterio (consultadas para decisiones de esta revisión)

- W3C WCAG 2.2 · Contraste mínimo, contraste no textual y tamaño de objetivo (mínimo y mejorado): criterios para los tokens y los 48 px. https://www.w3.org/WAI/WCAG22/Understanding/
- W3C ARIA APG · Patrón de diálogo modal: nombre, foco inicial, Escape y retorno al activador. https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Código de react-native-web 0.21 en `node_modules`: Modal (Escape, trampa y retorno de foco), `createDOMProps` (atributos aria admitidos) y `AccessibilityInfo` (`announceForAccessibility` vacío). Se leyó para no duplicar mecanismos.
- `expo/bundledNativeModules.json` del SDK instalado: versión de `react-native-svg` (15.15.4).

Las capturas de antes y después usan la misma fecha fija y los mismos datos de demostración. No se infieren porcentajes de mejora ni satisfacción.
