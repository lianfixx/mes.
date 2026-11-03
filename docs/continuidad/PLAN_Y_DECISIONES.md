# Plan y decisiones de Mes

Fecha de actualización: 3 de noviembre de 2026, México. Fuentes: instrucciones de Emi en esta sesión, [continuidad original](originales/Mes_Continuidad_Codex_2026_10_23.txt), [plan maestro v0.4](historico/Plan_Maestro_App_Finanzas_v0_4.md), [brief](historico/Prompt_Claude_Design_Mes_2026-10-03.txt), código 0.1.3 y sus pruebas.

## Objetivo y prioridades

Crear un producto de finanzas personales de Sistemas Digitales para México, primero en español y con iPhone/Android como destinos; web cuando resulte viable. Mes es provisional. Emi trabaja solo, tiene Mac e iPhone y prefiere costos bajos. El producto debe poder mantenerse sin depender de este chat ni de una API de IA.

El orden de la experiencia es próximos pagos → gasto del mes → restante del presupuesto si existe → meta y observaciones sustentadas. Captura rápida con fecha retroactiva, favoritos y nota opcional. Blanco, negro y grises; temas claro/oscuro; lenguaje breve y sin juicios sobre gastos. Presupuestos, metas, deuda y gastos compartidos son prioridades de producto.

La aspiración comercial es una suscripción, con beta cerrada antes del lanzamiento. No hay precio, límites de planes, fecha pública, presupuesto total ni contratación aprobados. El escenario histórico de aproximadamente USD 25/mes no es un máximo de gasto ni una orden de contratar. Se deben revisar precios y políticas oficiales antes de decidir.

## Plan de configuración ejecutado

El plan de onboarding contemplaba preservar los adjuntos, importar la base 0.1.2 en el repositorio inicialmente vacío, crear `main`, instalar con lockfile, probar, arrancar y guardar instrucciones reutilizables.

Al continuar el 28 de octubre se encontró una entrega 0.1.3 en la rama `claude/mes-design-refinement-qpbxfs`. Se verificó su procedencia respecto del ZIP y se adoptó su historial, evitando una segunda importación. Se creó `main` en el mismo commit y se subió a GitHub. Se comprobó el entorno y se guardó el borrador cloud. La [bitácora](CONVERSACION_Y_BITACORA.md) conserva la secuencia y las limitaciones.

El encargo del 3 de noviembre añade la continuidad completa a GitHub y sustituye el criterio anterior de dejar el TXT fuera de Git.

## Etapas y criterios de aceptación

Esta secuencia organiza el trabajo pendiente; no implica que se haya ejecutado ni que estén autorizados pagos o despliegues.

| Etapa                                 | Estado                                           | Resultado para darla por cerrada                                                                                                                                |
| ------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base 0.1.2 y procedencia              | Conservada                                       | ZIP original, hashes y origen del código identificados.                                                                                                         |
| Diseño 0.1.3                          | Implementado y comprobado en web                 | Mantener reglas de dominio, próximos pagos visibles, captura y alcance de calendario claros, ambos temas y estados límite. QA web no sustituye pruebas físicas. |
| Entorno de desarrollo                 | Validado en esta máquina; configuración guardada | Instalación fijada, pruebas, compilación, arranque y QA reproducibles. Publicación/restauración en otra tarea requiere evidencia propia.                        |
| Continuidad en GitHub                 | Objeto de esta entrega                           | Fuente y contexto recuperable, originales íntegros, índice, plan, parámetros, comandos y evidencia versionados en `main`.                                       |
| Base técnica de la beta               | Pendiente                                        | Revisar dependencias vulnerables y diseñar esquema/migraciones, repositorios de datos y comandos fuera del estado React.                                        |
| Cuentas y almacenamiento              | Pendiente                                        | Autenticación, verificación, recuperación, cierre de sesión, almacenamiento durable y separación de ejemplos de datos de usuario.                               |
| Espacio compartido de dos personas    | Pendiente                                        | Membresía autorizada en servidor, invitaciones verificadas/caducables/de un uso, revocación, historial y aislamiento entre usuarios.                            |
| Sincronización y captura sin conexión | Pendiente                                        | Consulta reciente, nuevos gastos en cola, identificadores estables, reintentos idempotentes, versiones/conflictos y tratamiento de permisos revocados.          |
| Recuperación y privacidad             | Pendiente                                        | Exportación/borrado probados, respaldo restaurado de verdad, sesiones seguras, telemetría sin contenido financiero y mapa de proveedores.                       |
| Recordatorios                         | Pendiente                                        | Canal teléfono, sin importes bloqueado, permisos al activar y reconciliación al cambiar fechas/pagos/zona. La agenda funciona si el permiso se deniega.         |
| Beta física                           | Pendiente                                        | Dos cuentas y dispositivos, iPhone/Android, teclado, safe areas, VoiceOver/TalkBack, texto al 200 %, movimiento reducido, offline y recorridos con personas.    |
| Lanzamiento comercial                 | Pendiente                                        | Utilidad validada, nombre/titular, documentos y políticas vigentes, modelo de precio, derechos de suscripción, soporte y distribución coherentes.               |

