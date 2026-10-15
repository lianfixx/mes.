import { spawnSync } from "node:child_process";
const env = { ...process.env, EXPO_NO_TELEMETRY: "1", EXPO_OFFLINE: "1" };
if (process.env.SITES_MANAGED_LINUX_CONTAINER === "1")
  env.__UNSAFE_EXPO_HOME_DIRECTORY = "/tmp/mes-expo";
const r = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", "export", "--platform", "web"],
  { env, stdio: "inherit" },
);
if (r.status !== 0) process.exit(r.status ?? 1);
await import("./finalize-web.mjs");
