# Reglas y parámetros

Referencia al 3 de noviembre de 2026. Los valores ejecutables completos están en el código y el lockfile. Este documento orienta su interpretación y separa parámetros actuales de propuestas.

## Reglas de trabajo

Continuar desde la fuente existente; conservar cambios ajenos y procedencia. Leer [AGENTS.md](../../AGENTS.md), el [README](../../README.md) y la [arquitectura](../ARCHITECTURE.md). Mantener decisiones, evidencias y pendientes accesibles a otra persona o IA. Investigar fuentes oficiales cuando cambien reglas técnicas, costos o requisitos legales; no presentar referencias históricas como verificaciones de hoy.

Comunicar en español claro y breve. Resolver ajustes reversibles dentro del encargo sin repetir preguntas contestadas. Explicar los cambios de alcance. Distinguir requisito, propuesta, implementado, verificado y pendiente. No declarar seguridad absoluta, perfección ni pruebas que no se ejecutaron.

La sesión temporal y los ejemplos siguen identificados en la UI. El contexto financiero histórico se conserva en documentación; no se carga en la demo, capturas públicas o telemetría. No guardar PAN/CVV, credenciales bancarias, contraseñas o secretos en fuente/fixtures/logs.

## Dinero, calendario y estados

| Parámetro o regla                       | Valor / significado actual                                                            | Fuente                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Monedas                                 | `MXN`, `USD`, `EUR`; 2 decimales cada una, sin conversión                             | `src/domain/model.ts`                                |
| Importe                                 | Unidades menores enteras; validación de entero seguro                                 | `parseMoney`                                         |
| Entrada de importe                      | 1–10 dígitos enteros y hasta 2 decimales; acepta coma decimal; sin separador de miles | `parseMoney`                                         |
| Máximo representable por ese formulario | 9,999,999,999.99 unidades mayores = 999,999,999,999 menores                           | Regla de entrada; no límite bancario                 |
| Cero                                    | Permitido solo cuando el campo usa `allowZero`; gasto/pago positivo                   | `parseMoney` y comandos                              |
| Fechas                                  | Civil `AAAA-MM-DD`, 1900-01-01 a 2100-12-31                                           | `assertDate`                                         |
| Recurrencias                            | Semanal, mensual, anual; ancla preservada                                             | `nextOccurrence`                                     |
| Límite de expansión                     | 12,000 ocurrencias; no truncar totales silenciosamente                                | `occurrences`                                        |
| Pago idempotente                        | Identidad `recurrente:fecha_prevista`                                                 | `paidId`, `confirmPayment`                           |
| Tipos de movimiento                     | Gasto, ingreso, cuota de deuda, devolución                                            | `EntryKind`                                          |
| Tipos/estado recurrente                 | Suscripción, servicio, deuda; activo, pausado, cancelado; finalizado derivado         | `RecurringKind`, `RecurringStatus`, `recurringState` |
| Espacios de demo                        | `personal`, `shared`; Personal/Casa · ejemplo                                         | Modelo y datos ficticios                             |
| Presupuesto                             | Por espacio y moneda; un límite vigente aplicado a los meses consultados              | Modelo actual, sin histórico mensual                 |
| Meta                                    | Una por espacio, moneda propia; aportes declarados                                    | Modelo actual                                        |
| Favoritos                               | Fijos, importes en MXN; no convertir al cambiar filtro                                | `src/app/useMesApp.ts`                               |

Gasto neto = consumo registrado − devoluciones. Ingresos y pagos de deuda van separados. Restante del presupuesto = límite − gasto neto; no es saldo bancario ni capacidad de compra. Una compra a crédito no vuelve a ser consumo al pagar su deuda. Las barras comparan magnitudes netas por categoría, incluidas negativas, no porcentajes del total.

Confirmar registra un pago ya hecho, no ordena un cobro. Un importe distinto del fijo exige reconocer el total corregido; no hay abonos parciales. Retirar un pago restaura su vencimiento e instantánea y conserva pagos posteriores. Pausar conserva anteriores sin confirmar; reanudar no inventa pagos durante la pausa. Un cambio de moneda requiere otro recurrente.

El ancla 31 pasa al último día de febrero y regresa a 31 en marzo; pagar tarde no desplaza por sí mismo la regla. Cancelación desde una fecha es exclusiva de esa fecha; última cuota es inclusiva. Cambiar fecha o frecuencia exige alcance explícito; cambiar condiciones conserva pendientes anteriores. Una selección idéntica de tipo no borra fin de prueba/cuota. Fecha parcial y errores conservan el formulario.

