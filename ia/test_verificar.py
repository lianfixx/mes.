"""Pruebas del control ligero (ia/verificar.py): python3 -m unittest discover -s ia -p 'test_*.py'
Los secretos de prueba se arman por partes en tiempo de ejecución; todos son ficticios."""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

VERIFICAR = Path(__file__).resolve().parent / "verificar.py"
TOKEN = "gh" + "p_" + "Q7w9Zr2Lk4Tn8Vb1Xc6Md3Pf5Hs0Jy" + "Ae4Ru7"


class Control(unittest.TestCase):
    def repo(self, t: Path) -> Path:
        r = t / "r"
        (r / "ia").mkdir(parents=True)
        (r / "ia" / "verificar.py").write_text(VERIFICAR.read_text(encoding="utf-8"), encoding="utf-8")
        self.git(r, "init", "-q")
        (r / "CHANGELOG.md").write_text("# Cambios\n\n## Inicio\n\n- Agente: Emi\n", encoding="utf-8")
        self.git(r, "add", "-A")
        self.git(r, "commit", "-qm", "base")
        return r

    def git(self, r: Path, *a: str) -> None:
        subprocess.run(["git", "-c", "user.name=t", "-c", "user.email=t@t", *a], cwd=r, check=True, capture_output=True)

    def ci(self, r: Path) -> subprocess.CompletedProcess:
        return subprocess.run([sys.executable, "ia/verificar.py", "ci"], cwd=r, capture_output=True, text=True)

    def commit(self, r: Path, archivos: dict, entrada: str | None) -> None:
        for k, v in archivos.items():
            (r / k).write_text(v, encoding="utf-8")
        if entrada is not None:
            c = r / "CHANGELOG.md"
            c.write_text(c.read_text(encoding="utf-8").replace("# Cambios\n\n", "# Cambios\n\n" + entrada + "\n"), encoding="utf-8")
        self.git(r, "add", "-A")
        self.git(r, "commit", "-qm", "cambio")

    def test_cambio_con_registro_pasa(self):
        with tempfile.TemporaryDirectory() as t:
            r = self.repo(Path(t))
            self.commit(r, {"a.md": "hola\n"}, "## Algo\n\n- Agente: Claude\n")
            self.assertEqual(self.ci(r).returncode, 0, self.ci(r).stdout)

    def test_sin_registro_falla(self):
        with tempfile.TemporaryDirectory() as t:
            r = self.repo(Path(t))
            self.commit(r, {"a.md": "hola\n"}, None)
            self.assertIn("no actualiza CHANGELOG.md", self.ci(r).stdout)

    def test_entrada_sin_agente_falla(self):
        with tempfile.TemporaryDirectory() as t:
            r = self.repo(Path(t))
            self.commit(r, {"a.md": "hola\n"}, "## Algo\n\n- Solicitud: x\n")
            self.assertIn("no tiene línea", self.ci(r).stdout)

    def test_llave_falla_y_valor_ficticio_no(self):
        with tempfile.TemporaryDirectory() as t:
            r = self.repo(Path(t))
            self.commit(r, {"c.js": f"const k = '{TOKEN}';\nconst e = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxx';\n"}, "## Algo\n\n- Agente: Claude\n")
            out = self.ci(r).stdout
            self.assertIn("c.js:1: posible token de GitHub", out)
            self.assertNotIn("c.js:2", out)

    def test_archivo_env_falla(self):
        with tempfile.TemporaryDirectory() as t:
            r = self.repo(Path(t))
            self.commit(r, {".env": "A=1\n", ".env.example": "A=\n"}, "## Algo\n\n- Agente: Claude\n")
            out = self.ci(r).stdout
            self.assertIn(".env: archivo de credenciales", out)
            self.assertNotIn(".env.example:", out)


if __name__ == "__main__":
    unittest.main()