## Trabajo técnico que sigue

La continuidad inicial quedó publicada en `047355f`. La auditoría posterior añade [skill, sesiones y contrato entre IA](../../skills/mes-continuidad/SKILL.md), con [hallazgos y comprobaciones](auditorias/2026-11-03-protocolo.md). Cada siguiente etapa debe usar ese protocolo; preparar el entorno o registrar una entrega no implementa por sí mismo la beta.

1. Revisar el informe de dependencias y planear una actualización por separado, con regresiones. No confundir la disponibilidad del entorno con preparación para producción.
2. Definir límites de repositorios y comandos de aplicación antes de reemplazar la sesión temporal. El dominio de dinero y fechas debe seguir independiente de React y de servicios externos.
3. Evaluar PostgreSQL/Supabase, candidato documentado, con costos y operación reales. No está conectado. Esquema propuesto en [arquitectura](../ARCHITECTURE.md): perfiles, espacios, membresías, invitaciones, categorías, medios, reglas, vencimientos, movimientos, presupuestos, metas/aportes, auditoría y dispositivos.
4. Modelar vencimientos como registros propios. Usar restricción única por regla/fecha y transacciones para confirmación/avance. Las instantáneas de la demo no sustituyen un historial durable.
5. Probar primero el aislamiento de dos usuarios, dos confirmaciones simultáneas, una edición obsoleta y revocación. Un selector Personal/Casa no concede permisos.
6. Preparar almacenamiento local nativo y cola de comandos. Para la primera beta, editar registros existentes, confirmar pagos compartidos y cambiar membresías requieren conexión según el plan; la captura de nuevos gastos puede quedar pendiente.
7. Implementar y probar recuperación, exportación, borrado y recordatorios; después ejecutar la beta física y pruebas con personas.

Cada cambio debe identificar requisito, implementación, efecto sobre datos y prueba. Separar commits de esquema, migración, reglas, UI y permisos cuando corresponda.

## Decisiones que se conservan

- Un presupuesto compartido implica otra persona con su cuenta en el mismo espacio; el personal sigue privado. Autor, pagador y participante son distintos. No se divide todo al 50 % ni se duplican registros en espacios personales.
- La app no necesita conectar un banco para empezar. Medio de pago es un alias; los campos de tarjeta avanzada requieren su propio modelo.
- En la fuente de Notion, «Fecha de Corte» significa fecha de cobro del servicio. CHECK significa confirmado para un vencimiento concreto; no es verificación bancaria.
- Macbook fue descrito como cuota mensual de crédito y Dentista como gasto mensual de salud. Faltan frecuencias/fechas para importar otros registros; no se inventan. No se han importado datos de Notion.
- Mes calendario; moneda por registro; presupuesto opcional. MXN/USD/EUR están implementadas sin conversión. EN/FR son objetivos; no hay traducciones completas ni cuarto idioma elegido.
- Analítica aceptada solo sin importes, notas, comercios ni detalles de pago. No se ha instalado aquí un sistema comercial de analítica.
- Repositorio privado/licencia propietaria fue la recomendación histórica. La solicitud de guardar en GitHub no concede licencia de código abierto ni ordena cambiar la visibilidad.

## Decisiones e insumos pendientes

Nombre y marca definitiva; segmento inicial preciso y alcance adulto; calendario y dedicación; backend definitivo y costos; precio/planes; titular/clasificación de tiendas; revisión legal vigente; traducciones revisadas; datos faltantes de Notion si se pide importar; dispositivo Android de prueba; modelo de abonos, tarjetas, reparto y OCR.

La colaboración real, recuperación y captura básica sin conexión son compromisos de la beta. No se eliminan del plan por no existir en la alfa. RevenueCat, OCR, conexión bancaria y marketing siguen siendo posibilidades posteriores, con evaluación y alcance propios.

No repetir todo el cuestionario: consultar las **40 respuestas** del TXT y preguntar únicamente cuando una decisión concreta dependa de un dato aún ausente.
