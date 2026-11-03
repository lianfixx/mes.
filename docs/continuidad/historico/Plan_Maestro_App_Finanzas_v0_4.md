# Plan maestro de la aplicación de finanzas

Versión 0.4 · 29 de septiembre de 2026 (hora de México) · Colaboración, cuotas y flujos de la primera beta

Este documento incorpora las respuestas de Emi y la lectura de su página «Suscripciones». Distingue decisiones, recomendaciones provisionales y condiciones de publicación. Aún no se ha seleccionado un nombre, creado una cuenta de desarrollador ni publicado software.

## 1. El producto

Una aplicación personal de Sistemas Digitales que responde tres preguntas sin obligar al usuario a estudiar finanzas: **¿qué viene por pagar?, ¿en qué gasté? y ¿qué puedo mejorar para cumplir una meta?** Registrará suscripciones, pagos recurrentes, gastos cotidianos, ingresos elegidos por cada persona, presupuestos opcionales, metas de ahorro y deudas básicas. Los avisos y las observaciones serán claros y privados. La app y su motor de recomendaciones funcionarán sin ChatGPT ni una API obligatoria de IA.

Se diseñará como producto comercial desde el inicio, con una **beta cerrada inicial** para comprobar que la experiencia funciona antes de cobrar y abrirla al público. El público inicial son personas en México: estudiantes universitarios, profesionistas y personas con ingresos regulares o variables, incluidos ejecutivos y empresarios que quieran ordenar sus finanzas **personales**. Emi pidió una recomendación sobre edad: propongo lanzar inicialmente para mayores de 18 años, para concentrar validación, privacidad, contratación y soporte en adultos. Es una recomendación de alcance del producto; no se presenta como una obligación universal de la ley o de las tiendas. Contabilidad empresarial, facturación y tesorería de una compañía constituyen otro alcance.

| Decisión de Emi | Traducción al producto |
| --- | --- |
| App Store y Play Store, ambas plataformas | Una base de producto y pruebas reales en iPhone y Android antes del lanzamiento. |
| Web «si es posible» | Reutilizar modelo y componentes; publicar la web cuando su seguridad, funcionamiento y presupuesto estén probados. |
| México y español; soporte a inglés y francés | es-MX como idioma base; preparar internacionalización desde el primer día y revisar traducciones, pagos y fichas antes de ofrecer cada idioma. No elegir un cuarto idioma sin mercado definido. |
| Mes calendario | Todos los resúmenes usan meses calendarios; la frecuencia de cada ingreso o cobro se configura por separado. |
| Cuenta individual, respaldo, sincronización y presupuesto compartido | Espacio personal privado y espacio compartido opcional; acceso por membresía, exportación y recuperación verificadas. |
| Múltiples monedas opcionales | Registrar moneda de cada importe; no sumar divisas distintas ni aplicar una tasa supuesta. MXN será el inicio predeterminado. |
| Blanco y negro, modos claro y oscuro, movimiento sutil | Sistema visual original, icono propio, grises solo para jerarquía si Emi lo confirma, animaciones cortas y háptica discreta. |
| Analítica aceptada | Solo eventos técnicos/de flujo, sin importes, nombres de comercios, notas ni detalle financiero; información y controles reales para los usuarios. |
| Titular actual: Emi, sin cuentas de desarrollador | Resolver clasificación de tiendas y titular antes de pagar cuentas o prometer fecha de publicación. |
| Equipo: Emi con Mac e iPhone | Se necesitarán pruebas reales en Android mediante participantes/dispositivos prestados o adquiridos. |

La referencia visual de Sistemas Digitales se verificó directamente en `https://emilianomilla.site/negocios`: fondo blanco, tipografía negra de gran tamaño, logotipo SD, grises secundarios, separadores finos y botones de contorno o fondo negro. Es una observación visual de la página publicada, no una auditoría de su código, seguridad o versión móvil. La página de Notion se revisó el 29 de septiembre de 2026 (México); la lectura y sus límites se detallan en la sección 9.

