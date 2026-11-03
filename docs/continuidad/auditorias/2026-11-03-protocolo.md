# Auditoría de continuidad, autoría e integración entre IA

Fecha: 3 de noviembre de 2026, México. Base auditada: `047355f648f9bd99b17a7b5d1f265fab6841e3f0`. Alcance: documentación operativa, skills, atribución, preservación de evidencia, recepción de trabajo y comprobaciones automatizadas. La app sigue en 0.1.3; no se alteran reglas financieras, UI ni dependencias.

Codex root realizó la inspección/implementación. El subagente Codex `/root/audit_continuity_protocol` hizo una lectura independiente del estado inicial y escribió pruebas en `scripts/continuity.test.mjs`; el root revisó los resultados y corrigió `scripts/continuity.mjs`. Son agentes de la misma familia de herramienta, no una revisión de Claude ni diversidad de proveedor demostrada.

## Hallazgos y tratamiento

| ID  | Prioridad | Evidencia inicial                                                                                            | Tratamiento                                                                                                                                                                                      |
| --- | --------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A01 | Alta      | `047355f` figura como Emiliano Milla en Git aunque fue ejecutado por Codex; la bitácora no distinguía roles. | Inventario histórico con grado de certeza; actores/roles/origen de atribución por sesión y trailers. No se reescribió historia.                                                                  |
| A02 | Alta      | No había SKILL.md, CLAUDE.md ni entradas de skill.                                                           | Skill 1.0.0 autocontenida, protocolo y plantillas, ZIP verificado y puentes de proyecto iguales para Codex/Claude. Instalación real en Claude pendiente.                                         |
| A03 | Alta      | No existía contrato con base/HEAD exactos, inventario y pruebas transferibles.                               | Plantillas de petición/entrega, descriptor calculado desde objetos Git y verificación sin ejecutar la entrega. Procedimiento de integración y recuperación.                                      |
| A04 | Media     | Bitácora retrospectiva; informes temporales de octubre ya perdidos.                                          | Sesiones propias, checkpoints, eventos ordenados, registro de fallos y evidencia durable con hash. El pasado incompleto permanece marcado como tal.                                              |
| A05 | Media     | La instrucción de documentar no tenía comprobación ejecutable.                                               | CLI sin dependencias de app y CI de lectura; valida estructura, evidencia, cobertura de archivos, skill/manifiesto y no reescritura de cierres.                                                  |
| A06 | Media     | `HEAD` remoto sigue apuntando a la rama histórica de Claude.                                                 | Recuperación/instalación exige main explícitamente. La API GitHub devolvió Forbidden al consultar metadatos; no se modificó la rama predeterminada.                                              |
| A07 | Media     | Varias IA editarían la misma bitácora/manifiesto sin contrato de concurrencia.                               | Sesiones con ID único, correcciones referenciadas, preservación de registros y regeneración del manifiesto sobre resultado integrado. Prueba de merge/conflicto real en repositorios temporales. |

La documentación previa ya preservaba originales, hashes, contexto de producto y límites de QA. El hueco principal era convertir ese archivo histórico en un procedimiento que una siguiente sesión pueda comprobar.

## Revisión adversarial del validador

La primera suite independiente produjo ocho casos negativos que el CLI no rechazaba, reflejados en diez resultados fallidos de Node al incluir los dos grupos padre. Se corrigieron:

- Ejecutor sin rol de ejecución.
- Comprobación antes o después del período de sesión (dos casos).
- ZIP con un symlink cuyo texto aparentaba coincidir con la fuente canónica.
- Evidencia ausente o alterada dentro del commit, aunque los hashes externos del descriptor se hubieran recalculado (dos casos).
- Identificador del registro distinto de su ruta/descriptor.
- Symlink Git presentado como archivo ordinario.

