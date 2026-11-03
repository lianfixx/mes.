# Quién hizo qué antes del protocolo

Fecha: 3 de noviembre de 2026. Corte del inventario: `047355f648f9bd99b17a7b5d1f265fab6841e3f0`. [Metadatos completos y atribución por commit](autoria-historica.json).

| Trabajo                                                        | Identidad Git observada                  | Ejecutor atribuible y evidencia                                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Importación de la base 0.1.2, `fcfa3eb`                        | Claude / Claude                          | El commit declara Claude. La importación no demuestra autoría original de la base histórica de Sites.                                                     |
| Dominio derivado y diseño 0.1.3, `eb8bc64`–`db0e776`           | Claude / Claude                          | Atribución declarada por Git y rama histórica; no se dispone del chat original ni del identificador del modelo.                                           |
| Validación, creación de main y configuración del 28 de octubre | No hubo un nuevo commit de código        | Codex, según continuidad recuperada de este hilo. Conservó la historia existente. Los temporales de aquella ejecución ya no están disponibles.            |
| Documentación completa en `047355f`                            | Emiliano Milla / Emiliano Milla          | Codex ejecutó los cambios en el turno anterior visible; Git usó la identidad ya configurada. Emi solicitó el trabajo, no se le atribuye ejecución manual. |
| Auditoría/protocolo entre IA de esta entrega                   | Consultar el nuevo commit y sus trailers | Codex root implementa e integra; subagente `/root/audit_continuity_protocol` revisa y escribe pruebas. La sesión estructurada registra esa separación.    |

No se modificó el historial para cambiar autores. Tampoco se atribuye toda la base de Sites a Claude por el nombre de quien la importó. La [petición pendiente](solicitudes/2026-11-03-claude.md) solicita el contexto que falta de la sesión histórica.

A partir del protocolo, cada registro debe identificar solicitante, ejecutor, revisor e integrador cuando existan, con su fuente de atribución. Si una persona o herramienta no participó, no se la añade como revisora. Las identidades declaradas y los trailers son trazabilidad, no firmas criptográficas de un modelo.
