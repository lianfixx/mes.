# Validación de la alfa 0.1.2 · 2026-10-03

## Comprobado por comandos

- TypeScript estricto sin errores.
- 27 pruebas de dominio aprobadas: importes exactos, fechas y anclas, idempotencia, separación de monedas/espacios/deuda, pausa/reanudación, historial, selección del mismo tipo sin borrar condiciones, edición de créditos terminados, confirmación explícita de totales distintos, cambios de calendario sin pérdida silenciosa, retirada de pagos con instantáneas y conciliación de categorías con devoluciones.
- Exportación web de Expo correcta.
- Exportaciones JavaScript/Hermes de iOS y Android correctas. No equivalen a binarios firmados ni a pruebas físicas.

## Comprobado en navegador de escritorio

- La lista pasa de cinco filas a los seis pendientes y permite contraerla.
- Una cuota fija de 1 frente a 1,200 previstos muestra error y requiere confirmar que el importe distinto es el total real. No admite abonos parciales.
- Cerrar ese formulario modificado pide descartar o continuar editando.
- Captura rápida: seleccionar Comida, registrar 150 en Personal, observar gasto de 3,129.50 a 3,279.50 y presupuesto restante de 4,870.50 a 4,720.50.
- Inspección visual de inicio en escritorio: jerarquía, filas, gráfico y navegación sin superposiciones observadas.
- El navegador registró errores de su extensión de metadatos; no se atribuyeron al código de la aplicación.

## Pendiente de comprobación en dispositivos

Antes de aceptar la beta, probar iPhone y Android físicos, anchos 320/390/768 px, teclado, zonas seguras, formularios largos, texto ampliado, lector de pantalla, foco y reducción de movimiento. La corrección de código no sustituye estas comprobaciones.

## Correcciones de interfaz

Moneda explícita y símbolo coherente; captura corta con destino visible; fecha elegible y método sin preselección de tarjeta; errores al inicio del formulario; protección de borradores y restauración de ejemplo; pagos conservados accesibles; estados finalizado/pausado/cancelado; todas las categorías netas incluidas; contraste de placeholders mejorado; botones de al menos 48 unidades; áreas seguras y preferencia de movimiento reducido.

## Limitaciones conocidas

Estado temporal de demostración: se reinicia al recargar. Sin cuentas propias, persistencia, sincronización, colaboración real ni notificaciones conectadas. Un presupuesto vigente por moneda/espacio sin versiones mensuales; una meta por espacio; favoritos fijos; rango de fechas 1900–2100 y cota de 12,000 ocurrencias; sin saldo bancario, intereses ni importador. Sólo datos ficticios. Marca definitiva, iconografía vectorial y lanzamiento comercial siguen pendientes; no declarar lista para datos reales ni tiendas.

La auditoría ampliada y sus límites están en `AUDIT_0.1.2.md`; distingue comprobaciones visuales de la iteración anterior y revisión de código final.
