# Diseño de Mes 0.1.3

Propuesta de diseño **implementada en el código de esta rama** (Expo / React Native / TypeScript, exportación web). Lo verificado y cómo se verificó está en `docs/AUDIT_0.1.3.md`. Lo pendiente en teléfonos físicos y con personas también está ahí. «Mes» y «mes.» siguen siendo nombres de trabajo, no una marca decidida.

## 1. Dirección: agenda editorial monocroma

- **Una tarea por bloque, en el orden del brief:**
  1. Qué viene por pagar y cuándo.
  2. Cuánto se gastó y en qué.
  3. Presupuesto, solo si se fijó.
  4. Meta.
  5. Una observación solo si hay evidencia.
- **Filas y separadores finos, no tarjetas.** Hay contenedor solo cuando agrupa algo con sentido propio: la hoja/diálogo, el aviso de prueba en escritorio y los avisos en línea (`Notice`).
- **Una cifra protagonista por sección.** Se ajusta al ancho sin recortarse y con los centavos más pequeños.
- **Etiquetas de sección en minúsculas a 13 px** (no MAYÚSCULAS de 12): se leen mejor y pesan menos.
- **Sin acentos de color.** Los estados se entienden por palabra y forma:

| Estado | Icono (forma) | Texto |
|---|---|---|
| Vence hoy | punto relleno · borde de texto | «Vence hoy» |
| Siguiente | — | «Siguiente · en 3 días» / «mañana» |
| Por confirmar | círculo discontinuo | «Por confirmar» / «1 por confirmar» |
| Pagado | ✓ (trazo) | «Pagos registrados» en el detalle |
| Pausado | dos barras | «Pausado desde 3 oct» |
| Finalizado | línea con tope ⊣ | «Finalizado · sin próximos cobros» |
| Cancelado | círculo tachado | «Cancelado desde 9 oct» |
| Estimado | — | «Estimado» bajo el importe (sustituye a «≈») |

## 2. Tokens (`src/ui/tokens.ts`)

### Color

| Token | Claro | Oscuro | Uso | Contraste medido |
|---|---|---|---|---|
| `bg` | #FFFFFF | #111111 | Página | — |
| `raised` | #FFFFFF | #191919 | Hoja/diálogo | — |
| `surface` | #F5F5F5 | #202020 | Agrupación sutil, pulsado, pista de barras | — |
| `ink` | #171717 | #F5F5F5 | Texto principal, selección | 17.93 / 17.32 sobre `bg` |
| `muted` | #686868 | #ABABAB | Secundario y ayuda (nunca más claro) | claro 5.57 bg · 5.11 surface; oscuro 8.22 bg · 7.66 raised · 7.10 surface |
| `control` | #858585 | #777777 | Borde que identifica un control | claro 3.69 bg · 3.38 surface; oscuro 4.22 bg · 3.93 raised · 3.64 surface |
| `divider` | #E7E7E7 | #333333 | Separador decorativo (no transmite información) | 1.24 / 1.49: decorativo |
| `strong` / `onStrong` | #171717 / #FFFFFF | #F5F5F5 / #111111 | Acción primaria y opción elegida | 17.93 / 17.32 |
| `focus` | #171717 | #F5F5F5 | Anillo de foco web (`--mes-focus`) | 17.93 / 17.32 sobre bg; 16.13 sobre raised oscuro |
| `scrim` | negro 40 % | negro 62 % | Velo bajo la hoja | — |

Notas de medición (fórmula WCAG 2.x, script en la auditoría):

- Lo deshabilitado (opacidad 0.4) queda exento.
- En oscuro, la hoja `raised` frente al velo da 1.15:1. Su límite lo marca el borde de 1 px `divider`. No es un control, así que 1.4.11 no aplica, pero conviene revisarlo en pantalla real.
- No se declara conformidad completa: estos son los pares usados en esta interfaz.

### Espacio, tipo, radios, tamaño y movimiento

- **Espacio:** 4 · 8 · 12 · 16 · 24 · 32 · 48 (`space.xxs … xxl`).
- **Tipo** (tamaño/interlínea):
  - `display` 40/46 (escritorio `displayWide` 52/58; por debajo de 380 px efectivos la cifra principal usa `amount` 30/36);
  - `title` 28/34 (escritorio 36/42);
  - `amount` 30/36;
  - `heading` 20/26;
  - `body` 16/22 (nombres de filas y campos; 16 evita el zoom de iOS al enfocar);
  - `bodySm` 15/21;
  - `secondary` 14/20;
  - `meta` 13/18;
  - `caption` 12/16, solo para lo prescindible (versión, pie).