## 2. Experiencia inicial

La navegación propuesta es **Mes · Recurrentes · Movimientos**, con un botón constante para anotar un gasto. En *Mes*, la primera tarjeta será **Próximos pagos**, seguida por **Gastado este mes**. **Restante del presupuesto de gastos** aparecerá solo cuando la persona configure un límite; durante las primeras semanas puede observar sin fijarlo. Cuando exista deuda, se mostrarán junto a esa cifra las **Cuotas por pagar**, con la aclaración «cuotas de deuda por separado»; el restante no se presentará como dinero libre ni saldo bancario. Una meta de ahorro mostrará aportaciones registradas y distancia al objetivo, sin deducir que gastar menos equivale automáticamente a dinero ahorrado.

Para la visualización inicial se proponen barras horizontales de gasto **real** por categoría, con cantidad escrita. Con al menos dos períodos comparables se podría añadir evolución mensual. Un gráfico presupuesto contra gasto se muestra únicamente a quien creó un presupuesto. Un calendario o lista de próximos pagos responde mejor a la prioridad de no olvidarlos. El diseño monocromo usará texto, forma y contraste además de tonos.

El registro rápido parte del **importe**, muestra favoritos como pasajes, comidas o bebidas y permite completar categoría y medio de pago en pocos toques. La fecha se puede retroceder para capturar más tarde lo que se gastó con prisa. Se conserva una nota opcional y se puede corregir una entrada. Efectivo y tarjeta se eligen como medios de pago; una tarjeta guardada para referencia usa alias y, si se desea, últimos cuatro dígitos, nunca credenciales bancarias. La foto de tickets queda como mejora: reconocer importes y comercio con fiabilidad en dos plataformas necesita permisos, revisión por el usuario y tratamiento de imágenes.

Un recurrente guarda nombre, importe fijo o variable, periodicidad, próximo vencimiento, categoría, estado y medio de pago. Contemplará pruebas gratuitas, pausas, cambios de precio con fecha de efecto y cancelaciones futuras. Cada fecha produce un vencimiento histórico distinto. **Previsto**, **pagado** y **cancelado** no son sinónimos: un aviso no confirma el cargo y la compra con tarjeta no se vuelve a contar como gasto al pagar el estado de cuenta.

Las recomendaciones iniciales son reglas legibles: aumento respecto al precio anterior, coste anual de recurrentes y avance matemático hacia una meta. Se mostrarán como máximo una a tres, con período, dato y cálculo. Un ejemplo sobre compras frecuentes describirá el patrón registrado sin juzgar un gasto pequeño o necesario. Esta base sigue la distinción entre [seguimiento de gastos, calendario de pagos y flujo de efectivo del CFPB](https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/toolkit/).

## 3. Alcance ordenado

| Etapa | Funciones | Razón |
| --- | --- | --- |
| **Primera beta cerrada** | Cuenta individual; recurrentes completos y avisos; gasto e ingreso manual; favoritos y notas; Mes y barras por categoría; presupuestos optativos; una meta; registro básico de deuda, saldo y pagos; presupuesto compartido entre dos cuentas para la beta; etiquetas de tarjeta; exportación; sincronización y captura básica temporal sin internet; español. | Resuelve pagos próximos y claridad mensual con una operación diaria muy sencilla. |
| **Preparación del lanzamiento público** | Pruebas de Android/iOS, restauración y seguridad; revisiones de inglés y francés, textos de tienda y soporte según idiomas ofrecidos; modelo gratuito/Pro y pagos en tienda si validamos disposición a pagar; documentos y clasificación de la cuenta. | Publicar requiere producto, infraestructura y declaraciones coherentes. |
| **Ampliaciones** | Corte y fecha de pago de tarjeta, meses sin intereses e intereses; grupos de más participantes y saldos de reparto entre personas; lectura local de tickets; conexión bancaria; web de consulta/edición y, si se cobra allí, cobro web coordinado. | Cada función agrega reglas financieras, superficie de seguridad o trabajo por plataforma. Se evaluará y probará separadamente. |

