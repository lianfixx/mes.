# Auditoría y mejoras · 4 de noviembre de 2026

Repositorio `lianfixx/mes.`. Agente: Claude Code (sesión en la nube); solicitante: Emi. Base auditada:
`dd76d3a` (main antes de los cambios del 4/11). Este documento registra con precisión qué cambió, por qué
y cómo se verificó; se complementa con `CHANGELOG.md` (o el registro propio del proyecto).

## Resumen

Skill propia `mes-continuidad` 1.0.0 (Codex, 3/11/2026), **sin cambios**: su protocolo sirvió de base al protocolo común.

Se añadió la **capa común entre IA** (`ia/`), idéntica en los 14 repositorios de lianfixx:
`ia/PROTOCOLO.md` 1.0.0 (generaliza el protocolo de Mes), `ia/REGLAS.md` (generadas de
`ia/politica.json`), los frenos (`ia/guard.py`), los hooks de git (`ia/githooks/`, que se activan con
`sh ia/instalar.sh`), el workflow `.github/workflows/registro-ia.yml`, `GEMINI.md`, las
instrucciones para Proyectos de ChatGPT o Gems de Gemini (`ia/INSTRUCCIONES_PROYECTO.md`) y las
plantillas de petición y entrega entre IA.

## Reglas de este repositorio

7 reglas que bloquean, 3 que piden confirmación de Emi y 1 controles previos a commit
o push. La lista legible está en `ia/REGLAS.md`; los casos de prueba, en `ia/politica.json` → `tests`.
Registro válido para la regla «todo cambio se documenta»: `^docs/continuidad/sesiones/[^/]+\.json$`.

## Del video a este repositorio

| Del video (Fran Salazar, «Lo que Claude Code puede hacer…», 3/11/2026) | Aplicación |
|---|---|
| CLAUDE.md y sus tres preguntas | `CLAUDE.md` breve que importa `AGENTS.md`; el detalle vive en la skill y sus referencias. |
| `.claude/rules/` por tipo de archivo | Reglas con `paths:` donde hay archivos con invariantes propias. |
| Hooks: lo que debe cumplirse sí o sí | `ia/guard.py` + `ia/politica.json`, aplicados por Claude Code, por hooks de git y por GitHub Actions. |
| Modo plan y entrevista | Solo en arranques nuevos o ambiguos, según cada skill (ver su `references/claude-code.md`). |
| ultrathink | Cada skill marca los pasos que piden máxima profundidad. |
| Agentes en paralelo, `/goal`, `/loop`, `claude -p` | Criterio de terminado verificable en SKILL.md; reparto, `/goal` y `/loop` en `references/claude-code.md`; INDEP y DOF traen `scripts/headless.sh`, sin activar. |
| Navegador (Chrome / Playwright) | Indicado por skill, nunca para eludir accesos ni enviar sin autorización. |
| `/rewind`, `/btw`, `!`, `/context`, `/compact`, `/voice`, `/remote-control` | Hábitos de sesión: solo como atajos breves en la referencia, no en el cuerpo de la skill. |

## Archivos cambiados desde la base

- `.claude/settings.json` — añadido
- `.github/CODEOWNERS` — añadido
- `.github/workflows/registro-ia.yml` — añadido
- `AGENTS.md` — modificado
- `CLAUDE.md` — modificado
- `GEMINI.md` — añadido
- `SHA256SUMS.json` — modificado
- `docs/continuidad/evidencia/2026-11-04-protocolo-comun/continuity_test.txt` — añadido
- `docs/continuidad/evidencia/2026-11-04-protocolo-comun/reglas_check.txt` — añadido
- `docs/continuidad/evidencia/2026-11-04-protocolo-comun/test_guard.txt` — añadido
- `docs/continuidad/sesiones/20261104t025826z-claude-code-protocolo-comun-ia.json` — añadido
- `ia/.gitignore` — añadido
- `ia/INSTRUCCIONES_PROYECTO.md` — añadido
- `ia/PROTOCOLO.md` — añadido
- `ia/REGLAS.md` — añadido
- `ia/check_skill.py` — añadido
- `ia/githooks/pre-commit` — añadido
- `ia/githooks/pre-push` — añadido
- `ia/guard.py` — añadido
- `ia/instalar.sh` — añadido
- `ia/plantillas/ENTREGA.md` — añadido
- `ia/plantillas/PETICION.md` — añadido
- `ia/politica.json` — añadido
- `ia/test_guard.py` — añadido
- `ia/verificar.py` — añadido

## Verificación

| Comando | Resultado | Detalle |
|---|---|---|
| `python3 ia/test_guard.py` | aprobado | Ran 32 tests in 7.242s · OK |
| `python3 ia/verificar.py reglas --check` | aprobado |  |
| `node --test scripts/continuity.test.mjs` | aprobado | # duration_ms 4678.633063 |

## Límites y pendientes

- Los frenos de Claude Code solo actúan en Claude Code dentro de este repositorio. Los hooks de git
  requieren `sh ia/instalar.sh` en cada copia. GitHub Actions marca un push sin registro, pero no lo
  revierte ni lo impide: para impedirlo hace falta protección de rama con el check obligatorio, que
  se configura en GitHub y no se activó aquí.
- En chat (claude.ai, ChatGPT o Gemini) no hay freno automático: la IA debe cumplir `ia/REGLAS.md` y
  entregar un «Registro pendiente».
- No se verificó la subida real de skills a claude.ai ni a ChatGPT, ni el descubrimiento de
  `.agents/skills/` por cada versión de Codex o de `GEMINI.md` por Gemini CLI.
- Los nombres de conectores (Gmail, Drive) cambian según la instalación; comprobarlos con `/mcp`
  antes de programar ejecuciones.
