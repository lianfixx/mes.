import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const SESSION_DIR = "docs/continuidad/sesiones/";
export const SKILL_DIR = "skills/mes-continuidad";
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const ID = /^[a-z0-9][a-z0-9-]{2,100}$/;
const kinds = new Set([
  "request",
  "inspection",
  "decision",
  "change",
  "command",
  "verification",
  "delegation",
  "response",
  "handoff",
  "integration",
  "correction",
  "blocker",
]);

function demand(condition, message) {
  if (!condition) throw new Error(message);
}
function text(value, field) {
  demand(
    typeof value === "string" && value.trim().length > 0,
    `${field}: texto requerido`,
  );
}
function timestamp(value, field) {
  text(value, field);
  demand(
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value),
    `${field}: usar ISO UTC`,
  );
  const d = new Date(value);
  demand(
    Number.isFinite(d.valueOf()) &&
      d.toISOString().replace(".000Z", "Z") === value.replace(".000Z", "Z"),
    `${field}: fecha inválida`,
  );
  return d.valueOf();
}
export const digest = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");
export function relativeName(name) {
  text(name, "ruta");
  demand(
    !path.isAbsolute(name) &&
      !/^[A-Za-z]:/.test(name) &&
      !/[\\\x00-\x1f]/.test(name),
    `Ruta insegura: ${name}`,
  );
  demand(
    name.split("/").every((part) => part && part !== "." && part !== ".."),
    `Ruta insegura: ${name}`,
  );
  return name;
}
export function safeFile(root, name) {
  relativeName(name);
  let current = root;
  for (const part of name.split("/")) {
    current = path.join(current, part);
    const info = fs.lstatSync(current, { throwIfNoEntry: false });
    if (info)
      demand(
        !info.isSymbolicLink(),
        `No se admiten enlaces simbólicos: ${name}`,
      );
  }
  return current;
}
function git(root, args, binary = false) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: binary ? undefined : "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}
function commit(root, sha) {
  demand(SHA.test(sha), `Se requiere SHA completo, no una rama: ${sha}`);
  git(root, ["cat-file", "-e", `${sha}^{commit}`]);
}
function ancestor(root, base, head) {
  commit(root, base);
  commit(root, head);
  git(root, ["merge-base", "--is-ancestor", base, head]);
}
function split0(value) {
  return value.split("\0").filter(Boolean);
}
export function repositoryFiles(root) {
  return [
    ...new Set(
      split0(
        git(root, [
          "ls-files",
          "--cached",
          "--others",
          "--exclude-standard",
          "-z",
        ]),
      ),
    ),
  ].sort();
}
function jsonFile(root, name) {
  return JSON.parse(fs.readFileSync(safeFile(root, name), "utf8"));
}
function allSkillFiles(root) {
  const out = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      demand(!e.isSymbolicLink(), "La skill no puede contener symlinks");
      const name = path.join(dir, e.name);
      if (e.isDirectory()) walk(name);
      else out.push(path.relative(root, name).split(path.sep).join("/"));
    }
  }
  walk(path.join(root, SKILL_DIR));
  return out.sort();
}

