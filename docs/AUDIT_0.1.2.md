# Auditoría de Mes 0.1.2

Fecha: 3 de octubre de 2026. Alcance: alfa web y fuente Expo/React Native compartida. Datos ficticios. Revisión de código con dos lecturas independientes, pruebas automatizadas y recorridos en navegador.

## Resultado y criterios

27 pruebas de dominio aprobadas; TypeScript estricto sin errores; exportación web y paquetes JavaScript/Hermes iOS/Android correctos. No son binarios firmados ni una certificación de seguridad/accesibilidad.

| Parámetro | Resultado y evidencia |
|---|---|
| Importes exactos | Verificado por pruebas: unidades menores enteras, 0.10 + 0.20 = 0.30. |
| Monedas y espacios | Pruebas de separación; sin conversión implícita. En navegador: EUR muestra € y encabezado EUR. |
| Deuda frente a consumo | Pruebas: cuotas e ingresos separados del gasto neto. |
| Devoluciones y gráfico | Prueba: categorías netas concilian, incluidos importes negativos. |
| Pago duplicado | Pruebas de identidad por regla y fecha; no duplica ni adelanta dos veces. |
| Correcciones de pagos | Pruebas: retirar pagos conserva instantánea y pagos posteriores. |
| Pausa/reanudación | Pruebas de conservación de anteriores y suspensión de cobros durante la pausa. |
| Créditos terminados | Pruebas: notas editables sin generar cuotas. |
| Tipo del recurrente | Prueba: pulsar el mismo tipo no borra fin de prueba/última cuota. |
| Importe distinto | Pruebas: exige reconocer total real; abonos parciales no admitidos. Comparación por centavos, no por texto. |
| Fechas/calendario | Pruebas de meses cortos, bisiestos y ancla; rango admitido 1900–2100. Al exceder el rango, el comando se rechaza. |
| Fecha parcial en formulario | Corregido y observado a 320 px: escribir `2026-` muestra “Fecha por elegir” sin interrumpir la app. |
| Recurrencias antiguas | Prueba semanal 2010–2026: incluye los cinco vencimientos de octubre; eliminado truncamiento a 600. Cota de 12,000 cubre el rango admitido. |
| Cambio de frecuencia/fecha | Prueba: exige una decisión explícita; conservar pendientes mantiene fechas e importes. |
| Cambio de precio/cancelación/fin | Prueba: instantáneas de vencimientos anteriores a hoy preservadas; una cancelación retroactiva no los borra. Una reprogramación expresamente elegida puede mover el calendario. |
| Cero en metas | Prueba: 0, 0.00, 0,00 y espacios aceptados para ahorro/aporte opcional; gasto sigue exigiendo importe positivo. |
| Borradores | Observado: cierre de formulario modificado muestra opciones; ahora desplaza a inicio y anuncia. |
| Búsqueda vacía | Observado: mensaje correcto y botón Limpiar filtros. |
| Todos los pendientes | Comprobado en 0.1.1: lista de seis accesible; conservación en código 0.1.2. |
| Reflujo | Medido en Recurrentes: 320/390/430/768/800/1024/1440 px; ancho desplazable igual al viewport y ningún control fuera horizontalmente. |
| Vista pequeña | Navegación Movimientos y formulario examinados a 320 px, sin desbordamiento horizontal de controles en la medición. |
| Altura pequeña | Monedas a 390 × 390: contenido desplazable y cierre accesible. No equivale a probar un teclado de iPhone. |
| Cabeceras y texto largo | Código corregido: título flexible, cierre que no se encoge, chips multilínea, filtros apilados, cifras que ajustan línea. Estrés de textos máximos pendiente. |
| Acción principal móvil | Cambio final de código: pie de acción fuera del área desplazable, para no cubrir filas; escritorio conserva acción flotante. Revisión visual final pendiente. |
| Contraste | Cálculos de tokens: texto secundario 5.57:1 sobre blanco y 8.22:1 sobre oscuro; bordes de campos separados de divisores. No declara cumplimiento integral. |
| Áreas táctiles | Componentes de botón, icono y chips ≥48; ampliados ajustes, editar presupuesto y detalles. Revisión física/Dynamic Type pendiente. |
| Movimiento reducido | Revisión de código: AccessibilityInfo controla modal/desplazamiento; CSS respeta preferencia. Prueba nativa pendiente. |
| Foco y teclado | Modal usa mecanismo de react-native-web; nombre accesible añadido. Escape, ciclo de foco y retorno requieren prueba final dedicada. |
| Safe areas/viewport | Código: bordes seguros y altura dinámica de navegador; iPhone/Android físicos pendientes. |
| Seguridad y datos | Código propio no incluye claves ni datos reales, llamadas de IA ni números de tarjeta. No se realizó pentest ni prueba de backend inexistente. |
| Portabilidad | Lockfile, instrucciones, dominio independiente y código fuente incluido. Arranque limpio en otro equipo pendiente. |
| Rendimiento | Exportación web ~458 kB; no es benchmark. Listas grandes, memoria, red lenta y rendimiento físico pendientes. |
| Localización | Español MX; MXN/USD/EUR. EN/FR y otros idiomas sin implementar; no se simula selector. |
| Persistencia y permisos | Fuera de esta alfa: cuenta, almacenamiento durable, colaboración real, autorización en servidor, respaldo y recuperación. |
| Distribución | Sitio privado; App Store/Google Play no publicados. |

## Límite de la revisión visual

Las mediciones de las siete anchuras y los recorridos indicados corresponden a la iteración web `index-dc88023fc314d9f649417400ff4d2ce5.js`. Después se añadieron el pie de acción móvil, ajustes de densidad/cabecera, nombres de modales y áreas táctiles; esa compilación final `index-0df75a1f78bb49eb081cff47dabaf108.js` pasó TypeScript y exportación. Antes de poder completar su inspección visual, la vista compartida de previsualización pasó a mostrar otro proyecto; se detuvo la interacción para no modificarlo. No se atribuyen esas pantallas a Mes.

Pendientes concretos: repetir la matriz en la compilación final para las tres vistas y ambos temas, zoom 200 %, textos e importes máximos, teclado físico y virtual, lectores de pantalla, safe areas reales y pruebas con usuarios. Las mediciones realizadas no autorizan afirmar “todo funciona” ni “responsive perfecto”.

## Fuentes de criterio

- W3C, reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- W3C, modal: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- React Native, dimensiones y escalado: https://reactnative.dev/docs/usewindowdimensions
- Documentación de Claude Design: https://support.claude.com/en/articles/14604416-get-started-with-claude-design

Consultadas el 3 de octubre de 2026. Las recomendaciones de producto no se presentan como mandatos normativos ni porcentajes de mejora medidos.
