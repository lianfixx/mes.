# Verificación de la entrega documental

Fecha: **3 de noviembre de 2026**, México. Código base comprobado: `db0e7761266004e8f3315e9eada54d2e84e1e80b`, Mes 0.1.3. Node 24.19.0, npm 11.9.0. El cambio documental no modifica fuente de aplicación, pruebas ni dependencias.

## Comprobaciones de esta ejecución

| Comprobación                              | Resultado                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Estado al iniciar                         | `main` limpia, alineada con `origin/main`; ambas ramas remotas de Mes en el SHA base.                                                                  |
| Integridad previa                         | Las 128 entradas del manifiesto recibido coincidían antes de editar documentación.                                                                     |
| ZIP de 0.1.2                              | 22 archivos; `unzip -t` correcto; 20 entradas del manifiesto interno válidas.                                                                          |
| Integridad de los adjuntos                | TXT y ZIP coinciden con sus hashes originales; anexos A/B coinciden con los hashes del texto recuperado al excluir el salto final añadido.             |
| Fuente de dominio                         | `src/domain/model.ts` idéntico a la importación `fcfa3eb`.                                                                                             |
| `npm test`                                | 39 aprobadas, 0 fallidas, canceladas, omitidas o pendientes; 27 heredadas + 9 de derivados + 3 de formato.                                             |
| `npm run typecheck`                       | Sin errores.                                                                                                                                           |
| `npm run format:check`                    | Correcto.                                                                                                                                              |
| `npm run build`                           | Exportación web correcta; bundle `index-92bd9c71a5e543a12e121cbdf6e55e98.js`.                                                                          |
| `npm run dev -- --port 5173 --strictPort` | Arranque correcto; HTTP 200, título `Mes · Finanzas`, bundle de la app y favicon accesibles. Servidor propio detenido al terminar.                     |
| QA web                                    | Terminó con código 0; informe y resultados inspeccionados, detalle debajo.                                                                             |
| Sintaxis del script cloud                 | `bash -n docs/entorno/install-cloud.sh`, correcto. Script copiado del borrador previo; instalación íntegra ejecutada históricamente el 28 de octubre.  |
| Revisión de credenciales en originales    | Sin coincidencias de patrones de claves privadas, tokens habituales o asignaciones de credenciales. Es una búsqueda de patrones, no una certificación. |

Las dependencias instaladas se conservaron del onboarding; no se afirma una instalación desde cero ni la restauración del entorno en otra máquina durante esta tarea documental.

## QA y alcance real

Evidencia generada a las `2026-11-03T23:19:22.044Z` (17:19 de México): [informe legible](evidencia/2026-11-03/qa-report.md), [datos completos](evidencia/2026-11-03/qa-report.json). Reloj fijo de la app: 3 de octubre de 2026, 12:00, `America/Mexico_City`. Los datos de los recorridos son ficticios.

Comando ejecutado, con salida temporal después copiada sin cambios:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/mes-playwright npm run qa -- --out /tmp/mes-documentacion-qa-Roj57r
```

- 78 combinaciones de 13 anchos × tres pantallas × dos temas, más seis casos de zoom emulado/altura reducida en claro: **84** en total; cero desbordes u objetivos inferiores a 48 px detectados.
- Próximo pago visible al abrir en 320×568, 390×844, 430×932 y 390×667.
- Cinco hojas en cuatro combinaciones de viewport/tema: 20 comprobaciones de nombre, foco, reflujo y acción visible donde aplica.
- Recorridos de Escape/retorno, foco tras cambio de ancho, importe cero, fechas parciales/incorrectas, importe extremo, nombre largo, favorito/deshacer, total corregido, cambio de tipo, alcance de calendario y cinco pagos que vencen hoy rotulados 5/5.
- 16 inspecciones de axe (tres pantallas y cinco hojas en claro/oscuro), sin infracciones automáticas.
- Cero errores registrados de consola o página.

Navegador real: **Chromium de sistema 154.0.8037.57**, con Playwright 1.56.1 y axe-core 4.10.3. El navegador fijado por Playwright es Chromium 141 build 1194 y no es el binario usado. El [entorno](../entorno/README.md) explica el recurso al navegador del sistema. El encabezado genérico del informe identifica Playwright, no la versión del binario.

El caso de «zoom 200 %» del script reduce el viewport CSS a 640×400; no es una prueba de Dynamic Type ni de ampliación del texto del sistema. No se tomaron nuevas capturas con `--shots`; las capturas anteriores permanecen en `docs/qa` con su propia procedencia.

## Dependencias: resultado actual y anterior

`npm audit --omit=dev --json` devolvió **código 1** por vulnerabilidades: **29** entradas, 14 bajas, 11 moderadas, 4 altas, 0 críticas. [Informe JSON completo de esta consulta](evidencia/2026-11-03/npm-audit-omit-dev.json).

Los paquetes con severidad alta en esta consulta son `@expo/cli`, `@expo/code-signing-certificates`, `node-forge` y `zod`. El recuento incluye propagación por dependencias; no equivale a 29 vulnerabilidades únicas explotables en la app. No se aplicó `audit fix` ni se cambió el lockfile.

La sesión del 28 de octubre registró 26 entradas (15 bajas, 6 moderadas, 5 altas). Se conserva como dato histórico, no se reutiliza como resultado vigente. El análisis actual del registro cambió sin una actualización del código/dependencias de esta entrega. Revisar alcance, soluciones y regresiones en un trabajo de dependencias antes de producción.

## Límites pendientes

No se validaron dispositivos físicos iOS/Android, lectores de pantalla reales, teclado/safe areas nativos, Dynamic Type, listas grandes ni recorridos con personas. La QA web no certifica accesibilidad integral, seguridad o rendimiento nativo. No existen backend, cuentas, persistencia ni colaboración real que puedan darse por probados.

Los reportes temporales de octubre ya no estaban presentes. Se conserva el resumen histórico y se adjunta evidencia nueva con fecha propia. Guardar/publicar este repositorio no publica la app ni demuestra publicación o restauración del entorno cloud.