- **Pesos:**
  - 400 normal;
  - 500 nombres e importes;
  - 600 botones y seleccionado;
  - 700 solo la marca.
- **Cifras tabulares** en todo el texto (`fontVariant: tabular-nums`). Los importes siempre llevan dos decimales en listas, para alinear la columna.
- **Radios:**
  - 8: celdas y días;
  - 12: campos, avisos, tarjetas de opción;
  - 20: hoja;
  - píldora: botones y fichas.
- **Tamaño táctil: 48 × 48 mínimo** en todos los controles (objetivo de producto, superior al mínimo AA de WCAG 2.2).
- **Movimiento:**
  - 160 ms para presión/opacidad (web, CSS);
  - fundido de la Modal de React Native para la hoja (duración de plataforma).
  - Con movimiento reducido no hay animación.
- **Puntos de quiebre sobre el ancho efectivo** (ancho ÷ escala de texto):
  - < 380: compacto;
  - ≥ 600: tableta;
  - ≥ 960: escritorio con barra lateral;
  - ≥ 1200: columnas en Mes.

### Excepciones ópticas documentadas

- Columna de fecha de las filas: 44 px de ancho (día a 20 px y mes a 13 px). Encaja dos dígitos y «sep» sin saltos.
- Barra de pestañas de 56 px y pie de acción de 64 px. Contienen objetivos de 48 con aire.
- Fichas con detalle (favoritos) usan radio 12 en lugar de píldora, porque tienen dos líneas.
- Selector de fecha: celda de 20 % del ancho con 2 px de separación. A 320 px cada día mide unos 54 px; un calendario de 7 columnas daría unos 41 px.

## 3. Iconos (`src/ui/icons.tsx`)

- **Familia propia:** cuadrícula de 24, trazo 1.75, extremos redondeados, dibujada con `react-native-svg`.
- **Nombres:**
  - navegación: `calendar` (Mes), `repeat` (Recurrentes), `list` (Movimientos);
  - acciones: `plus`, `check`, `chevron*`, `close`, `more`, `search`, `edit`, `arrowRight`;
  - avisos: `info`, `alert`;
  - estados: `dot`, `pending`, `pause`, `end`, `cancel`;
  - tipo de movimiento: `out` (gasto), `in` (ingreso), `refund` (devolución), `installment` (pago de deuda);
  - tema: `sun`, `moon`, `system`; tendencia: `trend`.
- **Son decorativos para tecnologías de asistencia.** El nombre lo aporta el control o el texto contiguo, y ningún icono sustituye una etiqueta crítica.

## 4. Componentes (`src/ui/components/`, `src/ui/rows.tsx`, `src/ui/sheets/shared.tsx`)

