import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
const output = "dist";
if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const path of ["index.html", "favicon.svg", "styles.css"]) cpSync(path, output + "/" + path);
cpSync("src", output + "/src", { recursive: true });
writeFileSync(output + "/.nojekyll", "");
console.log("Static site ready in dist/");
