# Mes · Finanzas

Primera alfa de una aplicación de Sistemas Digitales. **Mes es un nombre provisional.** Interfaz original en blanco, negro y grises para próximos pagos, gastos cotidianos y metas. Código universal Expo / React Native / TypeScript, sin llamadas a modelos ni dependencia funcional de ChatGPT.

## Estado de esta entrega · 0.1.2

La app funciona con datos ficticios en memoria. Se reinicia al recargar. No introducir información financiera real. El acceso privado a la vista web es independiente de las futuras cuentas de la app. Exportar JSON conserva una copia para inspección; todavía no hay importador.

Implementado: Mes, Recurrentes y Movimientos; gastos, ingresos, devoluciones y pagos de deuda; favoritos; editar y retirar movimientos; cobros semanales, mensuales y anuales; pausas; fechas de prueba y cancelación; historial de importes; presupuestos por espacio y moneda; una meta por espacio; modo claro/oscuro; exportación; selector entre Personal y Casa (ejemplo local). MXN, USD y EUR se muestran por separado, sin conversiones.

Pendiente: autenticación, almacenamiento duradero, colaboración entre personas reales, sincronización, notificaciones, biometría, OCR, monedas adicionales, localización EN/FR, suscripciones comerciales, avisos legales y publicación en tiendas. No se han importado datos de Notion. El alias de tarjeta no conecta bancos ni guarda números de tarjeta.

## Ejecutar

Requisitos: Node.js 24 y npm. Versiones exactas en `package-lock.json`.

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

`npm run dev` sirve el último resultado web exportado. Después de cambios, ejecutar `npm run build` o usar `npm run web` para desarrollo con Metro. `npm start` inicia Expo; `npm run ios` necesita macOS y Xcode; `npm run android` necesita Android Studio/emulador o dispositivo. La compatibilidad de Expo Go depende del SDK disponible; preparar development builds para la beta.

## Mapa del código

- `src/domain/model.ts`: tipos, importes enteros, calendario, pagos, correcciones y resumen; no depende de React.
- `src/domain/model.test.ts`: invariantes monetarias y de vencimientos.
- `src/data/demo.ts`: ejemplos ficticios y estado vacío.
- `src/ui/tokens.ts`: colores de ambos temas.
- `App.tsx`: navegación, formularios, presentación y estado temporal de la alfa.
- `scripts/build.mjs`: exportación web portable; `scripts/finalize-web.mjs`: metadatos e icono provisional.
- `docs/ARCHITECTURE.md`: decisiones y siguiente etapa.
- `docs/VALIDATION.md`: evidencia y comprobaciones pendientes.
- `docs/AUDIT_0.1.2.md`: auditoría ampliada, matriz responsive y límites exactos de QA.
- `AGENTS.md`: instrucciones para cualquier colaborador, humano o IA.

`app.json` incluye identificadores provisionales; no implica registro de marca, bundle IDs ni cuentas de tiendas. El favicon vectorial es un estudio de marca, no el logo definitivo. No hay licencias de código abierto concedidas al código propio; revisar dependencias antes de distribuir.
