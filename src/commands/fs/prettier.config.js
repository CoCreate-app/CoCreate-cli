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
  const fileContent = `module.exports = {
        tabWidth: 4,
        semi: true,
        trailingComma: "none",
        bracketSameLine: true,
        useTabs: true,
        overrides: [
            {
                files: ["*.json", "*.yml", "*.yaml"],
                options: {
                    tabWidth: 2,
                    useTabs: false
                },
            }
        ],  
    };`;

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
const fileName = "prettier.config.js";

// Execute directory search and create/update file if the directory exists
directories.forEach((directory) => {
  findDirectories(directory, createOrUpdateFile, fileName);
});

console.log("Finished");
