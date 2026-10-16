import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = __dirname;

const MOCK_DIRS = [
  path.join(ROOT, "src", "mocks"),
  path.join(ROOT, "mocks"),
];

const MOCK_FILES = [
  path.join(ROOT, "public", "mockServiceWorker.js"),
];

const EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".vite",
]);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeMocks() {
  for (const dir of MOCK_DIRS) {
    if (await exists(dir)) {
      await fs.rm(dir, { recursive: true, force: true });
      console.log(`✓ Supprimé : ${path.relative(ROOT, dir)}`);
    }
  }

  for (const file of MOCK_FILES) {
    if (await exists(file)) {
      await fs.rm(file, { force: true });
      console.log(`✓ Supprimé : ${path.relative(ROOT, file)}`);
    }
  }
}

function cleanContent(content) {
  let result = content;

  // Imports MSW
  result = result.replace(
    /^\s*import\s+.*?\s+from\s+["']msw(?:\/browser)?["'];?\s*$/gm,
    ""
  );

  // Imports depuis ./mocks, ../mocks, @/mocks...
  result = result.replace(
    /^\s*import\s+.*?\s+from\s+["'][^"']*\/mocks(?:\/[^"']*)?["'];?\s*$/gm,
    ""
  );

  // Imports dynamiques vers mocks
  result = result.replace(
    /^\s*.*?import\(["'][^"']*\/mocks(?:\/[^"']*)?["']\).*?;?\s*$/gm,
    ""
  );

  // worker.start(...)
  result = result.replace(
    /^\s*await\s+worker\.start\(\{[\s\S]*?\}\);?\s*$/gm,
    ""
  );

  // enableMocking().then(...)
  result = result.replace(
    /^\s*enableMocking\(\)\.then\([\s\S]*?\);\s*$/gm,
    ""
  );

  // Blocs classiques contenant "enableMocking"
  result = result.replace(
    /async function enableMocking\(\)\s*\{[\s\S]*?\n\}/g,
    ""
  );

  // Références explicites au worker MSW
  result = result.replace(
    /^\s*.*\bworker\b.*\bsetupWorker\b.*$/gm,
    ""
  );

  // Commentaires MSW
  result = result.replace(
    /^\s*\/\/.*(?:MSW|mockServiceWorker|mock server).*$/gim,
    ""
  );

  // Nettoyage des lignes vides excessives
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trimEnd() + "\n";
}

async function processDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "mocks" ||
        entry.name === "__mocks__"
      ) {
        await fs.rm(fullPath, {
          recursive: true,
          force: true,
        });

        console.log(`✓ Supprimé : ${path.relative(ROOT, fullPath)}`);
        continue;
      }

      await processDirectory(fullPath);
      continue;
    }

    if (!EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    const original = await fs.readFile(fullPath, "utf8");
    const cleaned = cleanContent(original);

    if (cleaned !== original) {
      await fs.writeFile(fullPath, cleaned, "utf8");
      console.log(`✓ Nettoyé : ${path.relative(ROOT, fullPath)}`);
    }
  }
}

async function cleanPackageJson() {
  const packagePath = path.join(ROOT, "package.json");

  if (!(await exists(packagePath))) {
    return;
  }

  const packageJson = JSON.parse(
    await fs.readFile(packagePath, "utf8")
  );

  let changed = false;

  for (const section of ["dependencies", "devDependencies"]) {
    if (packageJson[section]?.msw) {
      delete packageJson[section].msw;
      changed = true;
    }
  }

  if (changed) {
    await fs.writeFile(
      packagePath,
      JSON.stringify(packageJson, null, 2) + "\n",
      "utf8"
    );

    console.log("✓ Retiré : msw de package.json");
  }
}

async function main() {
  console.log("\n=== Suppression complète de MSW ===\n");

  await removeMocks();
  await processDirectory(ROOT);
  await cleanPackageJson();

  console.log("\n✓ MSW supprimé du projet.");
  console.log("✓ Dossiers mocks supprimés.");
  console.log("✓ Service worker supprimé.");
  console.log("✓ Références nettoyées.");
  console.log("\n⚠ Exécute ensuite : npm install\n");
}

main().catch((error) => {
  console.error("\n✗ Erreur :", error);
  process.exit(1);
});