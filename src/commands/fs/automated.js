const fs = require("fs");
const path = require("path");

function findDirectories(startPath, callback, fileName) {
  // Resolve relative paths to absolute paths if needed
  const resolvedPath =
    startPath.startsWith("./") || startPath.startsWith("../")
      ? path.resolve(startPath)
      : startPath;

  const segments = resolvedPath.split("/"); // Split path by '/'
  let currentPath = "/"; // Start from root

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isWildcard = segment === "*";

    if (isWildcard) {
      // Get all directories at this level
      const directories = fs
        .readdirSync(currentPath)
        .filter((file) =>
          fs.statSync(path.join(currentPath, file)).isDirectory()
        );

      // Process each directory and continue along the path
      directories.forEach((dir) => {
        findDirectories(
          path.join(currentPath, dir, ...segments.slice(i + 1)),
          callback,
          fileName
        );
      });
      return; // Stop further processing in the loop for wildcard case
    } else {
      // Continue to the next part of the path
      currentPath = path.join(currentPath, segment);

      // If a segment doesn’t exist or isn’t a directory, log an error and stop
      if (
        !fs.existsSync(currentPath) ||
        !fs.statSync(currentPath).isDirectory()
      ) {
        console.log(`Directory not found: ${currentPath}`);
        return;
      }
    }
  }

  // If we reach the end of the path without wildcards, we have a valid directory
  callback(currentPath, fileName);
}

function createOrUpdateFile(directoryPath, fileName) {
  let buildStep = `- name: Build\n        run: yarn build`;

  // Check if webpack config exists to include build step
  const webpackPath = filePath.replace(fileName, "webpack.config.js");
  if (!fs.existsSync(webpackPath)) buildStep = "";

  // Define file content (e.g., for YAML or other configuration)
  const fileContent = `name: Automated Workflow
on:
  push:
    branches:
      - master
jobs:
  about:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Jaid/action-sync-node-meta
        uses: jaid/action-sync-node-meta@v1.4.0
        with:
          direction: overwrite-github
          githubToken: "\${{ secrets.GITHUB }}"
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 14
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v3
        id: semantic
        with:
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/git
            @semantic-release/github
        env:
          GITHUB_TOKEN: "\${{ secrets.GITHUB }}"
          NPM_TOKEN: "\${{ secrets.NPM_TOKEN }}"
    outputs:
      new_release_published: "\${{ steps.semantic.outputs.new_release_published }}"
      new_release_version: "\${{ steps.semantic.outputs.new_release_version }}"
  upload:
    runs-on: ubuntu-latest
    needs: release
    if: needs.release.outputs.new_release_published == 'true'
    env:
      VERSION: "\${{ needs.release.outputs.new_release_version }}"
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Set npm registry auth
        run: echo "//registry.npmjs.org/:_authToken=\${{ secrets.NPM_TOKEN }}" > ~/.npmrc
      - name: Install dependencies
        run: yarn install
      ${buildStep}
      - name: Set Environment Variables
        run: |
          echo "organization_id=\${{ secrets.COCREATE_ORGANIZATION_ID }}" >> $GITHUB_ENV
          echo "key=\${{ secrets.COCREATE_KEY }}" >> $GITHUB_ENV
          echo "host=\${{ secrets.COCREATE_HOST }}" >> $GITHUB_ENV
      - name: CoCreate Upload
        run: coc upload
`;

  const filePath = path.join(directoryPath, fileName);
  // Create or update the file
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  fs.writeFileSync(filePath, fileContent);
}

// Define the directories with wildcards
const directories = [
  "../../../../../CoCreate-modules/*/",
  "../../../../../CoCreate-apps/*/",
  "../../../../../CoCreate-plugins/*/",
  "../../../../../CoCreateCSS/",
  "../../../../../CoCreateJS/",
  "../../../../../CoCreateWS/",
  "../../../../../YellowOracle/",
  "../../../../../CoCreate-website/",
  "../../../../../CoCreate-admin/",
  "../../../../../CoCreate-website-old/",
  "../../../../../CoCreate-superadmin/",
];
const fileName = "automated.yml";

// Execute directory search and create/update file if the directory exists
directories.forEach((directory) => {
  findDirectories(directory, createOrUpdateFile, fileName);
});

console.log("Finished");