export function validateSession(s, root) {
  demand(s.schema_version === 1, "Versión de sesión no admitida");
  demand(ID.test(s.id), "ID de sesión inválido");
  demand(
    ["work", "review", "integration"].includes(s.kind),
    "Tipo de sesión inválido",
  );
  demand(
    ["in_progress", "ready", "blocked"].includes(s.status),
    "Estado de sesión inválido",
  );
  const created = timestamp(s.created_at, "created_at");
  const updated = timestamp(s.updated_at, "updated_at");
  demand(updated >= created, "updated_at anterior al inicio");
  demand(s.repository === "lianfixx/mes.", "Repositorio inesperado");
  text(s.request?.by, "request.by");
  text(s.request?.text, "request.text");
  text(s.request?.source, "request.source");
  demand(SHA.test(s.baseline?.commit), "Base exacta requerida");
  text(s.baseline.branch, "baseline.branch");
  demand(
    Array.isArray(s.baseline.dirty_paths),
    "Registrar cambios previos, incluso []",
  );
  s.baseline.dirty_paths.forEach(relativeName);
  demand(Array.isArray(s.actors) && s.actors.length > 0, "Actores requeridos");
  const actors = new Set();
  for (const a of s.actors) {
    demand(ID.test(a.id) && !actors.has(a.id), "Actor inválido o duplicado");
    actors.add(a.id);
    for (const key of ["tool", "model", "identity_basis"])
      text(a[key], `actor.${key}`);
    demand(
      Array.isArray(a.roles) &&
        a.roles.length > 0 &&
        a.roles.every((r) =>
          ["owner", "executor", "reviewer", "integrator"].includes(r),
        ),
      "Roles inválidos",
    );
  }
  demand(actors.has(s.executor), "Ejecutor no declarado");
  demand(
    s.actors.find((a) => a.id === s.executor).roles.includes("executor"),
    "El ejecutor debe tener rol executor",
  );
  demand(Array.isArray(s.events) && s.events.length > 0, "Eventos requeridos");
  let last = created;
  const ids = new Set();
  for (const e of s.events) {
    demand(ID.test(e.id) && !ids.has(e.id), "Evento inválido o duplicado");
    ids.add(e.id);
    demand(actors.has(e.actor), "Actor de evento desconocido");
    demand(kinds.has(e.kind), `Tipo de evento inválido: ${e.kind}`);
    text(e.summary, "event.summary");
    const at = timestamp(e.at, "event.at");
    demand(at >= last && at <= updated, "Eventos fuera de orden o del período");
    last = at;
  }
  demand(
    Array.isArray(s.changes) &&
      Array.isArray(s.checks) &&
      Array.isArray(s.artifacts),
    "Faltan changes/checks/artifacts",
  );
  const changed = new Set();
  for (const c of s.changes) {
    relativeName(c.path);
    demand(!changed.has(c.path), "Ruta de cambio duplicada");
    changed.add(c.path);
    demand(
      ["added", "modified", "deleted"].includes(c.action),
      "Acción de cambio inválida",
    );
    text(c.reason, "change.reason");
    demand(actors.has(c.actor), "Actor de cambio desconocido");
  }
  const artifacts = new Set();
  for (const a of s.artifacts) {
    relativeName(a.path);
    demand(HASH.test(a.sha256), "Hash de evidencia inválido");
    demand(!artifacts.has(a.path), "Artefacto duplicado");
    artifacts.add(a.path);
    demand(
      !a.path.startsWith(SESSION_DIR) && a.path !== "SHA256SUMS.json",
      "Evitar evidencia con hash circular",
    );
    text(a.description, "artifact.description");
    if (root)
      demand(
        digest(fs.readFileSync(safeFile(root, a.path))) === a.sha256,
        `Evidencia alterada: ${a.path}`,
      );
  }
  for (const c of s.checks) {
    text(c.name, "check.name");
    text(c.command, "check.command");
    demand(actors.has(c.actor), "Autor de comprobación desconocido");
    const checkedAt = timestamp(c.at, "check.at");
    demand(
      checkedAt >= created && checkedAt <= updated,
      "Comprobación fuera del período de sesión",
    );
    demand(
      ["passed", "failed", "not_run", "blocked"].includes(c.outcome),
      "Resultado inválido",
    );
    demand(Array.isArray(c.evidence), "Lista de evidencia requerida");
    for (const name of c.evidence)
      demand(artifacts.has(name), `Evidencia sin inventario: ${name}`);
    if (["passed", "failed"].includes(c.outcome)) {
      demand(
        Number.isInteger(c.exit_code) &&
          (c.outcome === "passed" ? c.exit_code === 0 : c.exit_code !== 0),
        "Resultado y exit_code contradictorios",
      );
      demand(
        c.evidence.length > 0,
        "Resultado ejecutado sin evidencia durable",
      );
    } else {
      demand(c.exit_code === null, "Prueba no ejecutada con exit_code");
      text(c.reason, "check.reason");
    }
  }
  demand(
    Array.isArray(s.inputs) && Array.isArray(s.corrections),
    "Declarar inputs y corrections, incluso []",
  );
  for (const input of s.inputs) {
    text(input.source, "input.source");
    demand(SHA.test(input.commit), "Input Git sin SHA exacto");
    demand(
      ["reviewed", "accepted", "rejected", "deferred"].includes(
        input.disposition,
      ),
      "Estado de input inválido",
    );
    text(input.reason, "input.reason");
  }
  if (s.kind === "integration")
    demand(s.inputs.length > 0, "Integración sin origen");
  s.corrections.forEach((id) =>
    demand(ID.test(id), "Referencia de corrección inválida"),
  );
  demand(
    Array.isArray(s.handoff?.next_steps) && Array.isArray(s.handoff?.blockers),
    "Falta continuación/bloqueos",
  );
  if (s.status !== "in_progress") {
    text(s.handoff.summary, "handoff.summary");
    text(s.handoff.delivery, "handoff.delivery");
    demand(
      s.checks.length > 0,
      "Cierre sin comprobaciones ni pendientes explícitos",
    );
    if (s.status === "blocked")
      demand(s.handoff.blockers.length > 0, "Estado bloqueado sin motivo");
  }
  return s;
}

