# Instalar y comprobar mes-continuidad

Versión 1.0.0, 3 de noviembre de 2026. [Paquete ZIP](../../distribucion/mes-continuidad.zip) y [fuente canónica](../../skills/mes-continuidad/SKILL.md). El ZIP contiene una carpeta `mes-continuidad/` con SKILL.md, protocolo y plantillas; no contiene credenciales ni el código completo de la app.

## Claude con importación de skills

Descarga el ZIP desde GitHub e impórtalo mediante la función de skills personalizadas que tenga disponible tu cuenta. Habilita la skill y comienza una sesión de Mes. La disponibilidad y los menús dependen del producto/plan; aquí no se ha instalado en una cuenta de Claude ni verificado su interfaz real.

Al usarla, da acceso al repositorio o a una copia actual de **main**. La skill sola no da acceso a GitHub, al historial de Codex ni a chats anteriores. Si Claude no puede ejecutar Git, debe entregar los archivos y registros según el modo sin terminal del protocolo.

## Claude Code y Codex en un checkout

El repositorio incluye entradas de proyecto en `.claude/skills/mes-continuidad/SKILL.md` y `.agents/skills/mes-continuidad/SKILL.md`, más `CLAUDE.md` y `AGENTS.md`. Ambos puentes dirigen a la misma fuente canónica, sin dos juegos de reglas.

Recupera `main` expresamente. Abre una sesión nueva para que el cliente descubra las instrucciones según su versión y solicita «Usa mes-continuidad para continuar Mes». Si el cliente no descubre el directorio, indica la ruta canónica del SKILL.md o instala el ZIP con su mecanismo admitido. La comprobación realizada aquí cubre archivos/paquete, no el descubrimiento por cada versión de cada cliente.

Para Codex cloud, guardar archivos de skill en Git no equivale a instalar una skill global en la cuenta ni a publicar el entorno. `AGENTS.md` y las instrucciones de arranque enlazan igualmente el protocolo. El usuario puede instalar el paquete mediante el mecanismo de skills/plugins admitido por su cliente.

## Prueba de aceptación de una instalación

Pide a la IA:

> Usa mes-continuidad. Identifica el repositorio, rama y commit reales; lee el protocolo y las sesiones recientes. Dime quién hizo el último trabajo, en qué evidencia te apoyas y qué queda pendiente. Abre una sesión propia antes de cambiar archivos. Si no puedes acceder, declara exactamente qué insumo falta.

Debe distinguir autor Git de ejecutor, registrar el encargo y comprobar acceso real. Tener una respuesta que mencione «Mes» no acredita instalación ni lectura del contexto. Una instalación no se acepta por afirmar que recordará todo.

## Comprobaciones desde el repositorio

```sh
node --test scripts/continuity.test.mjs
node scripts/continuity.mjs check
node scripts/continuity.mjs status
```

Para actualizar la distribución después de editar la skill:

```sh
node scripts/continuity.mjs package
```

El validador compara inventario y bytes de cada archivo del ZIP contra la carpeta canónica, rechaza rutas peligrosas/symlinks y comprueba que los dos puentes coincidan. La prueba automatizada también extrae el paquete en una carpeta temporal nueva y comprueba sus recursos.

## Fuentes consultadas y límites

- [Anthropic Skills, README oficial](https://github.com/anthropics/skills/blob/main/README.md), leído el 3 de noviembre: carpeta autocontenida, SKILL.md con `name`/`description`, skills personalizadas y enlaces de instalación por producto.
- [OpenAI Skills, README oficial](https://github.com/openai/skills/blob/main/README.md), leído el 3 de noviembre: formato Agent Skills y aviso actual de migración de ejemplos a [OpenAI Plugins](https://github.com/openai/plugins).
- Las páginas web directas de documentación de Claude Code/Codex devolvieron 403 en este entorno. No se atribuye a esa lectura fallida una verificación de menús o capacidades actuales.

No hay CLI/conector activo de Claude en esta máquina. La [petición concreta a Claude](solicitudes/2026-11-03-claude.md) está preparada para recuperar su autoría/contexto faltante; no se presenta como enviada ni respondida.
