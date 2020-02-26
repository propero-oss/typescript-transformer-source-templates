import options from "./rollup.config";
import { Configuration as BaseConf, EnvironmentPlugin } from "webpack";
import { Configuration as DevServerConf } from "webpack-dev-server";
import { resolve } from "path";
import { config as dotenv } from "dotenv-flow";
const { parsed } = dotenv();

type Configuration = BaseConf & DevServerConf;

const abs = (path: string) => resolve(__dirname, path);

const config: Configuration = {
  entry: abs("src/dev-entry.ts"),
  devtool: "eval-source-map",
  devServer: {
    contentBase: abs("build/www")
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js" // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  module: {
    rules: [
      {
        test: /dev-entry\.ts/,
        use: [
          {
            loader: "webpack-rollup-loader",
            options
          }
        ]
      }
    ]
  },
  plugins: [new EnvironmentPlugin(parsed!)]
};

export default config;
