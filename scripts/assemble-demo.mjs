import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = path.join(root, "dist");
const sccBuild = path.join(root, "scc-web", "dist");

await access(path.join(sccBuild, "index.html"));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(sccBuild, path.join(output, "scc"), { recursive: true });
await cp(path.join(root, "demo", "index.html"), path.join(output, "index.html"));

const placeholder = await readFile(path.join(root, "demo", "coming-soon.html"), "utf8");
for (const [slug, name, english] of [
  ["psi", "进销存管理", "Purchasing, Sales and Inventory"],
  ["pay", "支付服务", "Payment Service"]
]) {
  const directory = path.join(output, slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), placeholder.replaceAll("{{NAME}}", name).replaceAll("{{ENGLISH}}", english));
}

console.info("Demo output: /, /scc/, /psi/, /pay/");
