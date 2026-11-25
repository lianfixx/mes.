# Cambios

## 2026-11-25 · Control automático entre IA (registro y secretos)

- Agente: claude.ai (sesión en la nube desde Claude in Chrome, claude-opus-5-5)
- Solicitud: Emi, 25/11/2026, en chat: instalar los frenos del protocolo común donde faltan («sí»), a partir de la auditoría del Guardián de la Matriz (`lianfixx/MATRIZ`, `docs/GUARDIAN.md`).
- Cambios: control ligero del protocolo común, el mismo que usan X, TikTok, LinkedIn, Instagram y REDES. `ia/verificar.py` (`inicio` y `ci`) y el workflow `control-ia.yml`: en cada push, registro con «Agente:» y revisión de lo agregado (llaves, contraseñas, CURP, tarjetas, archivos de credenciales). No instala hooks ni cambia las reglas propias de este repositorio. Se crea `CHANGELOG.md` como registro común; el registro propio del proyecto sigue igual.
- Archivos: `ia/verificar.py`, `ia/test_verificar.py`, `.github/workflows/control-ia.yml`, `ia/PROTOCOLO.md` (copia 1.1.0), `ia/REGLAS.md`, `AGENTS.md`, `CHANGELOG.md` (nuevo).
- Verificación: `python3 -m unittest discover -s ia -p 'test_*.py'` → aprobado (5); `python3 ia/verificar.py ci` sobre este commit → aprobado.
- Pendiente: ninguno.

