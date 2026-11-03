import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  SESSION_DIR,
  validateSession,
  relativeName,
  safeFile,
  writeManifest,
  verifyManifest,
  verifySkillPackage,
  checkRepository,
  makeDelivery,
  verifyDelivery,
} from "./continuity.mjs";

// Isolated repositories only: no network, credentials, user index or project data.
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const actor = "agent-codex";
const time = "2026-11-03T12:00:00Z";
const gitEnvironment = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_AUTHOR_NAME: "Mes test fixture",
  GIT_AUTHOR_EMAIL: "fixture@example.invalid",
  GIT_COMMITTER_NAME: "Mes test fixture",
  GIT_COMMITTER_EMAIL: "fixture@example.invalid",
};
const git = (root, args, binary = false) =>
  execFileSync("git", args, {
    cwd: root,
    encoding: binary ? undefined : "utf8",
    env: gitEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 10000,
  });
const write = (root, name, value) => {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
};
const writeJSON = (root, name, value) =>
  write(root, name, JSON.stringify(value, null, 2) + "\n");
const temp = (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "mes-continuity-test-"),
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
};
const record = (base = "1".repeat(40), id = "session-work", who = actor) => ({
  schema_version: 1,
  id,
  kind: "work",
  status: "ready",
  created_at: time,
  updated_at: "2026-11-03T12:05:00Z",
  repository: "lianfixx/mes.",
  request: {
    by: "Emi",
    text: "Documentar este trabajo de prueba",
    source: "fixture",
  },
  baseline: { commit: base, branch: "main", dirty_paths: [] },
  actors: [
    {
      id: who,
      tool: "Test fixture",
      model: "unknown",
      identity_basis: "fixture",
      roles: ["executor"],
    },
  ],
  executor: who,
  events: [
    {
      id: "event-start",
      at: time,
      actor: who,
      kind: "request",
      summary: "Inicio explícito de la sesión",
    },
  ],
  changes: [],
  artifacts: [],
  checks: [
    {
      name: "No ejecutado en esta fixture",
      command: "none",
      actor: who,
      at: time,
      outcome: "not_run",
      exit_code: null,
      evidence: [],
      reason: "Fixture documental sin ejecución de producto",
    },
  ],
  inputs: [],
  corrections: [],
  handoff: {
    summary: "Fixture preparada",
    delivery: "Repositorio de prueba aislado",
    next_steps: [],
    blockers: [],
  },
});
const sessionPath = (id) => `${SESSION_DIR}${id}.json`;
const change = (name, action = "added", who = actor) => ({
  path: name,
  action,
  actor: who,
  reason: "Cambio explícito de la fixture",
});
const saveSession = (root, s) => writeJSON(root, sessionPath(s.id), s);
const stage = (root) => {
  git(root, ["add", "--all"]);
  writeManifest(root);
  git(root, ["add", "SHA256SUMS.json"]);
};
const saveCommit = (root, message) => {
  git(root, ["add", "--all"]);
  git(root, ["commit", "-q", "-m", message]);
  return git(root, ["rev-parse", "HEAD"]).trim();
};
const zip = (cwd, destination, files, options = []) => {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  execFileSync("zip", ["-X", "-q", ...options, destination, ...files], {
    cwd,
    stdio: "pipe",
    timeout: 10000,
  });
};

function fixture(t, { openSeed = false } = {}) {
  const directory = temp(t);
  const root = path.join(directory, "repo");
  fs.mkdirSync(root);
  git(root, ["init", "-q", "-b", "main"]);
  write(root, "payload.txt", "Original del producto\n");
  const first = saveCommit(root, "Base inicial");
  write(
    root,
    "skills/mes-continuidad/SKILL.md",
    "---\nname: mes-continuidad\ndescription: Continuidad de Mes\n---\n\nConsultar references/protocol.md.\n",
  );
  write(
    root,
    "skills/mes-continuidad/references/protocol.md",
    "Protocolo de la fixture.\n",
  );
  const bridge = "Consultar ../../../skills/mes-continuidad/SKILL.md\n";
  for (const provider of [".agents", ".claude"])
    write(root, `${provider}/skills/mes-continuidad/SKILL.md`, bridge);
  const archive = path.join(root, "distribucion/mes-continuidad.zip");
  zip(path.join(root, "skills"), archive, [
    "mes-continuidad/SKILL.md",
    "mes-continuidad/references/protocol.md",
  ]);
  const seed = record(first, "session-seed");
  if (openSeed) seed.status = "in_progress";
  saveSession(root, seed);
  stage(root);
  const base = saveCommit(root, "Protocolo y sesión preexistente");
  return { directory, root, first, base, seed, archive };
}

