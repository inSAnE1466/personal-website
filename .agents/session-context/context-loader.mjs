#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { lstat, readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const CONTRACT = "session-context/v1";
const RECEIPT_CONTRACT = "session-context-receipt/v1";
const CONFIG_NAME = ".agents/session-context.json";
const MAX_CONTEXT_BYTES = 32 * 1024;
const DEFAULT_MAX_FILE_BYTES = MAX_CONTEXT_BYTES;
const DEFAULT_MAX_BUNDLE_BYTES = MAX_CONTEXT_BYTES;
const PHASES = new Set(["start", "resume", "subagent"]);

function fail(message) {
  throw new Error(message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizePath(value, label, { allowAlwaysDenied = false } = {}) {
  if (typeof value !== "string" || !value || value.length > 240 || /[\u0000-\u001f\u007f]/.test(value) || value.includes("\\") || isAbsolute(value) || value.startsWith("~")) {
    fail(`${label} must be a non-empty repository-relative POSIX path`);
  }
  const normalized = posix.normalize(value);
  if (normalized !== value || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    fail(`${label} is not a normalized repository-relative path: ${value}`);
  }
  const segments = normalized.split("/");
  if (!allowAlwaysDenied && segments.some((segment) => segment === ".git" || segment === ".env" || segment.startsWith(".env."))) {
    fail(`${label} is always denied: ${value}`);
  }
  return normalized;
}

function overlaps(path, denied) {
  return path === denied || path.startsWith(`${denied}/`) || denied.startsWith(`${path}/`);
}

async function findRepositoryRoot(from) {
  let current = resolve(from);
  while (true) {
    try {
      const config = join(current, CONFIG_NAME);
      if ((await lstat(config)).isFile()) return current;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const parent = dirname(current);
    if (parent === current) fail(`cannot find ${CONFIG_NAME}`);
    current = parent;
  }
}

function requireExactKeys(value, required, allowed, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  const missing = required.filter((key) => !Object.hasOwn(value, key));
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (missing.length) fail(`${label} is missing: ${missing.join(", ")}`);
  if (unknown.length) fail(`${label} has unsupported fields: ${unknown.join(", ")}`);
}

async function readConfiguration(root) {
  const configPath = join(root, CONFIG_NAME);
  if ((await lstat(configPath)).isSymbolicLink()) fail(`${CONFIG_NAME} cannot be a symlink`);
  const config = JSON.parse(await readFile(configPath, "utf8"));
  requireExactKeys(
    config,
    ["schemaVersion", "contract", "repository", "simpleEnglishPath", "phases", "denyPaths", "limits"],
    ["schemaVersion", "contract", "repository", "simpleEnglishPath", "phases", "denyPaths", "limits"],
    "session context config",
  );
  if (config.schemaVersion !== 1 || config.contract !== CONTRACT) fail(`session context config must use ${CONTRACT}`);
  if (typeof config.repository !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(config.repository)) {
    fail("repository must use lowercase letters, digits, and hyphens");
  }
  requireExactKeys(config.phases, [...PHASES], [...PHASES], "phases");
  for (const phase of PHASES) {
    if (!Array.isArray(config.phases[phase])) fail(`phases.${phase} must be an array`);
    config.phases[phase] = config.phases[phase].map((path, index) => normalizePath(path, `phases.${phase}[${index}]`));
    if (config.phases[phase].length === 0 || config.phases[phase].length > 64) fail(`phases.${phase} must contain 1 through 64 paths`);
    if (new Set(config.phases[phase]).size !== config.phases[phase].length) fail(`phases.${phase} contains a duplicate path`);
    if (!config.phases[phase].includes("AGENTS.md")) fail(`phases.${phase} must include AGENTS.md`);
  }
  config.simpleEnglishPath = normalizePath(config.simpleEnglishPath, "simpleEnglishPath");
  for (const phase of PHASES) {
    if (config.phases[phase].includes(config.simpleEnglishPath)) fail(`phases.${phase} must not repeat simpleEnglishPath`);
  }
  if (!Array.isArray(config.denyPaths)) fail("denyPaths must be an array");
  config.denyPaths = config.denyPaths.map((path, index) => normalizePath(path, `denyPaths[${index}]`, { allowAlwaysDenied: true }));
  if (config.denyPaths.length > 64 || new Set(config.denyPaths).size !== config.denyPaths.length) fail("denyPaths must contain at most 64 unique paths");
  requireExactKeys(config.limits, ["maxFileBytes", "maxBundleBytes"], ["maxFileBytes", "maxBundleBytes"], "limits");
  for (const [name, fallback] of [["maxFileBytes", DEFAULT_MAX_FILE_BYTES], ["maxBundleBytes", DEFAULT_MAX_BUNDLE_BYTES]]) {
    const value = config.limits[name] ?? fallback;
    if (!Number.isSafeInteger(value) || value < 1024 || value > MAX_CONTEXT_BYTES) fail(`limits.${name} is invalid`);
    config.limits[name] = value;
  }
  if (config.limits.maxFileBytes > config.limits.maxBundleBytes) fail("maxFileBytes cannot exceed maxBundleBytes");
  return config;
}

async function adapterProtectedPaths(root) {
  const adapterPath = join(root, ".agents/repository-kit-adapter.json");
  try {
    if ((await lstat(adapterPath)).isSymbolicLink()) fail("repository kit adapter cannot be a symlink");
    const adapter = JSON.parse(await readFile(adapterPath, "utf8"));
    const paths = [];
    for (const route of adapter.routes ?? []) {
      for (const path of route.policy?.protectedPaths ?? []) paths.push(normalizePath(path, "adapter protected path", { allowAlwaysDenied: true }));
    }
    return [...new Set(paths)];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function assertPlainFile(root, repositoryRealPath, path, deniedPaths, maxFileBytes) {
  if (deniedPaths.some((denied) => overlaps(path, denied))) fail("context path is denied");
  const parts = path.split("/");
  let current = root;
  for (const part of parts) {
    current = join(current, part);
    const metadata = await lstat(current);
    if (metadata.isSymbolicLink()) fail(`context path contains a symlink: ${path}`);
  }
  const metadata = await stat(current);
  if (!metadata.isFile()) fail(`context path is not a file: ${path}`);
  if (metadata.size > maxFileBytes) fail(`context file is too large: ${path}`);
  const actual = await realpath(current);
  const rel = relative(repositoryRealPath, actual);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) fail(`context path escapes the repository: ${path}`);
  const bytes = await readFile(actual);
  if (bytes.includes(0)) fail(`context file is not plain text: ${path}`);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`context file is not UTF-8 text: ${path}`);
  }
  return { path, bytes, text, digest: sha256(bytes) };
}

function currentRevision(root) {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unversioned";
  }
}

function encodeReceipt(receipt) {
  return Buffer.from(stableJson(receipt)).toString("base64url");
}

function decodeReceipt(token) {
  if (typeof token !== "string" || token.length === 0 || token.length > 256 * 1024) fail("context receipt token is invalid");
  let value;
  try {
    value = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    fail("context receipt token is invalid");
  }
  return value;
}

async function buildBundle({ root, phase, includes = [] }) {
  if (!PHASES.has(phase)) fail(`phase must be one of: ${[...PHASES].join(", ")}`);
  const config = await readConfiguration(root);
  if (includes.length > 64) fail("load accepts at most 64 included paths");
  const extra = includes.map((path, index) => normalizePath(path, `include[${index}]`));
  const ordered = [config.simpleEnglishPath, ...config.phases[phase], ...extra];
  const paths = [...new Set(ordered)];
  const deniedPaths = [...new Set([...config.denyPaths, ...(await adapterProtectedPaths(root))])];
  const repositoryRealPath = await realpath(root);
  const files = [];
  let totalBytes = 0;
  for (const path of paths) {
    const file = await assertPlainFile(root, repositoryRealPath, path, deniedPaths, config.limits.maxFileBytes);
    totalBytes += file.bytes.length;
    if (totalBytes > config.limits.maxBundleBytes) fail("context bundle is too large");
    files.push(file);
  }
  const receiptBody = {
    contract: RECEIPT_CONTRACT,
    repository: config.repository,
    phase,
    revision: currentRevision(root),
    files: files.map(({ path, digest, bytes }) => ({ path, sha256: digest, bytes: bytes.length })),
  };
  const receipt = { ...receiptBody, bundleSha256: sha256(stableJson(receiptBody)) };
  return { config, files, receipt, token: encodeReceipt(receipt), totalBytes };
}

function renderBundle(bundle) {
  const lines = [
    `SESSION_CONTEXT ${CONTRACT}`,
    `repository=${bundle.receipt.repository}`,
    `phase=${bundle.receipt.phase}`,
    `revision=${bundle.receipt.revision}`,
    "BROWNFIELD_BOOTSTRAP=required",
    "This repository already has authorities, safety limits, decisions, and unfinished work.",
    "Until this output is complete through the final CONTEXT_RECEIPT line, do not inspect, plan, edit, review, or delegate.",
    "Treat earlier work as unverified. Preserve existing files and review that work again after loading context.",
    "The text below is required context. Follow it before you continue.",
  ];
  for (const file of bundle.files) {
    lines.push(`BEGIN CONTEXT FILE ${file.path} sha256=${file.digest} bytes=${file.bytes.length}`);
    lines.push(file.text.endsWith("\n") ? file.text.slice(0, -1) : file.text);
    lines.push(`END CONTEXT FILE ${file.path}`);
  }
  lines.push(`CONTEXT_RECEIPT=${bundle.token}`);
  return `${lines.join("\n")}\n`;
}

async function verifyToken(root, token) {
  const supplied = decodeReceipt(token);
  requireExactKeys(
    supplied,
    ["contract", "repository", "phase", "revision", "files", "bundleSha256"],
    ["contract", "repository", "phase", "revision", "files", "bundleSha256"],
    "context receipt",
  );
  if (supplied.contract !== RECEIPT_CONTRACT || !PHASES.has(supplied.phase)) fail("context receipt contract or phase is invalid");
  if (!Array.isArray(supplied.files) || supplied.files.length === 0) fail("context receipt has no files");
  const includes = supplied.files.map((file) => file?.path);
  const expectedBase = await readConfiguration(root);
  const base = [expectedBase.simpleEnglishPath, ...expectedBase.phases[supplied.phase]];
  if (base.some((path, index) => includes[index] !== path)) fail("context receipt does not contain the required files in order");
  const extra = includes.slice(base.length);
  const current = await buildBundle({ root, phase: supplied.phase, includes: extra });
  if (stableJson(current.receipt) !== stableJson(supplied)) fail("context receipt is stale or does not match this repository");
  return current.receipt;
}

function parseArguments(argv) {
  const [command, phaseOrToken, ...rest] = argv;
  if (command === "load") {
    const includes = [];
    for (let index = 0; index < rest.length; index += 1) {
      if (rest[index] !== "--include" || !rest[index + 1]) fail("load accepts only repeated --include <path> arguments");
      includes.push(rest[index + 1]);
      index += 1;
    }
    return { command, phase: phaseOrToken, includes };
  }
  if (command === "verify") return { command, token: phaseOrToken };
  if (command === "check" && phaseOrToken === undefined) return { command };
  fail("usage: context-loader.mjs load <start|resume|subagent> [--include <path>] | verify <receipt> | check");
}

export async function main(argv = process.argv.slice(2), cwd = process.cwd()) {
  const args = parseArguments(argv);
  const root = await findRepositoryRoot(cwd);
  if (args.command === "load") {
    const bundle = await buildBundle({ root, phase: args.phase, includes: args.includes });
    process.stdout.write(renderBundle(bundle));
    return;
  }
  if (args.command === "verify") {
    const receipt = await verifyToken(root, args.token);
    process.stdout.write(`CONTEXT_OK repository=${receipt.repository} phase=${receipt.phase} revision=${receipt.revision} bundle=${receipt.bundleSha256}\n`);
    return;
  }
  const config = await readConfiguration(root);
  for (const phase of PHASES) await buildBundle({ root, phase });
  process.stdout.write(`CONTEXT_CONFIG_OK repository=${config.repository} contract=${config.contract}\n`);
}

const entry = process.argv[1] ? realpathSync(resolve(process.argv[1])) : "";
if (entry && entry === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    process.stderr.write(`session-context: ${error.message}\n`);
    process.exitCode = 1;
  });
}
