# Continuidad de Mes

Actualizado el **3 de noviembre de 2026**, fecha de México. Proyecto de Emi / Sistemas Digitales. Este índice permite retomar el trabajo desde GitHub con el código, las decisiones y las fuentes disponibles.

## Estado al documentar

La aplicación es **Mes 0.1.3**, una demo Expo / React Native / TypeScript con datos ficticios en memoria. El código recibido llega hasta `db0e7761266004e8f3315e9eada54d2e84e1e80b`. Los cambios de esta entrega son documentación, originales y evidencia; no agregan cuentas, persistencia ni funciones financieras.

La rama de trabajo es [`main`](https://github.com/lianfixx/mes./tree/main). Conserva los diez commits de la entrega de Claude. El 3 de noviembre, el `HEAD` remoto todavía apuntaba a `claude/mes-design-refinement-qpbxfs`; por eso los enlaces de continuidad indican `main` explícitamente. La publicación de este material no cambia la visibilidad del repositorio ni despliega la app.

## Qué leer

| Necesidad                                                               | Documento o fuente                                                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ejecutar y conocer el producto actual                                   | [README](../../README.md), [arquitectura](../ARCHITECTURE.md), [traspaso técnico](../HANDOFF.md)                 |
| Reglas de colaboración                                                  | [AGENTS.md](../../AGENTS.md)                                                                                     |
| Plan vigente, etapas y decisiones pendientes                            | [Plan y decisiones](PLAN_Y_DECISIONES.md)                                                                        |
| Reglas financieras, diseño y parámetros técnicos                        | [Reglas y parámetros](REGLAS_Y_PARAMETROS.md)                                                                    |
| Peticiones, plan de onboarding y decisiones de esta conversación        | [Conversación y bitácora](CONVERSACION_Y_BITACORA.md)                                                            |
| Las 40 respuestas, aclaraciones y contexto anterior completo disponible | [TXT original de continuidad](originales/Mes_Continuidad_Codex_2026_10_23.txt)                                   |
| Plan maestro histórico íntegro, v0.4                                    | [Plan del 29 de septiembre](historico/Plan_Maestro_App_Finanzas_v0_4.md)                                         |
| Brief histórico íntegro para Claude Design                              | [Brief del 3 de octubre](historico/Prompt_Claude_Design_Mes_2026-10-03.txt)                                      |
| Paquete de código anterior, alfa 0.1.2                                  | [ZIP original](originales/Mes_Base_v0_1_2_Para_Codex_2026_10_23.zip)                                             |
| Procedencia e integridad de los originales                              | [Inventario](originales/README.md)                                                                               |
| Preparar y arrancar el entorno                                          | [Entorno cloud](../entorno/README.md), [arranque](../entorno/ARRANQUE.md), [script](../entorno/install-cloud.sh) |
| Comprobaciones y límites de esta entrega                                | [Verificación del 3 de noviembre](VERIFICACION_2026-11-03.md)                                                    |
| Diseño implementado y activos editables                                 | [Diseño](../DESIGN.md), [marca](../../assets/brand/)                                                             |
| Evidencia de QA previa                                                  | [Auditoría 0.1.3](../AUDIT_0.1.3.md), [QA](../qa/), [auditoría 0.1.2](../AUDIT_0.1.2.md)                         |

Para un primer traspaso, leer el TXT completo además del índice. Para cambios posteriores, consultar las secciones relevantes y conservar un registro de decisiones y pruebas.

## Cómo interpretar las fuentes

Las peticiones actuales de Emi definen el encargo. El código y las pruebas demuestran lo implementado. El plan y el brief conservan requisitos y propuestas; no demuestran que una función exista. Un resultado de octubre no acredita una ejecución nueva en noviembre.

El TXT decía que no se había recibido la devolución de Claude y que no se conocía un repositorio GitHub. Eso describe el 23 de octubre. El 28 se encontró la rama de Claude, se validó y se conservó íntegra en `main`. Tampoco sigue pendiente dividir `App.tsx`: 0.1.3 ya separó pantallas, componentes y estado.

La autorización del **3 de noviembre** para subir todo el contexto sustituye la anterior conservación del TXT fuera de Git. Los originales se archivan como contexto del proyecto; sus ejemplos personales no se importan a la demo ni se convierten en contenido de la interfaz.

## Alcance de «todo»

Se conserva todo el material de Mes disponible en esta sesión: fuente, pruebas, lockfile, activos, documentación existente, los dos adjuntos, sus anexos íntegros, decisiones conocidas, plan de continuación, configuración reproducible y evidencia. La conversación se registra con sus límites de recuperación explícitos; **no es una exportación literal de todos los chats anteriores**. No se inventan turnos ausentes.

El código completo mantenible está en la raíz del repositorio. `node_modules/`, `dist/`, cachés y proyectos nativos generados se reconstruyen desde fuente; no son copias adicionales del producto. Las credenciales no forman parte de la entrega. La configuración no declara secretos necesarios para ejecutar la demo.

## Punto de continuación

La preparación del entorno y la incorporación del diseño están realizadas. El siguiente hito de producto es preparar la beta con persistencia, cuentas y colaboración real, siguiendo [el plan](PLAN_Y_DECISIONES.md). Antes de usar datos reales siguen pendientes seguridad de dependencias, aislamiento, recuperación y pruebas físicas. No hay contratación de servicios, cobros, campañas ni publicación en tiendas derivados de esta documentación.