export function writeManifest(root) {
  const files = repositoryFiles(root).filter(
    (p) => p !== "SHA256SUMS.json" && fs.existsSync(path.join(root, p)),
  );
  const manifest = Object.fromEntries(
    files.map((p) => [p, digest(fs.readFileSync(safeFile(root, p)))]),
  );
  fs.writeFileSync(
    path.join(root, "SHA256SUMS.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  return files.length;
}
export function verifyManifest(root) {
  const files = repositoryFiles(root).filter((p) => p !== "SHA256SUMS.json");
  const manifest = jsonFile(root, "SHA256SUMS.json");
  demand(
    JSON.stringify(Object.keys(manifest).sort()) === JSON.stringify(files),
    "El inventario SHA256 no coincide con los archivos de la entrega; regenerar después de git add",
  );
  for (const p of files)
    demand(
      digest(fs.readFileSync(safeFile(root, p))) === manifest[p],
      `Manifiesto desactualizado: ${p}`,
    );
  return files.length;
}
export function verifySkillPackage(root, zipPath) {
  const expected = allSkillFiles(root).map((p) => p.replace(/^skills\//, ""));
  const call = (args) =>
    execFileSync("unzip", args, { maxBuffer: 8 * 1024 * 1024, timeout: 10000 });
  const entries = call(["-Z1", zipPath]).toString().trim().split("\n");
  const metadata = call(["-Z", "-l", zipPath]).toString();
  demand(
    !/^l[rwxstST-]{9}\s/m.test(metadata),
    "El ZIP contiene enlaces simbólicos",
  );
  entries.forEach(relativeName);
  demand(
    JSON.stringify([...entries].sort()) === JSON.stringify(expected),
    "Inventario ZIP inesperado",
  );
  for (const name of entries)
    demand(
      call(["-p", zipPath, name]).equals(
        fs.readFileSync(safeFile(root, "skills/" + name)),
      ),
      `Skill empaquetada distinta: ${name}`,
    );
  return entries.length;
}
export function checkRepository(root, base) {
  const files = repositoryFiles(root);
  const paths = files.filter(
    (p) => p.startsWith(SESSION_DIR) && p.endsWith(".json"),
  );
  demand(paths.length > 0, "No hay sesiones documentadas");
  const records = paths.map((p) => {
    const s = validateSession(jsonFile(root, p), root);
    demand(
      p === `${SESSION_DIR}${s.id}.json`,
      "Nombre de archivo e ID distintos",
    );
    return { p, s };
  });
  const ids = new Set(records.map(({ s }) => s.id));
  demand(ids.size === records.length, "Sesiones duplicadas");
  for (const { s } of records)
    for (const id of s.corrections)
      demand(ids.has(id) && id !== s.id, "Corrección sin sesión anterior");
  let covered = 0;
  if (base) {
    const head = git(root, ["rev-parse", "HEAD"]).trim();
    ancestor(root, base, head);
    const changed = new Set([
      ...split0(
        git(root, ["diff", "--name-only", "--no-renames", "-z", base, "--"]),
      ),
      ...split0(
        git(root, ["ls-files", "--others", "--exclude-standard", "-z"]),
      ),
    ]);
    const baseFiles = new Set(
      split0(git(root, ["ls-tree", "-r", "--name-only", "-z", base])),
    );
    for (const p of baseFiles)
      if (p.startsWith(SESSION_DIR) && p.endsWith(".json") && changed.has(p)) {
        const oldBytes = git(root, ["show", `${base}:${p}`], true);
        const old = JSON.parse(oldBytes);
        demand(
          old.status === "in_progress",
          `Sesión sellada modificada o eliminada: ${p}; crear una corrección`,
        );
        demand(
          fs.existsSync(path.join(root, p)),
          "No borrar una sesión abierta",
        );
        const now = jsonFile(root, p);
        demand(
          JSON.stringify(now.events.slice(0, old.events.length)) ===
            JSON.stringify(old.events),
          "Eventos anteriores reescritos",
        );
        demand(
          JSON.stringify(now.baseline) === JSON.stringify(old.baseline) &&
            JSON.stringify(now.request) === JSON.stringify(old.request) &&
            now.executor === old.executor &&
            now.created_at === old.created_at,
          "Identidad/base/encargo de sesión reescritos",
        );
        demand(
          now.id === old.id &&
            now.kind === old.kind &&
            now.repository === old.repository &&
            JSON.stringify(now.actors.slice(0, old.actors.length)) ===
              JSON.stringify(old.actors),
          "Actores o tipo de sesión reescritos",
        );
      }
    const current = records.filter(({ p }) => changed.has(p));
    const claims = new Set();
    const explicitSources = [
      ...new Set(
        current
          .filter(({ s }) => s.kind === "integration")
          .flatMap(({ s }) =>
            s.inputs
              .filter((i) => i.disposition === "accepted")
              .map((i) => i.commit),
          ),
      ),
    ];
    for (const source of explicitSources) commit(root, source);
    for (const { p, s } of current) {
      demand(s.status !== "in_progress", `Sesión aún abierta: ${s.id}`);
      // Una sesión importada describe su propio resultado, no la resolución
      // posterior del integrador. Localizar sus bytes sellados evita atribuirle
      // cambios de otra rama o aceptar una resolución que nadie documentó.
      const recordBytes = fs.readFileSync(safeFile(root, p));
      const candidates = [
        ...new Set(
          [...explicitSources, head].flatMap((ref) =>
            git(root, ["log", "--reverse", "--format=%H", ref, "--", p])
              .trim()
              .split("\n")
              .filter(Boolean),
          ),
        ),
      ];
      let snapshot = null;
      for (const candidate of candidates) {
        try {
          if (
            git(root, ["show", `${candidate}:${p}`], true).equals(recordBytes)
          ) {
            snapshot = candidate;
            break;
          }
        } catch {
          /* Un commit que elimina el registro no es su entrega. */
        }
      }
      ancestor(root, s.baseline.commit, snapshot || head);
      const ownBefore = new Set(
        split0(
          git(root, ["ls-tree", "-r", "--name-only", "-z", s.baseline.commit]),
        ),
      );
      const ownAfter = snapshot
        ? new Set(
            split0(git(root, ["ls-tree", "-r", "--name-only", "-z", snapshot])),
          )
        : null;
      const ownChanges = new Set([
        ...split0(
          git(root, [
            "diff",
            "--name-only",
            "--no-renames",
            "-z",
            s.baseline.commit,
            ...(snapshot ? [snapshot] : []),
            "--",
          ]),
        ),
        ...(snapshot
          ? []
          : split0(
              git(root, ["ls-files", "--others", "--exclude-standard", "-z"]),
            )),
      ]);
      for (const c of s.changes) {
        demand(
          ownChanges.has(c.path),
          `Cambio declarado ajeno al rango propio: ${c.path}`,
        );
        const before = ownBefore.has(c.path),
          after = snapshot
            ? ownAfter.has(c.path)
            : fs.existsSync(safeFile(root, c.path));
        demand(
          c.action === (!after ? "deleted" : before ? "modified" : "added"),
          `Tipo de cambio incorrecto: ${c.path}`,
        );
        const finalExists = fs.existsSync(safeFile(root, c.path));
        const matches =
          after === finalExists &&
          (!after ||
            !snapshot ||
            git(root, ["show", `${snapshot}:${c.path}`], true).equals(
              fs.readFileSync(safeFile(root, c.path)),
            ));
        if (matches) claims.add(c.path);
      }
    }
    for (const p of changed)
      if (p !== "SHA256SUMS.json" && !paths.includes(p)) {
        demand(claims.has(p), `Cambio sin documentar: ${p}`);
        covered++;
      }
  }
  const skill = fs.readFileSync(path.join(root, SKILL_DIR, "SKILL.md"), "utf8");
  demand(
    /^---\nname: mes-continuidad\ndescription: .+\n---\n/.test(skill),
    "Cabecera de skill inválida",
  );
  const bridges = [".agents", ".claude"].map((p) =>
    fs.readFileSync(
      path.join(root, p, "skills/mes-continuidad/SKILL.md"),
      "utf8",
    ),
  );
  demand(
    bridges[0] === bridges[1] &&
      bridges[0].includes("../../../skills/mes-continuidad/SKILL.md"),
    "Puentes de skill incoherentes",
  );
  const packaged = verifySkillPackage(
    root,
    path.join(root, "distribucion/mes-continuidad.zip"),
  );
  return {
    sessions: records.length,
    covered_files: covered,
    manifest_entries: verifyManifest(root),
    skill_files: packaged,
  };
}

export function makeDelivery(root, sessionPath, head) {
  const s = validateSession(jsonFile(root, sessionPath), root);
  demand(s.status !== "in_progress", "Cerrar la sesión antes de entregar");
  ancestor(root, s.baseline.commit, head);
  demand(
    git(root, ["status", "--porcelain"]).trim() === "",
    "La entrega requiere checkout limpio",
  );
  demand(
    git(root, ["show", `${head}:${sessionPath}`], true).equals(
      fs.readFileSync(safeFile(root, sessionPath)),
    ),
    "La sesión no está en el commit entregado",
  );
  const names = split0(
    git(root, [
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      s.baseline.commit,
      head,
    ]),
  );
  const tree = new Set(
    split0(git(root, ["ls-tree", "-r", "--name-only", "-z", head])),
  );
  const delivery = {
    schema_version: 1,
    repository: s.repository,
    session_id: s.id,
    base_commit: s.baseline.commit,
    head_commit: head,
    commits: git(root, [
      "rev-list",
      "--reverse",
      `${s.baseline.commit}..${head}`,
    ])
      .trim()
      .split("\n")
      .filter(Boolean),
    files: Object.fromEntries(
      names
        .sort()
        .map((p) => [
          p,
          tree.has(p)
            ? digest(git(root, ["show", `${head}:${p}`], true))
            : null,
        ]),
    ),
  };
  verifyDelivery(root, delivery);
  return delivery;
}
export function verifyDelivery(root, d) {
  demand(
    d.schema_version === 1 &&
      d.repository === "lianfixx/mes." &&
      ID.test(d.session_id),
    "Entrega desconocida",
  );
  ancestor(root, d.base_commit, d.head_commit);
  demand(d.base_commit !== d.head_commit, "Entrega sin commits");
  const names = split0(
    git(root, [
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      d.base_commit,
      d.head_commit,
    ]),
  ).sort();
  demand(
    d.files &&
      JSON.stringify(Object.keys(d.files).sort()) === JSON.stringify(names),
    "Inventario de entrega incompleto",
  );
  const commits = git(root, [
    "rev-list",
    "--reverse",
    `${d.base_commit}..${d.head_commit}`,
  ])
    .trim()
    .split("\n");
  demand(
    JSON.stringify(d.commits) === JSON.stringify(commits),
    "Lista de commits no corresponde",
  );
  const tree = new Set(
    split0(git(root, ["ls-tree", "-r", "--name-only", "-z", d.head_commit])),
  );
  const modes = new Map(
    split0(git(root, ["ls-tree", "-r", "-z", d.head_commit])).map((row) => [
      row.slice(row.indexOf("\t") + 1),
      row.slice(0, 6),
    ]),
  );
  const regular = (p) =>
    demand(
      ["100644", "100755"].includes(modes.get(p)),
      `Ruta Git ausente, symlink o no regular: ${p}`,
    );
  for (const p of names) {
    relativeName(p);
    if (tree.has(p)) regular(p);
    const actual = tree.has(p)
      ? digest(git(root, ["show", `${d.head_commit}:${p}`], true))
      : null;
    demand(d.files[p] === actual, `Bytes de entrega no coinciden: ${p}`);
  }
  const sessionPath = `${SESSION_DIR}${d.session_id}.json`;
  regular(sessionPath);
  const record = JSON.parse(
    git(root, ["show", `${d.head_commit}:${sessionPath}`]),
  );
  validateSession(record);
  demand(record.id === d.session_id, "ID de sesión distinto de la entrega");
  demand(
    record.baseline.commit === d.base_commit && record.status !== "in_progress",
    "Sesión/base/cierre incoherente con la entrega",
  );
  for (const artifact of record.artifacts) {
    regular(artifact.path);
    demand(
      digest(git(root, ["show", `${d.head_commit}:${artifact.path}`], true)) ===
        artifact.sha256,
      `Evidencia del commit ausente o alterada: ${artifact.path}`,
    );
  }
  return {
    session: d.session_id,
    head: d.head_commit,
    commits: commits.length,
    files: names.length,
  };
}

export function main(args = process.argv.slice(2), cwd = process.cwd()) {
  const root = git(cwd, ["rev-parse", "--show-toplevel"]).trim();
  const [command, ...rest] = args;
  const option = (name) => rest[rest.indexOf(name) + 1];
  const has = (name) => rest.includes(name);
  if (command === "check")
    return checkRepository(root, has("--base") ? option("--base") : undefined);
  if (command === "manifest") return { entries: writeManifest(root) };
  if (command === "status")
    return repositoryFiles(root)
      .filter((p) => p.startsWith(SESSION_DIR) && p.endsWith(".json"))
      .map((p) => {
        const s = validateSession(jsonFile(root, p), root);
        return {
          id: s.id,
          executor: s.executor,
          actors: s.actors,
          status: s.status,
          baseline: s.baseline,
          handoff: s.handoff,
        };
      });
  if (command === "delivery")
    return makeDelivery(root, option("--session"), option("--head"));
  if (command === "verify-delivery")
    return verifyDelivery(root, JSON.parse(fs.readFileSync(rest[0], "utf8")));
  if (command === "package") {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "mes-skill-"));
    try {
      const files = allSkillFiles(root).map((p) => p.replace(/^skills\//, ""));
      const archive = path.join(temp, "mes-continuidad.zip");
      execFileSync("zip", ["-X", "-q", archive, ...files], {
        cwd: path.join(root, "skills"),
        stdio: "pipe",
      });
      verifySkillPackage(root, archive);
      const target = safeFile(root, "distribucion/mes-continuidad.zip");
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(archive, target);
      return {
        file: "distribucion/mes-continuidad.zip",
        sha256: digest(fs.readFileSync(target)),
        files: files.length,
      };
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  throw new Error(
    "Uso: node scripts/continuity.mjs status | check [--base SHA] | manifest | package | delivery --session RUTA --head SHA | verify-delivery ARCHIVO",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    console.log(JSON.stringify(main(), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