// Construct an envelope independently from the public Git objects. A sender
// can construct valid outer hashes while falsifying the inner session record.
function envelope(root, id, base, head) {
  const names = git(root, [
    "diff",
    "--name-only",
    "--no-renames",
    "-z",
    base,
    head,
  ])
    .split("\0")
    .filter(Boolean)
    .sort();
  const tree = new Set(
    git(root, ["ls-tree", "-r", "--name-only", "-z", head])
      .split("\0")
      .filter(Boolean),
  );
  return {
    schema_version: 1,
    repository: "lianfixx/mes.",
    session_id: id,
    base_commit: base,
    head_commit: head,
    commits: git(root, ["rev-list", "--reverse", `${base}..${head}`])
      .trim()
      .split("\n")
      .filter(Boolean),
    files: Object.fromEntries(
      names.map((name) => [
        name,
        tree.has(name)
          ? hash(git(root, ["show", `${head}:${name}`], true))
          : null,
      ]),
    ),
  };
}
function deliveryFixture(t) {
  const f = fixture(t);
  const s = record(f.base);
  const evidence = "evidence/result.txt";
  write(f.root, "payload.txt", "Implementación revisada\n");
  write(f.root, evidence, "Resultado reproducible: salida 0\n");
  s.changes = [change("payload.txt", "modified"), change(evidence)];
  s.artifacts = [
    {
      path: evidence,
      sha256: hash(fs.readFileSync(path.join(f.root, evidence))),
      description: "Salida conservada",
    },
  ];
  s.checks = [
    {
      name: "Comprobación de fixture",
      command: "test-command",
      actor,
      at: time,
      outcome: "passed",
      exit_code: 0,
      evidence: [evidence],
    },
  ];
  saveSession(f.root, s);
  stage(f.root);
  const head = saveCommit(f.root, "Entrega documentada");
  return { ...f, s, head, evidence };
}

test("a session permits unknown model identity without inventing attribution", () => {
  assert.doesNotThrow(() => validateSession(record()));
});

test("invalid attribution, chronology and event identity are rejected", async (t) => {
  const cases = [
    [
      "missing actor",
      (s) => {
        s.actors = [];
      },
    ],
    [
      "duplicate actor",
      (s) => {
        s.actors.push(structuredClone(s.actors[0]));
      },
    ],
    [
      "undeclared executor",
      (s) => {
        s.executor = "agent-missing";
      },
    ],
    [
      "executor without executor role",
      (s) => {
        s.actors[0].roles = ["owner"];
      },
    ],
    [
      "unknown event actor",
      (s) => {
        s.events[0].actor = "agent-missing";
      },
    ],
    [
      "duplicate event",
      (s) => {
        s.events.push(structuredClone(s.events[0]));
      },
    ],
    [
      "invalid calendar date",
      (s) => {
        s.created_at = "2026-02-30T12:00:00Z";
      },
    ],
    [
      "event predates session",
      (s) => {
        s.events[0].at = "2026-11-03T11:59:59Z";
      },
    ],
    [
      "event follows checkpoint",
      (s) => {
        s.events[0].at = "2026-11-03T12:06:00Z";
      },
    ],
    [
      "check follows checkpoint",
      (s) => {
        s.checks[0].at = "2026-11-03T12:06:00Z";
      },
    ],
    [
      "check predates session",
      (s) => {
        s.checks[0].at = "2026-11-03T11:59:59Z";
      },
    ],
  ];
  for (const [name, mutate] of cases)
    await t.test(name, () => {
      const s = record();
      mutate(s);
      assert.throws(() => validateSession(s));
    });
});