La revisión también identificó que un archivo modificado por ambas IA no podía atribuirse a sus autores originales solo por compartir la ruta. El checker ahora compara los bytes del resultado de cada sesión contra el resultado integrado; una resolución nueva necesita una declaración del integrador. Se prueba con dos ramas que chocan sobre el mismo archivo, además del conflicto del manifiesto.

Se eliminó la dependencia de cualquier rama local arbitraria para buscar snapshots. Se usa el historial del HEAD y los orígenes aceptados explícitamente por una sesión de integración; sus objetos deben estar disponibles. El recorrido probado conserva historia con merge. Cherry-pick/squash necesita conservar los objetos y atribución de origen; no se afirma que una copia sin historia sea equivalente.

## Comprobaciones y evidencia

Resultado final: **50/50** comprobaciones del protocolo, sin fallos ni omitidas. [Salida conservada](../evidencia/2026-11-03-protocolo/pruebas-protocolo.txt). La verificación adicional de la aplicación pasó **39 pruebas**, TypeScript, formato y build; [comandos, salidas y códigos](../evidencia/2026-11-03-protocolo/comprobaciones-app.json). No se modificaron el código de la app ni sus dependencias.

La suite se ejecuta con `node --test scripts/continuity.test.mjs`, usando repositorios y ZIPs temporales, sin red. La [sesión de esta auditoría](../sesiones/20261103t233649z-codex-auditoria-ia.json) inventaría la evidencia y los resultados finales. El registro se abrió durante el arranque del propio protocolo; su fase de inspección inicial se identifica como reconstrucción del checkpoint, no como bitácora contemporánea inexistente.

Cobertura: identidad ausente/duplicada, cronología y eventos, resultados/exit codes, evidencia, rutas absolutas/traversal/symlinks, integridad y omisiones del manifiesto, archivos añadidos/modificados/eliminados/renombrados sin registro, cierres inmutables, eventos previos conservados, dos sesiones concurrentes, conflictos de contenido, paquetes incompletos, extracción portable, entrega exacta de Git, SHA/base/inventario/commits/bytes alterados y checkout emisor sucio.

La comprobación del ZIP compara cada archivo con la skill canónica y comprueba recursos tras extraer en una carpeta nueva. No acredita que Claude haya cargado la skill ni que una cuenta tenga habilitada esa función. Los puentes de proyecto tienen contenido idéntico y el protocolo se mantiene en una única fuente.

El workflow está versionado con `contents: read`, `persist-credentials: false`, fetch completo y acciones fijadas por SHA; no instala dependencias de app ni usa secretos. Su configuración local se revisa aquí; la ejecución remota/protección de rama se informa solo si puede comprobarse por GitHub.

## Fuentes, pendientes y límites

Los README oficiales de Anthropic Skills y OpenAI Skills se consultaron vía GitHub. La documentación web directa de Claude Code/Codex devolvió 403; la [guía de instalación](../INSTALAR_SKILL.md) no presenta esa lectura fallida como comprobación de interfaces. La API del repositorio también devolvió Forbidden; el acceso Git de lectura/push se comprueba separadamente.

No hay conexión activa con Claude. La [solicitud concreta](../solicitudes/2026-11-03-claude.md) está preparada, no enviada. El nuevo protocolo permite pedir directamente los insumos cuando exista un canal autorizado, y conservar la diferencia entre preparada, enviada, recibida, revisada e integrada.

Persisten los límites del producto documentados previamente: demo temporal, sin backend/cuentas/colaboración real ni pruebas físicas. El informe de dependencias del turno anterior registra 29 avisos (cuatro altos); esta auditoría de continuidad no los corrige ni los convierte en aprobación de producción. No se repite QA de UI porque la interfaz no cambió.

La skill, hashes y CI no pueden demostrar exhaustividad de acciones no observadas, veracidad semántica de cada relato o identidad criptográfica de una IA. Exigen coherencia y evidencia recuperable; la revisión del trabajo sigue siendo necesaria. Tampoco se ha configurado una protección de rama obligatoria ni se ha publicado/restaurado el entorno cloud por añadir estos archivos.