La deuda básica podrá representar saldo indicado por el usuario, cuotas y pagos. Emi confirmó colaboración real entre cuentas: la beta incorporará un presupuesto compartido, empezando por dos participantes para probarlo, además del espacio personal. La membresía y el historial de cambios forman parte del producto. Compartir un presupuesto no implica repartir gastos al 50 % ni compartir toda la cuenta. El cálculo de saldos entre participantes será una ampliación.

Para recordatorios, el punto de partida a probar es **tres días antes y el día del vencimiento a las 9:00**, con un seguimiento único si sigue sin confirmarse. Todo será editable y silenciable. El aviso de pantalla bloqueada no incluirá importes. La agenda dentro de la app seguirá mostrando los vencimientos si una notificación se retrasa o no aparece. Se pedirán permisos al activar la función, y se reprogramarán alertas al editar, pausar o pagar.

## 4. Tecnología y continuidad

La opción provisional mejor ajustada a un desarrollador principal, iPhone y Android simultáneos y presupuesto contenido es **React Native + Expo + TypeScript**, con la lógica de dinero, recurrencias y recomendaciones en módulos separados de la interfaz. Expo [permite compartir trabajo con web](https://docs.expo.dev/workflow/web/), aunque web requiere controles y pruebas propios. Flutter sigue siendo una alternativa si la evaluación de diseño y mantenimiento cambia la decisión.

Para cuentas y sincronización, **PostgreSQL/Supabase** es candidato: autenticación, datos por espacio y controles de acceso revisables según usuario y membresía vigente. En el teléfono se guardarán datos recientes y operaciones pendientes. Crear movimientos sin conexión exige identificadores estables, cola de envío, prevención de duplicados y tratamiento de conflictos; no se obtiene sincronización automática por combinar dos bases de datos. El calendario de pagos nace del modelo de datos, no del estado de las notificaciones.

La suscripción comercial, cuando se configure, usará los sistemas de compra de Apple y Google. RevenueCat es un candidato para gestionar derechos entre plataformas, no un componente imprescindible para registrar gastos. Se compararán su coste, dependencia y migración antes de incorporarlo. La web y una eventual compra web requieren una política de acceso coherente y comprobación de reglas por región.

Recomiendo **repositorio privado, propiedad de Emi**, inicialmente con licencia propietaria; puede abrir partes o cambiar la licencia después de revisar dependencias y estrategia. Privado no significa cautivo: el proyecto tendrá Git, README, instrucciones de compilación local, versiones fijadas, migraciones SQL, documentación de cálculos y recurrencias, prueba de reconstrucción por un tercero, exportación de datos, copias verificadas y secretos fuera del repositorio. La app funcionará sin ChatGPT. Puedo ayudar a programar, revisar y corregir en sesiones de trabajo, pero el servicio publicado necesita infraestructura y un responsable humano.

## 5. Dinero y fechas sin ambigüedad

Los importes se guardarán como unidades menores enteras o decimales exactos con moneda indicada; tasas de cambio, fecha y redondeo se registran solo cuando la persona decide convertir. No habrá un «total» engañoso de MXN más USD.

**Gasto mensual** = movimientos de consumo registrados para el mes, incluidos recurrentes pagados una sola vez, menos reembolsos. La fecha de compra o cargo se distingue de la fecha en que se paga la tarjeta; esta última no vuelve a imputar el consumo. **Próximos pagos** = vencimientos pendientes dentro de fechas visibles. **Equivalente mensual** de una anualidad = costo anual ÷ 12 para comparación; el cobro real conserva su fecha e importe íntegros. **Avance de meta** = aportaciones efectivas ÷ objetivo. **Aporte sugerido** = (objetivo − aportado) ÷ períodos restantes, etiquetado como cálculo condicionado a los datos registrados. **Ahorro potencial** de reducir un servicio = diferencia de costes en un plazo explícito, nunca ahorro ya obtenido.

Se probarán 29/30/31 y fin de febrero, zonas horarias, intervalos quincenales frente a cada catorce días, anualidades, servicios de importe variable, pausa, cambios de precio, devolución, pago tardío y reconexión. Compra a crédito, vencimiento de la tarjeta y pago de la tarjeta son eventos distintos; este último cambia efectivo/deuda, no vuelve a sumar consumo. [Actual Budget describe esta distinción](https://actualbudget.org/docs/budgeting/credit-cards/).

## 6. Coste, tiendas y titular

La infraestructura se puede prototipar con niveles gratuitos, pero un lanzamiento comercial con datos sincronizados necesita respaldos y correo de autenticación aptos para producción. [Supabase Pro parte de USD 25/mes](https://supabase.com/pricing), con un primer proyecto y respaldos diarios; pueden sumarse correo, dominio y consumos excedentes. La cuenta de [Apple cuesta USD 99/año](https://developer.apple.com/programs/enroll/) y [Google USD 25 una vez](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), antes de comisiones por compras dentro de la app. No es un presupuesto total de desarrollo ni de operación.

**Hito que puede condicionar la publicación:** Google define servicios financieros como los relacionados con gestión de dinero, incluso consejo personalizado. Su política de requisitos, con vigencia indicada el **30 de septiembre de 2026**, establece cuenta de **organización** para proveedores de productos y servicios financieros. Apple señala que las apps de ámbitos muy regulados, como servicios financieros, o que requieren información sensible deben presentarse por la entidad legal que presta el servicio. Una marca comercial «Sistemas Digitales» no crea por sí misma esa entidad. No existe en estas fuentes una exención expresa por escribir gastos manualmente, pero la clasificación exacta del producto será una cuestión de alcance y revisión de las tiendas; tampoco se deduce de ello una licencia bancaria mexicana para este registro. [Google: política y alcance](https://support.google.com/googleplay/android-developer/answer/10788890?hl=en), [servicios financieros](https://support.google.com/googleplay/android-developer/answer/9876821?hl=en); [Apple: revisión 5.1.1(ix)](https://developer.apple.com/app-store/review/guidelines/).

Ruta propuesta: construir y probar una beta técnica bajo control de Emi; documentar con precisión funciones y flujo de datos; consultar la clasificación aplicable antes de elegir cuentas de tienda; si se confirma organización, preparar una entidad verificable y D-U-N-S para el lanzamiento público. No se abrirán cuentas con una categoría inexacta para acelerar trámites. Si se decide cobrar, se diseñarán precio, contenido y cancelación transparente tras probar utilidad y disposición de pago.

Con cuentas y sincronización habrá aviso de privacidad, términos, mapa de datos/proveedores, seguridad, exportación, borrado de cuenta, soporte y declaraciones fieles ante las tiendas. El texto mexicano deberá ajustarse a la [LFPDPPP vigente](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf) y a los tratamientos efectivamente realizados. Las traducciones de interfaz, fichas, paywall y soporte son entregables distintos.

## 7. Seguridad, soporte y verificación

El referente de auditoría móvil será [OWASP MASVS](https://mas.owasp.org/MASVS/): mínimo de datos, aislamiento por usuario, cifrado y gestión de secretos adecuados, ausencia de importes o notas en telemetría, copias restaurables, borrado comprobado y revisión de dependencias. Si se usa Supabase se probarán las políticas de acceso a cada tabla expuesta. No existe seguridad absoluta ni entrega garantizada de cada aviso.

La beta deberá demostrar con personas reales que se pueden crear pagos, entender lo pendiente, registrar un gasto habitual en segundos y corregir errores. Como objetivos de prueba, no cifras observadas, se propone: una persona configura tres recurrentes en menos de cinco minutos; registra un favorito en menos de diez segundos; identifica el siguiente vencimiento sin explicación; y las pruebas de cambios de mes, precio y conexión no duplican cargos. Se registrarán fallos y comentarios en iPhone y Android.

Yo puedo ayudarte a redactar respuestas de soporte, investigar fallos, revisar registros que me compartas y preparar correcciones. **No atiendo de forma autónoma una bandeja ni vigilo la app las 24 horas**. Emi figurará como responsable inicial de soporte; antes de publicar se prepararán un correo o formulario, preguntas frecuentes y un procedimiento para incidencias importantes.

## 8. Próximas decisiones y trabajo inmediato

1. **Notion:** significado de columnas confirmado: Fecha de Corte = fecha de cobro; CHECK = pago confirmado del vencimiento correspondiente. Macbook es crédito con cuota mensual; Dentista es mensual. Faltan próximas fechas vigentes, periodicidad de los otros siete registros y datos del crédito para una importación completa. Se puede diseñar y programar con datos ficticios mientras tanto.
2. **Gastos compartidos:** confirmado presupuesto con colaboración real. Implementar y comprobar invitación, aceptación, acceso, cambios concurrentes y retirada de un miembro antes de probar con información real.
3. **Límite de gasto:** Emi considera aceptable el escenario de infraestructura de aproximadamente USD 25/mes y prefiere betas de menor costo. Prototipo e integración de prueba en niveles gratuitos cuando resulte viable; decidir el paso a producción con un presupuesto completo. Esta respuesta no equivale a contratar un servicio ahora.
4. **Identidad:** referencia de Sistemas Digitales ya verificada. Preparar un nombre de producto y variantes de identidad con icono editable, y aplicar la dirección visual descrita en la sección 12. La disponibilidad de nombres y marcas se comprobará antes de adoptar uno.

Después seguirán, en orden, los flujos completos, el sistema visual, un prototipo probatorio y el repositorio ejecutable. Cada cambio tendrá su decisión, evidencia, efecto sobre datos/seguridad y prueba correspondiente. Este plan se revisará con las fuentes oficiales nuevamente antes de cualquier pago, integración financiera o envío a las tiendas.

## 9. Auditoría de «Suscripciones» y diseño de importación

La [página «Suscripciones»](https://app.notion.com/p/178081e58ab880cf9c90d09ab61a4741) contiene una base de datos en tabla y una gráfica incrustada de Chartbase. Al leer la base el 29 de septiembre de 2026 (México) había **nueve filas, todas con estado «Activa»**. Las columnas son «Suscripción», «Precio» (formato MXN), «Fecha de Corte», «Categorías », «Estado», «Tarjeta Vinculada» y «CHECK». Las categorías actuales son Salud, Proyectos, Finanzas, Servicios, Educación y Entretenimiento. Una gráfica externa está incrustada, pero no se obtuvo su configuración ni se verificó qué cálculo hace: no se copiará su resultado como cifra validada.

La tabla incluye servicios digitales y ejemplos como **Macbook** y **Dentista**. Emi confirmó que Macbook es una cuota mensual de compra a crédito y Dentista un gasto mensual de salud. La entidad central será *compromiso de pago*, con subtipos: suscripción, servicio recurrente y cuota de deuda. En la interfaz podrán convivir en Recurrentes, con su tipo escrito. Las cuotas de deuda no se tratan como suscripciones indefinidas.

| Campo actual | Campo propuesto | Regla de migración |
| --- | --- | --- |
| Suscripción | Nombre de recurrente | Conservar texto y enlace de origen para trazabilidad. |
| Precio | Importe previsto en MXN | Conservar importe, marcar como previsto y pedir si es fijo o estimado; no registrar un gasto histórico. |
| Fecha de Corte | Fecha de cobro | Emi confirmó el significado; conservar la fecha y pedir el próximo vencimiento vigente cuando la fecha esté desactualizada. |
| Categorías  | Categoría inicial | Conservar el valor y permitir equivalencias al catálogo de la app. |
| Estado | Estado inicial | Conservar Activa/Pausada/Cancelada; comprobar fechas de efecto cuando proceda. |
| Tarjeta Vinculada | Alias del medio de pago | Las nueve filas están vacías; dejar sin medio de pago y no inferir una tarjeta. |
| CHECK | Estado del vencimiento | Emi confirmó que significa pagado. Las nueve filas estaban sin marcar al leerlas; conservar el marcador como información de esa fecha, sin reconstruir pagos anteriores ni afirmar deuda vencida. |

**Calidad observada:** no hay una columna de periodicidad. Emi confirmó frecuencia mensual de Macbook y Dentista; faltan los otros siete registros. Dentista no tiene fecha; hay fechas de cobro pasadas y futuras. No se deducirá que una fecha pasada sea impago ni se avanzará automáticamente a otro mes durante la importación. Tampoco existe historial de precios, pagos efectivos, moneda por fila, fecha de cancelación ni identificador de tarjeta. La suma simple de «Precio» no representa necesariamente el gasto de un mes porque se ignoran frecuencias y estados de pago.

La primera importación deberá mostrar cada fila y solicitar solo los datos imprescindibles: **tipo, frecuencia y próximo vencimiento confirmado**; se podrá omitir una fila. El precio y categoría vendrán precargados, siempre editables. Para filas sin fecha se ofrecerá «sin recordatorio hasta definir fecha». Se guardará un identificador estable de origen y un registro de importación para evitar duplicados al repetir el proceso. No se alterará la tabla original. La app funcionará con registro manual para cualquier otro usuario y no requerirá una conexión permanente con Notion.

Esta auditoría no equivale a leer movimientos bancarios ni a validar que los importes se hayan cobrado. La información personal de la página se usó solo para diseñar la experiencia y el mapeo; cualquier captura pública o demo empleará datos ficticios.


## 10. Presupuesto compartido: alcance de la primera beta

Cada persona tendrá su propia cuenta. El selector superior mostrará **Personal** o el nombre del presupuesto compartido. Todos los totales, movimientos, recurrentes y metas visibles corresponderán al espacio seleccionado. La acción de guardar mostrará ese nombre para evitar registrar un gasto personal en el compartido.

Para la beta propongo un titular y un colaborador; se probará primero con dos cuentas. El titular administra límites y participantes. Ambos pueden registrar movimientos y corregir los compartidos, dejando autor, momento e historial de cambios. Una corrección de importe modifica el resumen y permanece rastreable. El invitado ve el alcance antes de aceptar. No se invitó a ninguna persona en esta etapa de diseño.

Las invitaciones estarán ligadas a un correo verificado, caducarán y podrán revocarse; el token será de un solo uso. No se necesitará compartir contraseña. El espacio personal y su importación de Notion siguen aislados: cada fila se asigna explícitamente al espacio escogido. Las tarjetas personales se referencian mediante alias; compartir un gasto no comparte la ficha privada completa de una tarjeta.

Un movimiento pertenece a un solo espacio y cuenta una vez en su total. Registrar quién lo pagó es distinto de identificar quién lo anotó. No se generarán copias paralelas en ambos presupuestos personales. La beta no calculará automáticamente lo que una persona debe a la otra; eso requiere definir reparto, aportaciones y reembolsos.

**Sin conexión:** permitir consulta de la copia reciente y captura de nuevos gastos pendientes. Para la primera beta, editar registros existentes, confirmar pagos compartidos, cambiar participantes o aceptar invitaciones requerirá conexión. Se distinguirá información confirmada del servidor de las operaciones locales pendientes. Si otra persona cambió la misma versión, se mostrará el cambio antes de aceptar una corrección; no se sobrescribirá silenciosamente.

**Retirada de acceso:** el titular puede retirar al colaborador y este puede salir. Se bloquean nuevas lecturas y escrituras del servidor y se conserva el historial de registros compartidos. La app limpia su copia compartida cuando detecta la retirada; no puede recuperar capturas o exportaciones previas ni borrar al instante un teléfono desconectado. Si un gasto quedó pendiente y se perdió acceso, la interfaz ofrece revisarlo en el espacio personal sin publicarlo en el compartido.

**Base de implementación:** espacio, membresía vigente, invitación, movimiento, compromiso, vencimiento, confirmación y evento de cambios serán entidades independientes. Los controles de acceso se revisarán en el servidor para cada operación; no bastará ocultar un botón ni guardar la membresía en un token que pueda quedar desactualizado. [Supabase documenta RLS y las limitaciones de membresías en JWT](https://supabase.com/docs/guides/database/postgres/row-level-security). Restricciones únicas y transacciones servirán para evitar doble confirmación de un vencimiento y repetición de la misma operación. [PostgreSQL: restricciones](https://www.postgresql.org/docs/current/ddl-constraints.html). Son decisiones de arquitectura que deben implementarse y probarse; no prestaciones automáticas de sincronización.

Se verificará con dos dispositivos: usuarios ajenos no acceden, cada miembro ve solo el espacio autorizado, dos confirmaciones simultáneas producen un único pago, las ediciones antiguas se detectan y la retirada bloquea operaciones posteriores. Dos personas pueden registrar por separado el mismo gasto real con identificadores diferentes: se podrán señalar coincidencias para revisión, sin fusionarlas por una suposición.

## 11. Cinco flujos iniciales y reglas financieras

| Flujo | Recorrido visible | Qué debe comprobar la beta |
| --- | --- | --- |
| Crear cuenta | Correo → verificación → moneda/idioma → espacio Personal → Agregar primer pago. | Cuenta existente, enlace vencido y falta de conexión tienen recuperación clara. La persona entra sin tutorial obligatorio ni solicitud de banco. |
| Crear recurrente | Nombre → importe fijo o estimado → frecuencia → fecha de cobro → próximos vencimientos → guardar. | La vista previa explica las fechas; notificaciones se piden al activarlas. Denegar el permiso conserva la agenda. Pausas, pruebas y cambios de precio se editan en el detalle. |
| Confirmar pago | Abrir vencimiento → Marcar pagado → fecha e importe real → confirmar. | Genera un único registro vinculado a ese vencimiento, conserva historial y permite corregir. No se confirma un cargo por emitir una notificación. |
| Anotar gasto rápido | Importe → favorito o categoría → guardar en el espacio visible. | Fecha retroactiva, categoría Sin clasificar y medio de pago desconocido permiten registrar sin inventar datos. Si falta red, aparece Pendiente de sincronizar. La prueba de un favorito apunta a menos de diez segundos. |
| Colaborar | Crear presupuesto → invitar por correo → otra cuenta acepta → selector Compartido → registrar. | Se explica quién puede ver y editar. Invitar no abre el espacio personal; el enlace vencido, la cuenta equivocada y una retirada de acceso tienen respuesta clara. |

La fecha elegida será un **ancla de recurrencia**. Si se desea cobro el día 31, febrero usará su último día y marzo volverá al 31. Pagar tarde no mueve por sí mismo la regla del siguiente cobro. Una pausa afecta futuros vencimientos y avisos; los pagos ya registrados conservan sus datos. Importes variables requieren confirmar el importe real al marcar pagado.

### Cuota de Macbook

Se registrará como una cuota mensual de deuda. Si se conocen adquisición y precio total, la compra constituye consumo una vez; las cuotas posteriores son pagos de deuda. Si solo se conoce la cuota, no se inventará una compra histórica, saldo total, intereses ni número de cuotas restantes. La app podrá avisar y registrar la cuota aunque el saldo de deuda permanezca sin dato. No deducirá cuánto capital queda a partir de cuotas sin desglose.

En **Mes**, la cuota aparecerá en Próximos pagos y una línea de **Cuotas pagadas**; la gráfica de consumo y Gastado este mes mantendrán su definición de gastos. El presupuesto de gastos y sus importes restantes estarán etiquetados como tales, con cuotas separadas; si las pruebas muestran que se necesita un plan conjunto de desembolsos, se diseñará una vista explícita de pagos, sin llamarla saldo bancario. Esta decisión evita ocultar obligaciones mensuales al tiempo que conserva cálculos coherentes.

Cuando una cuota forme parte del total pendiente de una tarjeta, deberá vincularse como componente de ese pago y no sumarse de nuevo en Por pagar. El módulo avanzado de tarjetas solo se lanzará al poder verificar esa relación. Una deuda finita no se anualiza ni se renueva indefinidamente como una suscripción.

### Dentista y CHECK

Dentista será un gasto mensual de salud, con próximo día de cobro pendiente de definir. CHECK se traduce a **Pagado para un vencimiento concreto**. Un pago antiguo no marca pagados todos los meses y una casilla sin marcar no prueba que el banco no cobró. La importación conserva la información disponible y pide confirmar lo que falte.

## 12. Dirección visual y costos por etapa

La página de Sistemas Digitales observada sirve como referencia de familia visual: tipografía sans serif, contraste negro/blanco, textos breves, montos destacados y divisores finos. La app tendrá una composición propia para operar en móvil. La propuesta mantiene **Mes · Recurrentes · Movimientos**, selector de espacio arriba y acción de registro permanente. Presupuesto, meta y deuda aparecen dentro de Mes o su detalle, evitando nuevas pestañas para cada función.

En Mes: primero lista de vencimientos ordenada por fecha; después gasto del mes y cuotas pagadas; restante del presupuesto de gastos junto a cuotas por pagar cuando corresponda; gráfica por categoría y una observación breve si los registros la sostienen. En Recurrentes: filas con nombre, tipo, próxima fecha e importe; el estado se escribe y no depende de un color. En Movimientos: lista por día y filtros discretos. Una tabla completa queda para consulta detallada o web.

El tema claro usará blanco y negro con grises neutrales secundarios como los observados en la referencia; el oscuro invertirá superficies con contraste comprobado. Los grises son una propuesta de jerarquía, pendiente de validar visualmente con Emi. Tipografía y tamaño se probarán con ajustes de accesibilidad. Animaciones breves responderán a una acción; se respetará reducción de movimiento. Háptica sutil al guardar en plataformas compatibles. Nombre, logo e icono de tienda siguen pendientes: esta referencia no constituye una identidad final de la app.

| Etapa | Decisión de costo |
| --- | --- |
| Prototipo y desarrollo con datos ficticios | Usar herramientas y niveles gratuitos cuando resulten suficientes. Objetivo de infraestructura USD 0/mes en esta etapa, sin prometer costo total cero. |
| Beta cerrada con datos reales | Usar un nivel gratuito solo con aislamiento, exportación, respaldo/restauración y correo de acceso comprobados; documentar sus límites. |
| Lanzamiento público | Escenario aceptable para Emi: Supabase Pro desde USD 25/mes como opción administrada, más correo, tiendas, dominio si se requiere y consumo aplicable. Precio de venta todavía sin definir. |

[Supabase Free](https://supabase.com/pricing) no incluye respaldos automáticos y puede pausar proyectos tras una semana de inactividad; Pro ofrece respaldos diarios con retención de siete días. Por eso un nivel gratuito no elimina el trabajo operativo. No se ha contratado infraestructura ni pagado cuentas de desarrollador. Esta actualización cierra las aclaraciones de colaboración, columnas y presupuesto operativo; permite pasar al diseño de pantallas sin importar datos personales todavía.
