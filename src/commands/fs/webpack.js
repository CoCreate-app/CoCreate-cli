const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = async function generateWebpackConfigs(repos, args) {
  console.log("Generating webpack configs for specified repositories...");

  if (!Array.isArray(repos) || repos.length === 0) {
    console.warn("No repositories specified.");
    return [];
  }

  const failed = [];

  for (const repo of repos) {
    if (!repo || typeof repo.path !== "string") {
      repo.error = "Invalid repository data provided";
      failed.push(repo);
      continue;
    }

    const result = updateWebpackConfigForModule(repo);
    if (!result) {
      repo.error = `${repo.path}/webpack.config.js`;
      failed.push(repo);
    } else {
      console.log(`Generated: ${repo.path}/webpack.config.js`);
    }
  }

  console.log(`\nWebpack config generation process finished.`);

  return failed;
};

function updateWebpackConfigForModule(repo) {
  try {
    repo.path = path.resolve(process.cwd(), repo.path);

    if (!fs.existsSync(repo.path) || !fs.lstatSync(repo.path).isDirectory()) {
      repo.error = `The path "${repo.path}" does not exist or is not a directory.`;
      return false;
    }

    const webpackPath = path.resolve(repo.path, "webpack.config.js");
    let name = path.basename(repo.path);

    if (!fs.existsSync(path.resolve(repo.path, repo.entry))) {
      repo.error = `Entry file ${repo.entry} does not exist in ${repo.path}`;
      return false;
    }

    let componentName = toCamelCase(name);
    if (componentName === componentName.toUpperCase()) {
      componentName = componentName.toLowerCase();
    } else {
      componentName = lowerCaseFirstChar(componentName);
    }

    let hasTemplate = false;
    if (fs.existsSync(path.resolve(repo.path, "./src/index.html"))) {
      hasTemplate = true;
    }
    let fileContent = `
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { EsbuildPlugin } = require("esbuild-loader");
const { FileUploader } = require("@cocreate/webpack");
${
  hasTemplate ? 'const HtmlWebpackPlugin = require("html-webpack-plugin");' : ""
}

module.exports = async (env, argv) => {
  const isProduction = argv && argv.mode === "production";
  const config = {
    entry: {
      "${name}": "${repo.entry}"
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "[name].min.js" : "[name]${
        hasTemplate ? ".[contenthash]" : ""
      }.js",
      libraryExport: "default",
      library: ["CoCreate", "${componentName}"],
      clean: true
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: isProduction ? "[name].min.css" : "[name].css",
      }),
      new FileUploader(env, argv),
      ${
        hasTemplate
          ? `
      new HtmlWebpackPlugin({
        template: "./src/index.html"
      })
      `
          : ""
      }
    ],
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? "source-map" : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "esbuild-loader",
            options: {
              loader: "js",
              target: "es2017"
            }
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"]
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new EsbuildPlugin({
          target: "es2017",
          css: true
        })
      ],
      splitChunks: {
        cacheGroups: {
          defaultVendors: false
        },
      }
    },
    performance: {
      hints: isProduction ? "warning" : false
    }
  };
  return config;
};
`;
    fs.writeFileSync(webpackPath, fileContent);
    execSync(`npx prettier --write "${webpackPath}"`).toString();
    return true;
  } catch (error) {
    return false;
  }
}

function toCamelCase(str) {
  let index = 0;
  str = str.replace(/^CoCreate-/, "");
  do {
    index = str.indexOf("-", index);
    if (index !== -1) {
      let t = str.substring(0, index);
      if (
        index + 1 < str.length &&
        str[index + 1] >= "a" &&
        str[index + 1] <= "z"
      ) {
        t += String.fromCharCode(str.charCodeAt(index + 1) - 32);
        t += str.substring(index + 2);
        str = t;
      } else if (index + 1 < str.length) {
        t += str.substring(index + 1);
        str = t;
      } else {
        str = t;
      }
    } else break;
  } while (true);
  return str;
}

function lowerCaseFirstChar(str) {
  if (!str) return str;
  if (str.charCodeAt(0) >= 65 && str.charCodeAt(0) <= 90) {
    return String.fromCharCode(str.charCodeAt(0) + 32) + str.substring(1);
  }
  return str;
}