| Componente | Semántica | Estados | Equivalencia React Native |
|---|---|---|---|
| `Txt` | texto; `accessibilityRole="header"` en títulos | primario, secundario, inverso | `Text` con escala y cifras tabulares |
| `MoneyText` | importe; en nativo lee «129.00 pesos mexicanos» | normal, `fit` (ajusta al ancho), centavos pequeños, signo «+» o «−» tipográfico | `Text` + `onLayout`; en web no se pone `aria-label` (está prohibido en div sin rol) |
| `Button` | `button` | primary (relleno), secondary (contorno), quiet (enlace subrayado), plain (sin contorno), pulsado, deshabilitado (`aria-disabled`), expandido (`aria-expanded`) | `Pressable` ≥48 |
| `IconButton` | `button` con nombre obligatorio | normal, contorno, pulsado, deshabilitado | `Pressable` 48×48 |
| `ChipGroup` | `radiogroup` con `radio` (`aria-checked`) | elegido (relleno invertido), deshabilitado, con detalle de dos líneas | `Pressable` |
| `Checkbox` | `checkbox` (`aria-checked`) | marcado, sin marcar | `Pressable` ≥48 |
| `RadioCard` | `radio` con consecuencia escrita | elegido (borde 2), deshabilitado con motivo legible | `Pressable` |
| `SwitchRow` | `switch` (`aria-checked`), fila completa | encendido, apagado | `Pressable`; sustituye al `Switch` nativo, cuya pista en web mide 40×20 |
| `Disclosure` | `button` con `aria-expanded` | abierto, cerrado | `Button quiet` |
| `Field` | campo con etiqueta visible; en web, `aria-invalid` y `aria-describedby` | normal, enfocado (anillo), error (borde 2 + mensaje con icono), ayuda | `TextInput` (mín. 52) |
| `DateField` | botón «Etiqueta: fecha. Cambiar fecha» + panel | cerrado/abierto, día elegido, hoy (borde), fuera de rango (deshabilitado), «Sin fecha» (si es opcional), escritura AAAA-MM-DD con lectura humana | cuadrícula secuencial de 5 columnas, no por semanas |
| `QuickDate` | `radiogroup` Hoy / Ayer / Otra fecha | elegido; «Otra fecha» abre `DateField` con máximo hoy | — |
| `SearchField` | búsqueda con nombre y «Limpiar búsqueda» | vacío, con texto | — |
| `StatusTag` | texto (no interactivo) | today, soon, toConfirm, paid, paused, ended, cancelled, estimated, note | `View` + icono |
| `Notice` | aviso agrupado | informativo, confirmación con acciones | `View` sobre `surface` |
| `ErrorSummary` | `alert` + región viva asertiva | error del formulario | — |
| `EmptyState` | título + explicación + acción | sin datos, sin resultados | — |
| `Toast` | región viva educada permanente | mensaje, con «Deshacer» (48) | react-native-web no implementa `announceForAccessibility` |
| `Sheet` | Modal con nombre = título; título enfocable como foco inicial | abierta, cambio de contenido sin cerrar, zona de acción fija, descarte | `Modal` + `KeyboardAvoidingView` + `SafeAreaView` |
| `SectionHeader`, `KeyValue`, `Divider` | estructura | — | — |
| `ScheduleRow` | fila de vencimiento o regla: abre el detalle; ✓ registra el pago de esa fecha | siguiente, por confirmar, en espera («Se confirma después del 6 oct»), estimado, apilada (<380 o importe largo) | — |
| `EntryRow` | fila de movimiento: editar | gasto, ingreso (+), devolución (+), pago de deuda; nota; apilada | — |
| `CurrencyPicker` | botón + diálogo de `radio` | elegida (borde 2 + ✓) | Modal propia |

**Sobre los estados en web:** el `hover` no tiene estilo propio y el `pressed` usa `surface`. No hay estado de carga porque la única operación asíncrona es exportar, que es instantánea. Los estados offline y de sincronización no existen en la alfa y no se simulan.

## 5. Pantallas y recorridos

### Estructura

- **Móvil:**
  - barra superior de 56 px con «mes.» y el aviso «Prueba · tus cambios se borran al recargar», más ⋯ para Ajustes;
  - título del período con ‹ › («Hoy» si se navegó a otro mes);
  - franja de contexto con [Personal ▾] [MXN ▾], y «También hay USD» si aplica;
  - contenido;
  - pie de acción «＋ Registrar gasto» fuera del área desplazable;
  - pestañas Mes · Recurrentes · Movimientos.
- **Escritorio (≥960):**
  - barra lateral de 240 px con marca, «por Sistemas Digitales», pestañas, aviso de prueba, Ajustes y versión;
  - «Registrar gasto» flotante abajo a la derecha (la sombra solo en la píldora);
  - Mes a dos columnas desde 1200 (máx. 1080 px);
  - Recurrentes y Movimientos con ancho de lectura de 760 px.

### Mes

1. **«Por pagar · 3–31 oct»** con la moneda y la cifra.
   - El intervalo es explícito: de hoy (o del día 1 en meses futuros) al último día.
   - Debajo: número de pagos, «incluye importes estimados» y, si hay atraso de meses anteriores, «aparte, N de meses anteriores por confirmar».
2. **«Por confirmar · 1–2 oct (N)»** aparte: vencimientos pasados del mes sin pago registrado.
   - No se llaman «vencidos», porque el banco pudo haberlos cobrado.
   - La suma de ambas cifras concilia con `summary().upcoming` (prueba en `derive.test.ts`).
