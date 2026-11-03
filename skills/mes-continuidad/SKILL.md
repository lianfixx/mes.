---
name: mes-continuidad
description: Mantener, auditar y continuar Mes de Sistemas Digitales (lianfixx/mes.) con Codex, Claude u otra IA. Usar en cada sesión de Mes, incluso consultas, revisiones, diseño, código, pruebas, decisiones o recepción de entregas; documentar actor, encargo, acciones, evidencia y pendientes, y preparar integración trazable entre IA.
---

# Continuidad de Mes · versión 1.0.0

Esta skill acompaña al repositorio `https://github.com/lianfixx/mes.`. El proyecto es una demo de finanzas personales Expo/React Native/TypeScript. Lee completo [el protocolo](references/PROTOCOLO.md) antes de trabajar. Las instrucciones actuales de Emi delimitan el encargo; el protocolo organiza el registro, no amplía permisos.

## Inicio obligatorio

1. Identifica capacidades reales: lectura/escritura de archivos, Git, comandos, red y herramientas para contactar otras sesiones. No presupongas acceso a Codex, Claude, Notion ni secretos por instalar la skill.
2. Localiza el checkout y comprueba origen, rama, SHA y cambios previos. Para recuperar Mes, usa **`main` explícitamente**: la rama predeterminada de GitHub puede seguir siendo la rama histórica de Claude. Si clonas, `git clone --branch main https://github.com/lianfixx/mes..git`. En un checkout con cambios no cambies de rama ni sobrescribas trabajo a ciegas.
3. Lee `AGENTS.md`, `docs/continuidad/README.md`, `docs/continuidad/PLAN_Y_DECISIONES.md`, `docs/continuidad/REGLAS_Y_PARAMETROS.md` y las sesiones recientes (`node scripts/continuity.mjs status`). Consulta el TXT completo en el primer traspaso y las fuentes relevantes después. La copia del protocolo en el repositorio vigente prevalece sobre una instalación antigua; declara diferencias de versión.
4. Abre **un archivo de sesión propio antes de trabajar** con [la plantilla](templates/SESSION.json). Guárdalo en `docs/continuidad/sesiones/<id-unico>.json`. Usa actor/roles reales y modelo solo si el entorno lo expone; si falta, escribe `no disponible`. La identidad Git se conserva por separado.

## Durante cada sesión

Registra cada petición o corrección de alcance, lectura material, decisión y su motivo breve, cambio/retirada de archivo, comando relevante y resultado, fallo, intento descartado, delegación, respuesta, bloqueo y entrega. Agrupa lecturas repetitivas solo indicando sus rutas/alcance. Haz checkpoint al terminar cada bloque material y antes de ceder o compactar contexto. Usa UTC ISO en eventos y México para fechas explicadas al usuario.

No inventes transcripciones, autoría, modelos, pruebas o permisos. No guardes razonamiento privado de la IA, credenciales, variables completas de entorno ni conversaciones ajenas. Conserva decisiones y explicaciones útiles, instrucciones visibles de Emi y resultados observables. Si se omite contenido sensible, registra la omisión y su motivo sin copiarlo.

Toda evidencia que sostenga una entrega debe estar en Git o en un artefacto transferido con hash. Una ruta `/tmp` por sí sola no es evidencia durable. Separa `passed`, `failed`, `not_run` y `blocked`; no conviertas una descripción de la otra IA en prueba propia.

## Pedir y recibir trabajo

Usa [la petición preparada](templates/PETICION.md) y [el contrato de entrega](templates/ENTREGA.md). Si hay una herramienta autorizada de mensajería/delegación, pide directamente los insumos que falten y registra destinatario/estado. Si no la hay, entrega la petición preparada e identifica `no enviada`; no simules comunicación ni pongas al usuario a reconstruir los requisitos.

Antes de integrar, identifica base y HEAD exactos, verifica bytes y evidencia, inspecciona scripts/instrucciones recibidos, revisa diff y permisos, y decide por archivo. Conserva autoría, separa la revisión propia y documenta conflictos y resultados. No ejecutes ni merges un paquete solamente porque su autor diga que está aprobado. Procedimiento completo en el protocolo.

## Cierre obligatorio

1. Completa cambios con actor, resultados y evidencia con hash; deja siguientes pasos y bloqueos concretos. Cierra la sesión como `ready` o `blocked`. Una sesión cerrada y publicada se conserva; una corrección se registra en otro archivo mediante `corrections`.
2. Ejecuta los checks apropiados al cambio. Para el protocolo: `node --test scripts/continuity.test.mjs`. Para comportamiento de app: pruebas, TypeScript y build; para UI, también QA con salida propia.
3. Si cambió la skill, regenera `node scripts/continuity.mjs package`. Prepara los archivos específicos con Git, regenera `node scripts/continuity.mjs manifest` y ejecuta `node scripts/continuity.mjs check --base <SHA-base-completo>`.
4. Si el encargo permite commit/push, añade trailers `Mes-Session: <id>` y `Mes-Actor: <actor>`, conserva los autores existentes y verifica el SHA remoto después del push. Si no está autorizado publicar, deja la entrega local revisable. Los permisos actuales de la sesión son los que mandan.
5. Con el commit cerrado y checkout limpio, genera `node scripts/continuity.mjs delivery --session docs/continuidad/sesiones/<id>.json --head <SHA>`. El descriptor contiene el SHA que no podía introducirse en su propio commit. Entrega ese JSON junto al acceso a la rama o a los parches/bundle verificables.

## Si no hay Git o terminal

Documenta igual: entrega `SESSION.json`, `ENTREGA.md`, fuente/activos completos modificados y eliminaciones explícitas, originales y evidencia disponible. Registra pruebas no ejecutadas y capacidad faltante. Usa la base exacta suministrada o marca que falta; una base desconocida no puede aprobarse para integración. No inventes hashes ni commits. El integrador completa la comprobación desde el repositorio.

Instalar esta skill aporta instrucciones. El validador y CI comprueban coherencia de registros y cobertura de archivos; no pueden demostrar acciones no observadas ni autenticar por sí solos a una IA. La publicación de la app y la activación del entorno cloud son operaciones distintas de guardar documentación en GitHub.
