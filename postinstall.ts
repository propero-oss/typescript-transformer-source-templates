import { exec as execOld } from "child_process";
import { promisify } from "util";
import { basename } from "path";
import { prompt, confirm } from "promptly";
import { promises as fs } from "fs";
import isCi from "is-ci";
const exec = promisify(execOld);
const run = (command: string) => exec(command, { encoding: "utf8", shell: true as any }).then(res => res.stdout);

const templateName = "ts-library-template";
const devDeps = ["@types/promptly", "@types/is-ci", "promptly", "is-ci"];

(async () => {
  const defaultName = basename(__dirname);
  if (isCi) return;
  const name = await prompt("name:", { default: defaultName === templateName ? undefined : defaultName });
  const webpack = await confirm("Do you need/want webpack? (Y/n)", { default: "y" });

  const pkg = await import("./package.json");
  pkg.name = name;
  delete (pkg.scripts as any).postinstall;
  delete pkg.homepage;
  delete pkg.bugs;
  delete pkg.repository;
  delete pkg.default; // es module interop thing
  devDeps.forEach(it => delete (pkg.devDependencies as any)[it]);

  if (!webpack) {
    await fs.unlink("./webpack.config.ts");
    Object.keys(pkg.devDependencies)
      .filter(key => key.includes("webpack"))
      .forEach(it => delete (pkg.devDependencies as any)[it]);
  }

  await fs.writeFile("./package.json", JSON.stringify(pkg, null, 2));
  await run("npm init -y");
  await fs.unlink(__filename);
})().catch(ignored => ignored);
