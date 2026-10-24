# Mes · Finanzas

Alfa de una aplicación de Sistemas Digitales. **Mes es un nombre provisional.** Interfaz original en blanco, negro y grises para próximos pagos, gastos cotidianos y metas. Código universal Expo / React Native / TypeScript, sin llamadas a modelos ni dependencia funcional de ChatGPT.

## Estado de esta entrega · 0.1.3

0.1.3 refina el diseño y la interacción de 0.1.2 sin cambiar las reglas financieras (`src/domain/model.ts` intacto; 27 pruebas heredadas en verde).

- **Datos:** la app funciona con datos ficticios en memoria y se borra al recargar. No introducir información financiera real.
- **Acceso:** el acceso privado a la vista web es independiente de las futuras cuentas de la app.
- **Exportar:** el JSON conserva una copia para inspección; todavía no hay importador.

**Implementado:**

- Mes, Recurrentes y Movimientos.
- Gastos, ingresos, devoluciones y pagos de deuda; favoritos; editar, retirar y deshacer movimientos.
- Cobros semanales, mensuales y anuales; pausas; fechas de prueba, cancelación y última cuota; historial de importes.
- Presupuestos por espacio y moneda; una meta por espacio.
- Tema según el sistema, claro u oscuro; exportación.
- Selector entre Personal y Casa (ejemplo local, no colaboración real).
- MXN, USD y EUR se muestran por separado, sin conversiones.

**Novedades de 0.1.3** (detalle en `docs/DESIGN.md`):

- Próximo pago visible al abrir incluso a 320×568.
- «Por pagar» con intervalo y «Por confirmar» aparte.
- Captura con Hoy/Ayer/Otra fecha y zona de acción fija.
- Alcance de calendario con fechas calculadas antes de guardar.
- Estados escritos con iconos SVG propios; tokens completos.
- Accesibilidad web verificada (nombres de diálogos, foco, errores por campo, estados ARIA).
- QA reproducible (`npm run qa`).

**Pendiente:**

- Autenticación, almacenamiento duradero, colaboración entre personas reales, sincronización.
- Notificaciones, biometría, OCR.
- Monedas adicionales, localización EN/FR.
- Suscripciones comerciales, avisos legales y publicación en tiendas.
- Pruebas en teléfonos físicos, con lectores de pantalla y con personas.

No se han importado datos de Notion. El alias de tarjeta no conecta bancos ni guarda números de tarjeta.

## Ejecutar

Requisitos: Node.js 24 y npm (comprobado también con 22.22). Las versiones exactas están en `package-lock.json`.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

- **`npm run dev`** sirve el último resultado web exportado. Después de cambios, ejecuta `npm run build` o usa `npm run web` para desarrollo con Metro.
- **`npm start`** inicia Expo. `npm run ios` necesita macOS y Xcode; `npm run android` necesita Android Studio, un emulador o un dispositivo. La compatibilidad de Expo Go depende del SDK disponible; para la beta, prepara development builds.
- **`npm run qa`** ejecuta la matriz de QA sobre `dist/` (requiere `npx playwright install chromium`).
- **`node scripts/qa/scenarios.mjs`** captura los escenarios del brief.

## Mapa del código

- **`src/domain/model.ts`:** tipos, importes enteros, calendario, pagos, correcciones y resumen; no depende de React.
- **`src/domain/derive.ts`:** cálculos de presentación puros sobre el dominio (pendientes, próximas fechas, vista previa de cambios).
- **Pruebas:** `src/domain/*.test.ts` y `src/ui/format.test.ts`, con invariantes monetarias, de vencimientos y de formato.
- **`src/data/demo.ts`:** ejemplos ficticios y estado vacío.
- **`src/app/useMesApp.ts`:** estado temporal y comandos de la interfaz.
- **`src/ui/`:** tokens, formato, iconos, componentes, filas, pantallas y hojas.
- **`App.tsx`:** estructura (barra superior o lateral, contexto, pie de acción, pestañas).
- **`scripts/`:**
  - `build.mjs`: exportación web portable;
  - `finalize-web.mjs`: metadatos, favicon y foco por tema;
  - `qa/`: QA y escenarios.
- **`assets/brand/`:** marca provisional (maestros y variante de 16 px).
- **`docs/`:**
  - `DESIGN.md`: sistema y pantallas;
  - `AUDIT_0.1.3.md`: diagnóstico y comprobaciones;
  - `HANDOFF.md`: traspaso;
  - `ARCHITECTURE.md`: decisiones y siguiente etapa;
  - `VALIDATION.md`: evidencia;
  - `qa/`: capturas y resultados;
  - `AUDIT_0.1.2.md`: historial.
- **`AGENTS.md`:** instrucciones para cualquier colaborador, humano o IA.

`app.json` incluye identificadores provisionales; no implica registro de marca, bundle IDs ni cuentas de tiendas. El símbolo vectorial es un estudio de marca, no el logo definitivo. No hay licencias de código abierto concedidas al código propio; revisar dependencias antes de distribuir.
