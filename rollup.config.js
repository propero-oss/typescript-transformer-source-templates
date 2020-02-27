import sourcemaps from "rollup-plugin-sourcemaps";
import commonjs from "rollup-plugin-commonjs";
import ts from "@wessberg/rollup-plugin-ts";
import paths from "rollup-plugin-ts-paths";
import apiExtractor from "@rocketbase/rollup-plugin-api-extractor";
import execute from "@rocketbase/rollup-plugin-exec";
import sequential from "@rocketbase/rollup-plugin-sequential";
import nodeResolve from "rollup-plugin-node-resolve";
import { keys, mapValues, upperFirst, camelCase, template } from "lodash";
import pkg from "./package.json";
import { basename } from "path";

const { main, dependencies, module, unpkg, types } = pkg;
const formatModule = name => upperFirst(camelCase(name.indexOf("@") !== -1 ? name.split("/")[1] : name));
const yearRange = date => (new Date().getFullYear() === +date ? date : `${date} - ${new Date().getFullYear()}`);
const year = yearRange(pkg.since || new Date().getFullYear());
const external = keys(dependencies || {});
const globals = mapValues(dependencies || {}, (value, key) => formatModule(key));
const name = formatModule(pkg.name);
const banner = template(`
/**
 * <%= nameFormatted %> (<%= name %> v<%= version %>)
 * <%= description %>
 * <%= homepage %>
 * (c) <%= year %> <%= author %>
 * @license <%= license || "MIT" %>
 */
`)({ ...pkg, nameFormatted: name, year }).trim();

const outputs = [
  { format: "cjs", file: main },
  { format: "umd", file: unpkg },
  { format: "esm", file: module }
];

export default {
  input: "src/main.ts",
  output: outputs.map(({ format, file }) => ({
    exports: "named",
    sourceMap: true,
    file,
    format,
    globals,
    name,
    banner
  })),
  external,
  plugins: [
    sourcemaps(),
    paths(),
    commonjs(),
    nodeResolve(),
    ts({ tsconfig: "tsconfig.build.json" }),
    sequential(
      [
        apiExtractor({
          config: "build/api-extractor.json",
          override: { name: basename(unpkg, ".js"), types },
          cleanup: false
        }),
        execute(["api-documenter markdown --output-folder docs --input-folder dist", "rimraf temp api-extractor.json dist/*.*.d.ts"], {
          stdio: "ignore"
        })
      ],
      { once: true }
    )
  ]
};
