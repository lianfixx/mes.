# Entorno reproducible de Mes

Documentación del 3 de noviembre de 2026. La guía `cloud-environment-onboarding:setup` se utilizó para distinguir máquina comprobada, configuración guardada y publicación. El código vigente se trabaja en `main`.

## Archivos

- [install-cloud.sh](install-cloud.sh): copia del script de instalación guardado durante el onboarding y leído de nuevo el 3 de noviembre. Fue ejecutado íntegramente el 28 de octubre. El 3 de noviembre se revalidaron pruebas, compilación, arranque y QA sobre las dependencias conservadas; no se atribuye una nueva instalación limpia a esa revisión.
- [ARRANQUE.md](ARRANQUE.md): instrucciones actuales para futuras sesiones, incluyendo el contexto ya versionado y la exportación explícita de la ruta del navegador.
- [configuracion-observada-2026-11-03.json](configuracion-observada-2026-11-03.json): fotografía de los parámetros no secretos leídos al comenzar la tarea. No es una llamada para aplicar configuración ni afirma que las sugerencias estén activas.
- [Verificación](../continuidad/VERIFICACION_2026-11-03.md): comandos ejecutados y alcance de la evidencia.

## Reproducir fuera de cloud

Requisitos: Node.js 24 y npm. Desde la carpeta del proyecto:

```sh
npm ci
npm test
npm run typecheck
npm run format:check
npm run build
npm run dev -- --port 5173 --strictPort
```

Para QA, preparar Chromium con `npx playwright install --only-shell chromium` y ejecutar `npm run qa -- --out <carpeta-de-resultados>`. La exportación web no requiere secretos ni un backend. `npm run ios` requiere macOS/Xcode; `npm run android` requiere su entorno y dispositivo/emulador. Las pruebas web no validan esos destinos nativos.

## Parámetros cloud guardados al iniciar esta revisión

| Campo                                                  | Valor observado                                                |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| Checkout                                               | `/workspace/mes.`; montaje `mes.`                              |
| Repositorio                                            | `github.com/lianfixx/mes.`                                     |
| Referencia guardada previamente                        | `db0e7761266004e8f3315e9eada54d2e84e1e80b`                     |
| Script                                                 | Igual a `install-cloud.sh`                                     |
| Red                                                    | Restringida, preset `package_managers`                         |
| Dominios añadidos para navegador                       | `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` |
| Variable sugerida pendiente                            | `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/mes-playwright`    |
| Requisitos runtime activos devueltos por configuración | Lista vacía; no supone ausencia de herramientas de plataforma  |
| Secretos requeridos                                    | Ninguno                                                        |

Los dominios heredados del preset están conservados en el JSON, separados de los dos dominios personalizados. Guardar dominios no demuestra que la red activa ya los permita. No es necesario copiar un token para usar el acceso Git inyectado por la plataforma; acceso Git y acceso a la API de GitHub son capacidades distintas.

La copia de configuración es histórica: conserva el SHA y las instrucciones anteriores, incluida la decisión inicial de no subir el TXT. Esa decisión queda sustituida por la solicitud expresa de Emi del 3 de noviembre y por `ARRANQUE.md`. El borrador debe apuntar al commit documental de `main` para restaurar también este contexto. No se sustituye la fotografía histórica por una afirmación de publicación.

## Chromium: diferencia comprobada

Playwright 1.56.1 espera Chromium **141.0.7390.37**, build **1194**. En el onboarding, los dos destinos de descarga devolvieron 403. Se comprobó el navegador del sistema, **Chromium 154.0.8037.57**, y se usó mediante:

```text
/workspace/.cache/mes-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell
  -> /usr/bin/chromium
```

El script reutiliza el ejecutable si existe; si falta, intenta descargar el navegador fijado y después permite ese recurso de sistema. Esto conserva el procedimiento probado, pero el nombre de la carpeta no prueba la versión del binario. La QA de esta máquina corresponde al Chromium de sistema. En una instancia sin navegador ni acceso a las descargas, la preparación fallará: se debe resolver la instalación, no declarar la QA ejecutada.

No se desactivó TLS ni la validación de integridad de paquetes. No se cambió `package-lock.json` ni se ejecutó `npm audit fix` como parte de documentar el entorno.

## Conservación y publicación

Git conserva fuente, pruebas, documentación, activos y lockfile. Dependencias, cachés y `dist/` se regeneran. Los archivos temporales de informes del 28 de octubre ya no estaban presentes el 3 de noviembre; los resultados nuevos se archivan con fecha propia.

Guardar un borrador cloud no ejecuta el script, activa variables ni publica una imagen. La publicación corresponde al control **Publicar** del producto después de revisar/guardar la configuración. La restauración en una tarea nueva requiere su propia verificación. No se afirma aquí que se haya publicado o probado esa restauración.