Las reglas completas y casos límite están en [arquitectura](../ARCHITECTURE.md), [traspaso](../HANDOFF.md), [modelo](../../src/domain/model.ts) y sus [pruebas](../../src/domain/model.test.ts). El dominio derivado no debe duplicar estas reglas.

## Diseño e interacción

La fuente exacta de tokens es [src/ui/tokens.ts](../../src/ui/tokens.ts); [DESIGN.md](../DESIGN.md) documenta colores, contraste, componentes, estados y excepciones ópticas.

| Parámetro                         | Valor actual                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------- |
| Fondos principales claro / oscuro | `#FFFFFF` / `#111111`                                                             |
| Texto principal                   | `#171717` / `#F5F5F5`                                                             |
| Texto secundario                  | `#686868` / `#ABABAB`                                                             |
| Borde de control                  | `#858585` / `#777777`                                                             |
| Divisor decorativo                | `#E7E7E7` / `#333333`                                                             |
| Espacios                          | 4, 8, 12, 16, 24, 32, 48                                                          |
| Radios                            | 8, 12, 20, píldora 999                                                            |
| Objetivo táctil                   | 48 × 48 mínimo de producto                                                        |
| Iconos                            | 16 / 20 / 24; familia SVG en cuadrícula de 24                                     |
| Texto habitual                    | 16/22; pequeño operativo 15/21; secundario 14/20; metadatos 13/18                 |
| Ancho efectivo                    | Viewport dividido por escala de texto                                             |
| Puntos de quiebre                 | 380, 600, 960, 1200 efectivos                                                     |
| Barra lateral / contenido         | 240 / 1080; token de lectura 720, variantes por pantalla documentadas             |
| Movimiento                        | Tokens `fast=160`, `base=200` ms; modal según plataforma; reducción de movimiento |
| Tipografía                        | Fuentes de sistema; cifras tabulares cuando se soportan                           |

Navegación Mes / Recurrentes / Movimientos; próximos pagos primero y acceso permanente a registrar. Moneda, espacio e intervalo visibles. Estados escritos, no solo colores. No simular sincronización, carga o cuentas inexistentes. En web, usar props `aria-*`; componentes declarados a nivel de módulo para conservar foco. Errores asociados al campo y diálogo con foco/Escape/retorno. WCAG 2.2 AA es objetivo, no una certificación obtenida por pasar axe.

## Herramientas y QA

| Parámetro                   | Valor documentado                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Node / npm comprobados      | 24.19.0 / 11.9.0                                                                                                             |
| Expo / React Native / React | `~57.0.26` / `0.86.3` / `19.2.3` en manifiesto                                                                               |
| TypeScript / Vite           | `~6.0.3` / `^8.3.2` en manifiesto                                                                                            |
| Dependencias exactas        | [package-lock.json](../../package-lock.json), lockfile v3                                                                    |
| Playwright / axe-core       | 1.56.1 / 4.10.3                                                                                                              |
| Navegador previsto          | Chromium 141.0.7390.37, build Playwright 1194                                                                                |
| Navegador usado en cloud    | Chromium de sistema 154.0.8037.57 mediante enlace local; diferencia explícita en [entorno](../entorno/README.md)             |
| Reloj de QA                 | 2026-10-03 12:00, `America/Mexico_City`; locale `es-MX`                                                                      |
| Servidor de exportación     | Vite, puerto documentado 5173 con `--strictPort`                                                                             |
| Compilación                 | `npm run build` genera `dist/`; `dev` no recompila la fuente                                                                 |
| Matriz de QA                | 13 anchos × 3 vistas × 2 temas = 78, más 6 casos de zoom emulado/altura reducida en claro = 84; hojas/recorridos adicionales |
| Fecha de informes           | Fecha real de ejecución; distinta del reloj fijo de la demo                                                                  |

## Parámetros propuestos, aún no implementados

Recordatorios tres días antes y el día del cobro a las 9:00, con seguimiento único opcional; valores a validar y editables. Sin importes en pantalla bloqueada. Backend PostgreSQL/Supabase y RevenueCat para derechos comerciales son candidatos, no conexiones activas. Objetivos de usabilidad: favorito en menos de diez segundos y tres recurrentes en menos de cinco minutos con personas; no son resultados medidos.

Aporte sugerido = máximo(0, objetivo − aportado) / períodos restantes válidos: falta fecha objetivo/modelo para ofrecerlo. Las comparaciones de precios y anualidad/12 deben conservar moneda, base positiva y período; ahorro potencial no significa ahorro obtenido.
