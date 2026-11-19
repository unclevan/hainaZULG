import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = path.join(root, "dist");
const sccBuild = path.join(root, "scc-web", "dist");
const basePath = `/${(process.env.DEMO_BASE_PATH ?? "").split("/").filter(Boolean).join("/")}/`.replace(/^\/\/$/, "/");

await access(path.join(sccBuild, "index.html"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(sccBuild, path.join(output, "scc"), { recursive: true });
const home = await readFile(path.join(root, "demo", "index.html"), "utf8");
await writeFile(path.join(output, "index.html"), home.replaceAll("{{BASE}}", basePath));

const placeholder = await readFile(path.join(root, "demo", "coming-soon.html"), "utf8");
for (const [slug, name, english] of [
  ["psi", "进销存管理", "Purchasing, Sales and Inventory"],
  ["pay", "支付服务", "Payment Service"]
]) {
  const directory = path.join(output, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), placeholder.replaceAll("{{NAME}}", name).replaceAll("{{ENGLISH}}", english).replaceAll("{{BASE}}", basePath));
}

console.info(`Demo output: ${basePath}, ${basePath}scc/, ${basePath}psi/, ${basePath}pay/`);
