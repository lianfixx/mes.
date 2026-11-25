# Reglas de este repositorio para cualquier IA

Valen igual en Claude, ChatGPT, Codex, Gemini, Muse o cualquier otra IA, y para personas. Las reglas propias de este repositorio están en `AGENTS.md`, `README.md` y `docs/`; el protocolo común, en `ia/PROTOCOLO.md`.

- Todo cambio se registra en el mismo commit en `CHANGELOG.md`, con la línea `- Agente:` (formato en `ia/PROTOCOLO.md`, sección 3). Si no puedes escribir en el repositorio, entrega un «Registro pendiente para el repositorio».
- Nunca subas secretos (llaves, tokens, contraseñas, cookies), archivos de credenciales ni datos personales (CURP, tarjetas, datos de clientes).
- No fuerces ni borres en el remoto (`--force`, `--delete`) ni saltes controles (`--no-verify`).
- No envíes, publiques ni despliegues nada sin autorización expresa de Emi.

## Qué se aplica solo (desde el 25/11/2026)

GitHub corre `python3 ia/verificar.py ci` en cada push y pull request (workflow `control-ia.yml`): el cambio debe actualizar `CHANGELOG.md` con una entrada que traiga la línea `- Agente:`, y lo que agrega no puede traer llaves, contraseñas, CURP, tarjetas ni archivos de credenciales (`.env`, `.pem`, `credentials.json`). Solo revisa lo que el cambio agrega; marca en rojo y no revierte. Lo demás de estas reglas lo cumple cada IA por sí misma. Al empezar con terminal: `python3 ia/verificar.py inicio`.