test("executed checks require consistent exit codes and durable inventoried evidence", async (t) => {
  const cases = [
    [
      "passed with nonzero exit",
      { outcome: "passed", exit_code: 1, evidence: ["evidence/result.txt"] },
    ],
    [
      "failed with zero exit",
      { outcome: "failed", exit_code: 0, evidence: ["evidence/result.txt"] },
    ],
    [
      "passed without durable output",
      { outcome: "passed", exit_code: 0, evidence: [] },
    ],
    [
      "non-executed with exit",
      { outcome: "not_run", exit_code: 0, evidence: [] },
    ],
    [
      "unlisted evidence",
      { outcome: "passed", exit_code: 0, evidence: ["elsewhere.txt"] },
    ],
  ];
  for (const [name, fields] of cases)
    await t.test(name, () => {
      const s = record();
      s.artifacts = [
        {
          path: "evidence/result.txt",
          sha256: "a".repeat(64),
          description: "Output",
        },
      ];
      Object.assign(s.checks[0], fields);
      assert.throws(() => validateSession(s));
    });
});

test("evidence must exist, match its bytes and remain inside the repository", async (t) => {
  const root = temp(t);
  const s = record();
  write(root, "evidence.txt", "Original\n");
  s.artifacts = [
    {
      path: "evidence.txt",
      sha256: hash("Original\n"),
      description: "Evidence",
    },
  ];
  assert.doesNotThrow(() => validateSession(s, root));
  write(root, "evidence.txt", "Alterado\n");
  assert.throws(() => validateSession(s, root), /Evidencia alterada/);
  fs.unlinkSync(path.join(root, "evidence.txt"));
  assert.throws(() => validateSession(s, root));
  for (const value of [
    "../escape",
    "/absolute",
    "C:/outside",
    "path\\outside",
    "a/../b",
    "a//b",
    "a/./b",
    "a\u0000b",
  ])
    assert.throws(() => relativeName(value));
  const outside = path.join(temp(t), "outside.txt");
  fs.writeFileSync(outside, "Original\n");
  fs.symlinkSync(outside, path.join(root, "evidence.txt"));
  assert.throws(() => validateSession(s, root), /simbólicos/);
  fs.symlinkSync(path.dirname(outside), path.join(root, "linked-directory"));
  assert.throws(
    () => safeFile(root, "linked-directory/outside.txt"),
    /simbólicos/,
  );
});

test("the repository manifest detects modified bytes and omitted files", (t) => {
  const { root } = fixture(t);
  assert.ok(verifyManifest(root) > 0);
  write(root, "payload.txt", "Cambio no sellado\n");
  assert.throws(() => verifyManifest(root), /desactualizado/);
  writeManifest(root);
  assert.doesNotThrow(() => verifyManifest(root));
  write(root, "new-file.txt", "Debe inventariarse\n");
  assert.throws(() => verifyManifest(root), /inventario/);
});

test("unrecorded additions, modifications and deletions cannot pass the integration gate", async (t) => {
  for (const operation of ["added", "modified", "deleted"])
    await t.test(operation, (t) => {
      const { root, base } = fixture(t);
      const s = record(base);
      if (operation === "added") write(root, "extra.txt", "Nuevo\n");
      if (operation === "modified") write(root, "payload.txt", "Modificado\n");
      if (operation === "deleted")
        fs.unlinkSync(path.join(root, "payload.txt"));
      saveSession(root, s);
      stage(root);
      assert.throws(() => checkRepository(root, base), /Cambio sin documentar/);
      s.changes = [
        change(operation === "added" ? "extra.txt" : "payload.txt", operation),
      ];
      saveSession(root, s);
      stage(root);
      assert.equal(checkRepository(root, base).covered_files, 1);
    });
});

test("a rename records both the removed path and new path", (t) => {
  const { root, base } = fixture(t);
  fs.renameSync(path.join(root, "payload.txt"), path.join(root, "renamed.txt"));
  const s = record(base);
  s.changes = [change("renamed.txt")];
  saveSession(root, s);
  stage(root);
  assert.throws(
    () => checkRepository(root, base),
    /Cambio sin documentar: payload/,
  );
  s.changes.push(change("payload.txt", "deleted"));
  saveSession(root, s);
  stage(root);
  assert.equal(checkRepository(root, base).covered_files, 2);
});

