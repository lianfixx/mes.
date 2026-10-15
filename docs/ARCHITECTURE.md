# Arquitectura y continuación

## Decisiones de la alfa · 2026-10-02

Expo React Native permite compartir UI y reglas entre iOS, Android y web. TypeScript estricto; dependencias fijadas con lockfile. No runtime de IA. El alojamiento actual sirve archivos estáticos; el mismo `dist` puede alojarse en otro proveedor. La fuente se conserva en Git privado; no depende de esta conversación para entenderse.

La interfaz es un primer recorrido completo, con componentes comunes y tokens de color. Antes de conectar cuentas, dividir `App.tsx` por pantallas y formularios, y extraer comandos a una capa de aplicación. El dominio ya está separado y probado. No presentar el estado React como almacenamiento para finanzas reales.

## Reglas financieras vigentes

- Importes en unidades menores enteras, exactamente dos decimales para las tres monedas de esta alfa. No sumar monedas distintas ni asumir tipos de cambio.
- Gasto neto = gastos − devoluciones. Ingresos y cuotas de deuda aparecen separados. Presupuesto restante = límite − gasto neto; no representa saldo bancario ni dinero libre.
- Registrar una cuota no vuelve a registrar el precio total financiado. Aún no se conoce principal, interés, comisiones ni saldo de cada crédito: no inferirlos.
- Un pago fijo con importe diferente exige reconocer explícitamente que es el total real; los abonos parciales no se modelan. Los importes variables se confirman como total real.
- Cada pago vinculado usa `recurrente:fecha_prevista` como identidad idempotente. Confirmarlo dos veces no duplica el gasto ni adelanta dos meses.
- Fechas civiles `AAAA-MM-DD`, rango admitido 1900–2100, zona local al generar hoy. La recurrencia mensual conserva el día ancla y usa el último día de meses cortos. Cancelar desde una fecha excluye esa fecha; última cuota es inclusiva.
- Pausar desde hoy conserva vencimientos anteriores sin confirmar; suspende hoy y los siguientes. Confirmar es registrar un pago ya realizado, nunca ordenar un cobro.
- Cambiar moneda requiere otro recurrente. Con pagos previos, cambiar tipo también. Corregir una fecha no puede regresar a un vencimiento pagado.
- Retirar un pago restaura su instantánea como vencimiento pendiente independiente; conserva las condiciones actuales de la regla y los pagos posteriores. Cambiar fechas exige elegir entre mover el calendario desde ese vencimiento o conservar los pendientes anteriores y cambiar los futuros; ambos cambios quedan registrados.
- Los presupuestos son independientes por espacio y moneda. Por ahora el límite se aplica a todos los meses mostrados; presupuesto histórico versionado sigue pendiente.
- Los cambios de importe, frecuencia, variabilidad, tipo, cancelación y fin conservan instantáneas de los vencimientos anteriores a hoy; una reprogramación explícita puede mover el calendario. Cambiar frecuencia, incluso conservando la fecha, exige una decisión de calendario. El historial de precio registra cambios hechos al próximo importe. Las diferencias son informativas, sin recomendaciones de inversión ni comparaciones entre monedas.
- El gráfico compara todos los importes netos no nulos por categoría, escalados por magnitud absoluta. Las devoluciones netas aparecen con signo negativo. No es una gráfica porcentual del total.
- La meta registra aportes declarados; no comprueba ni mueve dinero. Un objetivo por espacio, con moneda propia. No suma ese ahorro de nuevo a los gastos.

## Siguiente implementación: persistencia y cuentas

1. Convertir comandos a funciones de aplicación; introducir repositorios detrás de interfaces. Sustituir la sesión de demostración por almacenamiento explícito, sin migrar silenciosamente ejemplos a cuentas reales.
2. Implementar backend PostgreSQL/Supabase evaluado en el plan maestro. Tablas propuestas: profiles, spaces, memberships, invitations, categories, payment_methods, recurring_rules, recurring_occurrences, entries, budgets, goals, goal_contributions, audit_events y device_tokens. Migraciones en Git y entornos separados.
3. Cada registro debe tener `space_id`; políticas RLS y pruebas de acceso para dos usuarios distintos. Un selector visual no es autorización. Propietario/editor, invitaciones de uso limitado, revocación y auditoría. Ninguna clave administrativa en el cliente.
4. Materializar vencimientos por separado de la regla para preservar importes y obligaciones históricas. Índice único por regla/fecha en servidor; transacción para pago y avance. No trasladar la solución temporal de snapshots como único registro contable.
5. Persistencia local nativa con SQLite; cola de comandos identificados, reintentos idempotentes y versiones de registros para detectar conflictos. Guardar sesión sólo en almacenamiento seguro del sistema. Resolver permisos revocados antes de reenviar comandos offline.
6. Cuentas, recuperación, cierre de sesiones y eliminación/exportación verificable. Backups con prueba de restauración. Separar analítica de contenido financiero y documentar consentimientos.
7. Notificaciones locales nativas sin importes en pantalla bloqueada, permisos solicitados al configurar el primer recordatorio. Programación por fecha civil/zona, reconciliación después de editar, pagar, cancelar, cambiar zona o reinstalar. No prometer entrega exacta.
8. Beta en iPhone y Android físicos con dos cuentas reales y datos ficticios; evaluar biometría, teclado, lector de pantalla, texto ampliado, accesibilidad, offline y restauración antes de recibir datos reales.

## Seguridad y publicación

La alfa no contiene secretos, SDK de publicidad ni llamadas de red para registrar movimientos. Los metadatos del alojamiento pueden existir por separado. No afirmar cifrado extremo a extremo, certificaciones ni seguridad absoluta. Los futuros controles de producción necesitan pruebas.

Antes del lanzamiento: modelo de amenazas, revisión de permisos/RLS, análisis de dependencias, política de privacidad y términos, retención y borrado, inventario de terceros, fichas de privacidad de Apple/Google, clasificación de la app, validación de titularidad y suscripciones. Volver a verificar requisitos actuales y resolver clasificación de aplicación financiera antes de pagar cuentas. No lanzar App Store/Play con una web empaquetada que simula colaboración.

## Alcance pendiente de diseño

Validar el uso con Emi; definir nombre y marca legal; logo final e icono de tiendas; tokens tipográficos y de espaciado completos; prototipo para tarjetas con corte, pago y cuotas; comparación mensual; observaciones de gasto frecuentes; favoritos editables y captura ultrarrápida. OCR después de medir utilidad. El nombre y diseño son propuestas revisables.