3. **Lista por fecha.** El primer vencimiento desde hoy lleva «Siguiente · en N días» o «Vence hoy». Se muestran 5 filas; «Ver los N pagos de octubre» aparece solo si hay más.
4. **«Meses anteriores: N por confirmar · $X»**: grupo desplegable propio después de la lista. No se suma al total del mes.
5. **Gasto neto del mes** y las categorías en una línea (barra rellena; las devoluciones netas en contorno con «−»).
   - Leyenda: «Cada barra compara la categoría con la mayor; no son porcentajes del total. Las categorías suman el gasto neto.»
   - Con devoluciones: «Consumo $X − devoluciones $Y».
   - Ingresos y cuotas pagadas aparecen aparte, con la aclaración «no forman un saldo».
6. **Presupuesto de gastos:**
   - sin límite: «Sin límite en MXN. Puedes observar tu gasto…» y «Fijar un límite»;
   - con límite: «Restante del presupuesto de gastos», límite, gasto neto, barra (rol `progressbar`) y «No es tu saldo bancario»;
   - en otro mes: «Se usa el límite vigente como referencia; Mes aún no guarda un límite distinto para septiembre»;
   - «Cuotas por pagar en octubre» solo si es mayor que 0, «aparte del presupuesto de gastos».
7. **Meta:**
   - aportado frente a objetivo, porcentaje, barra y faltante, más «Registrar aporte»;
   - si la meta está en otra moneda que la vista, se rotula y no cambia con el filtro;
   - sin aportes, no hay barra vacía: se explica qué es aportar.
8. **Observación**, solo si hay un aumento registrado en los últimos dos meses: dato, porcentaje, período y fecha, más «Ver iCloud». En una anualidad se añade su equivalente mensual, rotulado como distinto del cobro real. Si no hay evidencia, se omite.

### Captura rápida («Registrar gasto»)

- **Título y destino.** El título sigue al tipo («Registrar gasto», «Registrar ingreso», …). El subtítulo muestra el destino, «En Personal · MXN».
- **Importe** con prefijo coherente con las listas («$», «USD», «EUR») y selector de moneda. En web móvil, `autoFocus` no garantiza que iOS abra el teclado (pendiente en dispositivo).
- **Favoritos** con importe y categoría:
  - completan nombre y categoría, y el importe solo si está vacío (editable);
  - en USD o EUR no hay importe sugerido y se explica que no se convierte.
- **Fecha:** [Hoy · 3 oct] [Ayer · 2 oct] [Otra fecha]. «Otra fecha» abre el selector con máximo hoy.
- **Categoría** en fichas. «Sin clasificar» viene por defecto.
- **Detalles:** nombre (el marcador muestra el nombre que se usará si se deja vacío), tipo, forma de pago (incluye «Sin especificar») y nota.
- **Zona de acción fija:** «Guardar gasto en Personal».
- **Confirmación breve** con «Deshacer». Deshacer restaura la instantánea anterior **solo si nada más cambió desde entonces** (`data === after`); si hubo otro cambio, no se ofrece.
- **Editar un pago vinculado:**
  - aviso del vencimiento;
  - checkbox «El total de ese vencimiento fue $X, no $Y» si el importe difiere y la regla era fija;
  - «Retirar movimiento» con su consecuencia escrita, desplazamiento hasta la confirmación y foco en «Retirar».

### Recurrentes, detalle, pago y formulario

- **Lista:**
  - filtros con conteo: Activos (n), Pausados y terminados (n), Todos (n);
  - búsqueda; encabezados de columna desde 600 px;
  - fila con fecha, nombre, «Tipo · frecuencia · medio», estados escritos y el importe previsto con «Estimado» si aplica;
  - marca «N por confirmar».
- **Detalle:**
  - importe, frecuencia y tipo, más el estado;
  - 3 próximos cobros con año;
  - «Por confirmar (N)» con «Registrar» por fecha (o «Después del anterior»);
  - datos, avisos (deuda sin saldo ni intereses, cancelación con el proveedor, pausa), cambios de precio con diferencia y porcentaje, y pagos registrados;
  - acciones: Editar, Pausar desde hoy / Reanudar y revisar fecha, y «Registrar pago del 16 oct» en la zona fija.