test("sealed records cannot be rewritten or removed", async (t) => {
  for (const operation of ["rewrite", "delete"])
    await t.test(operation, (t) => {
      const { root, base, seed } = fixture(t);
      saveSession(root, record(base));
      if (operation === "rewrite") {
        seed.handoff.summary = "Historia reemplazada";
        saveSession(root, seed);
      } else fs.unlinkSync(path.join(root, sessionPath(seed.id)));
      stage(root);
      assert.throws(() => checkRepository(root, base), /Sesión sellada/);
    });
});

test("an open session can append events but cannot rewrite its existing history", (t) => {
  const { root, base, seed } = fixture(t, { openSeed: true });
  seed.status = "ready";
  seed.events.push({
    id: "event-finish",
    at: "2026-11-03T12:04:00Z",
    actor,
    kind: "handoff",
    summary: "Cierre documentado",
  });
  saveSession(root, seed);
  stage(root);
  assert.doesNotThrow(() => checkRepository(root, base));
  seed.events[0].summary = "Solicitud previa reescrita";
  saveSession(root, seed);
  stage(root);
  assert.throws(
    () => checkRepository(root, base),
    /Eventos anteriores reescritos/,
  );
});

test("two concurrent actors retain separate records and cover their respective work", (t) => {
  const { root, base } = fixture(t);
  const one = record(base, "session-codex", "agent-codex");
  const two = record(base, "session-claude", "agent-claude");
  git(root, ["switch", "-q", "-c", "work-codex", base]);
  write(root, "from-codex.txt", "Trabajo A\n");
  one.changes = [change("from-codex.txt", "added", one.executor)];
  saveSession(root, one);
  stage(root);
  const firstHead = saveCommit(root, "Trabajo independiente de Codex");
  git(root, ["switch", "-q", "-c", "work-claude", base]);
  write(root, "from-claude.txt", "Trabajo B\n");
  two.changes = [change("from-claude.txt", "added", two.executor)];
  saveSession(root, two);
  stage(root);
  const secondHead = saveCommit(root, "Trabajo independiente de Claude");
  assert.throws(
    () => git(root, ["merge", "--no-commit", "--no-ff", "work-codex"]),
    (error) => error.status === 1,
  );
  assert.equal(
    git(root, ["diff", "--name-only", "--diff-filter=U"]).trim(),
    "SHA256SUMS.json",
  );
  const integrated = record(base, "session-integration", "agent-integrator");
  integrated.kind = "integration";
  integrated.actors[0].roles.push("integrator");
  integrated.inputs = [firstHead, secondHead].map((commit) => ({
    source: "Rama local de la fixture",
    commit,
    disposition: "accepted",
    reason: "Cambios independientes revisados sin descartar autoría",
  }));
  saveSession(root, integrated);
  // Resolve the generated manifest from the combined tree, not by accepting
  // one actor's version and silently dropping the other actor's records.
  stage(root);
  saveCommit(root, "Integración explícita de ambas entregas");
  const result = checkRepository(root, base);
  assert.equal(result.sessions, 4);
  assert.equal(result.covered_files, 2);
  for (const [head, session] of [
    [firstHead, one],
    [secondHead, two],
  ]) {
    assert.ok(
      git(root, ["show", `${head}:${sessionPath(session.id)}`], true).equals(
        fs.readFileSync(path.join(root, sessionPath(session.id))),
      ),
    );
  }
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, sessionPath(one.id)), "utf8"))
      .executor,
    "agent-codex",
  );
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, sessionPath(two.id)), "utf8"))
      .executor,
    "agent-claude",
  );
});

