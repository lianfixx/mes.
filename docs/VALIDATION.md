# Validación de la alfa 0.1.3

La lista completa, con pantalla, viewport, tema, método, resultado y origen, está en `AUDIT_0.1.3.md`. Este resumen separa lo comprobado por comandos, lo comprobado en navegador y lo pendiente.

## Comprobado por comandos (esta entrega)

- **TypeScript estricto** sin errores; formato Prettier conforme.
- **39 pruebas aprobadas:**
  - las 27 de dominio heredadas de 0.1.2, sin cambios: importes exactos, fechas y anclas, idempotencia, separación de monedas, espacios y deuda, pausa y reanudación, historial, selección del mismo tipo sin borrar condiciones, créditos terminados, totales distintos explícitos, cambios de calendario sin pérdida silenciosa, retirada con instantáneas y conciliación de categorías;
  - 9 de derivados: separación de pendientes que concilia con el total, vencidos por regla, próximas fechas con vigencia y 2100, qué queda tras un pago, pérdida por cambio de tipo, aumento de precio, vista previa de calendario sin mutar datos, días civiles;
  - 3 de formato.
- **Exportación web de Expo** correcta.

## Comprobado en navegador (Chromium, exportación web, reloj fijo 3 oct 2026)

- **`npm run qa`:**
  - 78 combinaciones de pantalla, ancho (320 a 1440) y tema, más zoom 200 % emulado y 390×390, sin desborde horizontal ni controles menores de 48;
  - próximo pago visible al abrir a 320×568, 390×667, 390×844 y 430×932;
  - hojas con nombre propio y foco inicial correcto;
  - Escape cierra y devuelve el foco al activador;
  - errores asociados al campo;
  - fechas parciales, inválidas y fuera de rango sin rotura;
  - importe máximo en una línea;
  - recorridos de importe distinto, tipo, alcance de calendario y deshacer;
  - axe-core sin infracciones automáticas en 3 pantallas y 5 hojas, en ambos temas.
- **Captura rápida** (repetido en 0.1.3): favorito Comida de $150 en Personal. El gasto neto pasa de 3,129.50 a 3,279.50 y el restante de 4,870.50 a 4,720.50, igual que en 0.1.2.
- **Capturas:** antes y después en `docs/qa/antes` y `docs/qa/despues`; los 22 escenarios del brief en `docs/qa/escenarios`.

## Heredado de 0.1.2 (no repetido en esta sesión)

Exportaciones JavaScript/Hermes de iOS y Android. No equivalen a binarios firmados ni a pruebas físicas.

## Pendiente de comprobación en dispositivos y con personas

Antes de aceptar la beta, probar en iPhone y Android físicos:

- teclado nativo con la zona de acción fija;
- safe areas reales;
- VoiceOver y TalkBack;
- texto ampliado hasta 200 % (Dynamic Type y escala del sistema);
- reducción de movimiento nativa;
- listas largas;
- recorridos con usuarios (objetivos de prueba en el brief).

La corrección de código y la QA web no sustituyen estas comprobaciones.

## Limitaciones conocidas

- Estado temporal de demostración: se borra al recargar.
- Sin cuentas propias, persistencia, sincronización, colaboración real ni notificaciones.
- Un presupuesto vigente por moneda y espacio, sin versiones mensuales; se rotula al ver otros meses.
- Una meta por espacio; favoritos fijos en MXN.
- Rango de fechas 1900–2100 y cota de 12,000 ocurrencias.
- Sin saldo bancario, intereses, abonos parciales ni importador.
- Solo datos ficticios.
- Marca y nombre siguen siendo provisionales.
- No declarar la app lista para datos reales ni para tiendas.
