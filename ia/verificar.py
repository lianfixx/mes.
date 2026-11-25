#!/usr/bin/env python3
"""Control ligero del protocolo común entre IA (lianfixx). Mismo para cualquier repositorio.

  python3 ia/verificar.py inicio                      resume rama, último commit, su IA y el registro reciente
  python3 ia/verificar.py ci [--base SHA --head SHA]  en GitHub, en cada push y pull request:
      1. registro: si el cambio toca archivos, CHANGELOG.md cambia en el mismo rango y cada entrada nueva
         trae la línea «- Agente:»;
      2. secretos y datos personales: llaves (GitHub, Claude/OpenAI, Google, AWS, Meta, Slack, claves privadas),
         asignaciones de contraseñas o tokens, CURP y tarjetas (Luhn) en las líneas AGREGADAS;
      3. archivos de credenciales (.env, .pem, credentials.json…) que se intenten subir.

Solo revisa lo que el cambio agrega: no reprocha lo que ya estaba. Marca en rojo y no revierte nada.
No instala hooks ni cambia reglas. Ver ia/PROTOCOLO.md. Solo biblioteca estándar.
Instalado por el Guardián de la Matriz (lianfixx/MATRIZ, docs/GUARDIAN.md) el 25/11/2026.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VACIO = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"  # árbol vacío de git
SECRETOS = [
    ("clave privada", r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    ("token de Meta", r"\bEAA[A-Za-z0-9]{40,}"),
    ("clave OpenAI/Anthropic", r"\bsk-(?:ant-|proj-)?[A-Za-z0-9_\-]{24,}"),
    ("token de GitHub", r"\b(?:ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}"),
    ("clave de Google", r"\bAIza[0-9A-Za-z_\-]{35}\b"),
    ("secreto OAuth de Google", r"\bGOCSPX-[A-Za-z0-9_\-]{20,}"),
    ("clave AWS", r"\bAKIA[0-9A-Z]{16}\b"),
    ("token de Slack", r"\bxox[abprs]-[A-Za-z0-9\-]{10,}"),
    ("asignación de secreto", r"(?i)(?:^|[^A-Za-z0-9])(?:api[_-]?key|client[_-]?secret|secret|token|password|passwd|contraseña)"
                              r"\s*[:=]\s*['\"](?!\$|\{\{|<)[A-Za-z0-9_\-+/=]{16,}['\"]"),
    ("CURP", r"\b[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d\b"),
]
FICTICIO = re.compile(r"x{6,}|example|ejemplo|dummy|fake|ficticio|placeholder|changeme|redacted|your[_-]|tu[_-]", re.I)
TARJETA = re.compile(r"\b(?:\d[ -]?){15,16}\b")
CREDENCIAL = re.compile(r"(^|/)(\.env(\.[\w-]+)?|id_(rsa|ed25519|ecdsa)|[^/]*\.(pem|p12|pfx|key)|credentials?[^/]*\.json|"
                        r"service[-_]?account[^/]*\.json|client_secret[^/]*\.json|token\.json|\.npmrc|\.netrc)$", re.I)
PLANTILLA = re.compile(r"\.(example|ejemplo|sample|template|plantilla)$", re.I)


def git(*args: str) -> str:
    r = subprocess.run(["git", "-C", str(RAIZ), *args], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else ""


def luhn(d: str) -> bool:
    s = 0
    for i, c in enumerate(reversed(d)):
        n = int(c) * (2 if i % 2 else 1)
        s += n - 9 if n > 9 else n
    return s % 10 == 0


def inicio() -> int:
    print(f"Repositorio: {RAIZ.name} · rama {git('rev-parse', '--abbrev-ref', 'HEAD').strip() or '?'}")
    print(f"Último commit: {git('log', '-1', '--format=%h %cs %s').strip() or 'ninguno'}")
    actor = re.search(r"^IA-Actor:\s*(.+)$", git("log", "-1", "--format=%B"), re.M)
    print(f"Última IA: {actor.group(1) if actor else 'no declarada'}")
    registro = RAIZ / "CHANGELOG.md"
    if registro.is_file():
        titulos = [l for l in registro.read_text(encoding="utf-8").splitlines() if l.startswith("## ")][:3]
        print("Registro reciente:\n  " + "\n  ".join(titulos))
    print("Leer: AGENTS.md → ia/REGLAS.md → ia/PROTOCOLO.md")
    return 0


def lineas_agregadas(diff: str):
    ruta, n = "?", 0
    for linea in diff.splitlines():
        if linea.startswith("+++ "):
            ruta = linea[6:] if linea.startswith("+++ b/") else linea[4:]
            continue
        m = re.match(r"@@ -\d+(?:,\d+)? \+(\d+)", linea)
        if m:
            n = int(m.group(1)) - 1
            continue
        if linea.startswith("+"):
            n += 1
            yield ruta, n, linea[1:]
        elif not linea.startswith("-"):
            n += 1


def revisar_secretos(diff: str) -> list[str]:
    fallas = []
    for ruta, n, texto in lineas_agregadas(diff):
        if len(texto) > 4000:
            continue
        for etiqueta, patron in SECRETOS:
            m = re.search(patron, texto)
            if m and not FICTICIO.search(m.group(0)):
                fallas.append(f"{ruta}:{n}: posible {etiqueta}")
        for cand in TARJETA.findall(re.sub(r"https?://\S+", " ", texto)):
            d = re.sub(r"\D", "", cand)
            if len(d) == 16 and luhn(d) and len(set(d)) > 3:
                fallas.append(f"{ruta}:{n}: posible número de tarjeta")
    return fallas


def revisar_registro(base: str, head: str) -> list[str]:
    cambiados = [l for l in git("diff", "--name-only", f"{base}..{head}").splitlines() if l]
    if not cambiados:
        return []
    if "CHANGELOG.md" not in cambiados:
        return ["el cambio no actualiza CHANGELOG.md (registro obligatorio, ia/PROTOCOLO.md sección 3)"]
    antes = git("show", f"{base}:CHANGELOG.md") if base != VACIO else ""
    ahora = git("show", f"{head}:CHANGELOG.md")
    viejas = set(re.findall(r"^## .+$", antes, re.M))
    fallas = []
    for e in re.split(r"^(?=## )", ahora, flags=re.M):
        titulo = e.splitlines()[0] if e.strip() else ""
        if titulo.startswith("## ") and titulo not in viejas and not re.search(r"^- Agente: \S", e, re.M):
            fallas.append(f"CHANGELOG.md: la entrada «{titulo[3:]}» no tiene línea «- Agente:»")
    return fallas


def ci(base: str, head: str) -> int:
    head = head or "HEAD"
    if not base or re.fullmatch(r"0+", base) or not git("cat-file", "-t", base).strip():
        base = git("rev-parse", f"{head}~1").strip() or VACIO
    fallas = revisar_registro(base, head)
    fallas += revisar_secretos(git("diff", "--no-color", "-U0", "--no-ext-diff", f"{base}..{head}"))
    for r in git("diff", "--name-only", "--diff-filter=AR", f"{base}..{head}").splitlines():
        if CREDENCIAL.search(r) and not PLANTILLA.search(r):
            fallas.append(f"{r}: archivo de credenciales; no se sube (agrégalo a .gitignore)")
    for f in fallas:
        print(f"FALLA {f}")
    print(f"Control ({base[:7]}..{head[:7] if head != 'HEAD' else 'HEAD'}): " + ("aprobado" if not fallas else f"{len(fallas)} falla(s)"))
    return 1 if fallas else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("orden", choices=["inicio", "ci"])
    ap.add_argument("--base", default="")
    ap.add_argument("--head", default="")
    a = ap.parse_args()
    sys.exit(inicio() if a.orden == "inicio" else ci(a.base, a.head))