test("a combined conflict resolution needs its own integrator attribution", (t) => {
  const { root, base } = fixture(t);
  const one = record(base, "session-codex-conflict", "agent-codex");
  const two = record(base, "session-claude-conflict", "agent-claude");
  git(root, ["switch", "-q", "-c", "conflict-codex", base]);
  write(root, "payload.txt", "Cambio de Codex\n");
  one.changes = [change("payload.txt", "modified", one.executor)];
  saveSession(root, one);
  stage(root);
  const firstHead = saveCommit(root, "Codex modifica la misma línea");
  git(root, ["switch", "-q", "-c", "conflict-claude", base]);
  write(root, "payload.txt", "Cambio de Claude\n");
  two.changes = [change("payload.txt", "modified", two.executor)];
  saveSession(root, two);
  stage(root);
  const secondHead = saveCommit(root, "Claude modifica la misma línea");
  assert.throws(
    () => git(root, ["merge", "--no-commit", "--no-ff", "conflict-codex"]),
    (error) => error.status === 1,
  );
  assert.deepEqual(
    git(root, ["diff", "--name-only", "--diff-filter=U"])
      .trim()
      .split("\n")
      .sort(),
    ["SHA256SUMS.json", "payload.txt"],
  );
  write(root, "payload.txt", "Cambio de Codex\nCambio de Claude\n");
  stage(root);
  saveCommit(root, "Resolución combinada aún sin atribución suficiente");

  const integrated = record(
    secondHead,
    "session-conflict-integration",
    "agent-integrator",
  );
  integrated.kind = "integration";
  integrated.actors[0].roles.push("integrator");
  integrated.inputs = [firstHead, secondHead].map((commit) => ({
    source: "Rama de prueba que modifica payload.txt",
    commit,
    disposition: "accepted",
    reason: "Resolución explícita conserva ambas aportaciones",
  }));
  saveSession(root, integrated);
  stage(root);
  // Both source actors claimed this path, but neither wrote the final combined
  // bytes. Merely carrying their sessions forward must not hide that new work.
  assert.throws(() => checkRepository(root, base), /Cambio sin documentar/);
  integrated.changes = [change("payload.txt", "modified", integrated.executor)];
  saveSession(root, integrated);
  stage(root);
  saveCommit(root, "Integrador documenta su resolución del conflicto");
  assert.equal(checkRepository(root, base).covered_files, 1);
  assert.equal(checkRepository(root, secondHead).covered_files, 1);
  for (const [head, session] of [
    [firstHead, one],
    [secondHead, two],
  ]) {
    assert.ok(
      git(root, ["show", `${head}:${sessionPath(session.id)}`], true).equals(
        fs.readFileSync(path.join(root, sessionPath(session.id))),
      ),
    );
  }
});

test("skill packages are portable, complete and byte-identical to their canonical files", (t) => {
  const { root, archive, directory } = fixture(t);
  assert.equal(verifySkillPackage(root, archive), 2);
  const installation = path.join(directory, "installation");
  execFileSync("unzip", ["-q", archive, "-d", installation], {
    stdio: "pipe",
    timeout: 10000,
  });
  assert.equal(
    fs.readFileSync(
      path.join(installation, "mes-continuidad/SKILL.md"),
      "utf8",
    ),
    fs.readFileSync(path.join(root, "skills/mes-continuidad/SKILL.md"), "utf8"),
  );
  assert.ok(
    fs.existsSync(
      path.join(installation, "mes-continuidad/references/protocol.md"),
    ),
  );
  write(
    root,
    "skills/mes-continuidad/references/protocol.md",
    "Versión nueva todavía sin empaquetar\n",
  );
  assert.throws(() => verifySkillPackage(root, archive), /distinta/);
});

test("incomplete and traversal ZIPs are rejected without extracting them", (t) => {
  const { root, directory } = fixture(t);
  const incomplete = path.join(directory, "incomplete.zip");
  zip(path.join(root, "skills"), incomplete, ["mes-continuidad/SKILL.md"]);
  assert.throws(() => verifySkillPackage(root, incomplete), /Inventario/);
  const staging = path.join(directory, "staging");
  fs.mkdirSync(staging);
  write(directory, "escape.txt", "Nunca extraer fuera\n");
  const traversal = path.join(directory, "traversal.zip");
  zip(staging, traversal, ["../escape.txt"]);
  assert.throws(() => verifySkillPackage(root, traversal), /insegura/);
});