- **Pago:**
  - vencimiento exacto y su estado, importe previsto o estimado, importe pagado y fecha (Hoy/Ayer/Otra);
  - checkbox de total distinto, que explica qué se da por cubierto y que no hay abonos parciales;
  - «Después de registrarlo: Próximo vencimiento 12 nov 2026» o «Sin próximos cobros»; si quedan otras fechas, «Siguen por confirmar: …»;
  - «Mes no transfiere dinero ni avisa al proveedor».
- **Formulario:**
  - orden: nombre → tipo → importe y moneda (fija al editar) → importe variable → frecuencia → próximo cobro → vista previa de fechas con año → categoría → Detalles (forma de pago, fin de prueba, última cuota, cancelar desde, nota);
  - **cambio real de tipo** que quitaría la prueba o la última cuota: confirmación en línea («¿Cambiar a Servicio? Se quitará última cuota (12 dic 2026)…» [Cambiar tipo] [Conservar Cuota de deuda]); pulsar el mismo tipo no cambia nada (A1);
  - **cambio de fecha o frecuencia:** dos `RadioCard` con fechas calculadas por el dominio (`previewScheduleChange`):
    - «Mover el calendario desde el vencimiento del 6 oct 2026»;
    - «Conservar pendientes y cambiar los cobros futuros», que se deshabilita con su motivo si la nueva fecha no es posterior;
  - cambio de importe, frecuencia, tipo, variabilidad, final o cancelación con vencidos sin confirmar: aviso de que conservan su importe y condiciones.

### Movimientos

- Filtros: Todos · Gastos · Ingresos · Devoluciones · Cuotas.
- Búsqueda por nombre, categoría o nota, y conteo («10 movimientos en octubre · con filtros (de 12)»).
- Encabezados de día: «Hoy · sáb 3 oct», «Ayer · vie 2 oct».
- Filas con el icono del tipo, «Tipo · categoría · medio» (o «vencimiento 6 oct» si es un pago vinculado), nota e importe con «+» en ingresos y devoluciones. El signo nunca sustituye al tipo escrito.
- Vacíos distintos:
  - «Aún no registras movimientos en octubre» → Registrar gasto;
  - «No hay resultados para estos filtros» → Limpiar filtros.

### Ajustes, espacios, presupuesto y meta

- **Ajustes:**
  - aviso de datos ficticios;
  - apariencia «Según el sistema / Claro / Oscuro», que dura mientras la pestaña esté abierta;
  - Exportar copia (JSON, sin importador);
  - Empezar en blanco y Restaurar ejemplo, con consecuencia escrita, Cancelar y «Deshacer» después;
  - «Aún no disponible».
- **Espacios:** `radio` Personal / Casa · ejemplo («Tú y Alex · datos ficticios. No es colaboración real.»).

## 6. Texto

Se eliminaron los eslóganes: «Tu dinero, a la vista.», «Cada pago, en su momento.», «Un mes más claro.» y «Una cosa a la vez.».

Términos fijos:

- «Por pagar», «Por confirmar», «Vence hoy», «Siguiente», «Estimado»;
- «Restante del presupuesto de gastos», «Cuotas por pagar», «Gasto neto»;
- «Registrar pago del 12 oct», «Guardar gasto en Personal»;
- «Sin especificar», «Sin clasificar».

Se usa género coherente («Activos», «Pausado», «Cancelado»). Los avisos explican la consecuencia antes de la acción y no culpabilizan («El gasto neto supera el límite por $X.»).

**Preparación para otros idiomas:** el texto vive en componentes y permite que las frases crezcan (fichas que se envuelven, sin alturas fijas en texto). No hay selector de idioma porque no existen traducciones.

## 7. Marca (`assets/brand/`)

- **Una evolución del estudio de 0.1.2:** «m.» con el punto final de «mes.», en cuadro de radio 15/64. Trazo 5.5/64 en el maestro (`mark.svg`, `mark-dark.svg`).
- **Variante óptica de 16 px** (`mark-16.svg`, favicon) con trazo 7.5/64, punto más grande y tema claro/oscuro dentro del SVG.
- **Vista previa:** `docs/design/marca-16-24-48.png`.
- **Uso:** en la interfaz la marca es el logotipo tipográfico «mes.» y no ocupa el centro de la pantalla. Es provisional y requiere validación de nombre y registro.