test("a ZIP symlink is rejected even if its target bytes match the canonical text", (t) => {
  const { root, directory } = fixture(t);
  const staging = path.join(directory, "symlink-staging");
  const relative = "mes-continuidad/references/protocol.md";
  const linkTarget = "../../../../outside";
  write(root, `skills/${relative}`, linkTarget);
  write(
    staging,
    "mes-continuidad/SKILL.md",
    fs.readFileSync(path.join(root, "skills/mes-continuidad/SKILL.md")),
  );
  fs.mkdirSync(path.dirname(path.join(staging, relative)), { recursive: true });
  fs.symlinkSync(linkTarget, path.join(staging, relative));
  const archive = path.join(directory, "symlink.zip");
  zip(staging, archive, ["mes-continuidad/SKILL.md", relative], ["-y"]);
  assert.throws(() => verifySkillPackage(root, archive));
});

test("deliveries bind exact commits and file bytes and refuse a dirty sender", (t) => {
  const { root, base, head, s } = deliveryFixture(t);
  const delivery = makeDelivery(root, sessionPath(s.id), head);
  assert.deepEqual(delivery, envelope(root, s.id, base, head));
  assert.equal(verifyDelivery(root, delivery).head, head);
  write(root, "uncommitted.txt", "Trabajo todavía no entregable\n");
  assert.throws(() => makeDelivery(root, sessionPath(s.id), head), /limpio/);
});

test("delivery tampering is rejected for SHA, base, inventory, commits and bytes", async (t) => {
  const { root, head, base, s } = deliveryFixture(t);
  const original = makeDelivery(root, sessionPath(s.id), head);
  const cases = [
    [
      "short HEAD",
      (d) => {
        d.head_commit = head.slice(0, 7);
      },
    ],
    [
      "nonexistent base",
      (d) => {
        d.base_commit = "f".repeat(40);
      },
    ],
    [
      "base equals HEAD",
      (d) => {
        d.base_commit = head;
      },
    ],
    [
      "backwards ancestry",
      (d) => {
        d.base_commit = head;
        d.head_commit = base;
      },
    ],
    [
      "omitted file",
      (d) => {
        delete d.files["payload.txt"];
      },
    ],
    [
      "invented file",
      (d) => {
        d.files["invented.txt"] = "a".repeat(64);
      },
    ],
    [
      "altered hash",
      (d) => {
        d.files["payload.txt"] = "a".repeat(64);
      },
    ],
    [
      "missing commit",
      (d) => {
        d.commits = [];
      },
    ],
  ];
  for (const [name, mutate] of cases)
    await t.test(name, () => {
      const delivery = structuredClone(original);
      mutate(delivery);
      assert.throws(() => verifyDelivery(root, delivery));
    });
});

test("valid outer hashes cannot hide altered or missing evidence in the delivered commit", async (t) => {
  for (const operation of ["altered", "missing"])
    await t.test(operation, (t) => {
      const { root, head, base, s, evidence } = deliveryFixture(t);
      assert.equal(
        verifyDelivery(root, envelope(root, s.id, base, head)).head,
        head,
      );
      if (operation === "altered")
        write(root, evidence, "Resultado distinto\n");
      else fs.unlinkSync(path.join(root, evidence));
      stage(root);
      const corrupted = saveCommit(
        root,
        "Evidencia incoherente con el registro",
      );
      assert.throws(() =>
        verifyDelivery(root, envelope(root, s.id, base, corrupted)),
      );
    });
});

test("the delivery identity must match the session stored at its declared path", (t) => {
  const { root, base, s } = deliveryFixture(t);
  const wrong = structuredClone(s);
  wrong.id = "session-another";
  writeJSON(root, sessionPath(s.id), wrong);
  stage(root);
  const head = saveCommit(root, "Registro con ID ajeno al nombre");
  assert.throws(() => verifyDelivery(root, envelope(root, s.id, base, head)));
});

test("a Git delivery cannot smuggle an escaping symlink as an ordinary file", (t) => {
  const { root, base, s, directory } = deliveryFixture(t);
  const outside = path.join(directory, "outside-secret.txt");
  fs.writeFileSync(outside, "Fixture privada fuera del checkout\n");
  fs.symlinkSync(outside, path.join(root, "escape-link"));
  s.changes.push(change("escape-link"));
  saveSession(root, s);
  // Deliberately bypass the sender's manifest gate: the receiver must validate
  // Git object modes instead of trusting a well-formed envelope from another AI.
  const head = saveCommit(root, "Entrega maliciosa con symlink");
  assert.throws(() => verifyDelivery(root, envelope(root, s.id, base, head)));
});
