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
  let name = path
    .basename(path.resolve(path.dirname(directoryPath), "./"))
    .substring(9);
  let object = "";
  let replaceContent = fs.readFileSync(directoryPath).toString();

  // Parse content to extract `object`
  let content_source = replaceContent.substring(
    replaceContent.indexOf("sources")
  );
  let content1 = content_source.substring(content_source.indexOf("object"));
  let content2 = content1.substring(content1.indexOf(":"));
  object = content2.substring(3, content2.indexOf(",") - 4);

  let fileContent = `module.exports = {
    "config": {
        "organization_id": "5ff747727005da1c272740ab",
        "key": "2061acef-0451-4545-f754-60cf8160",
        "host": "general.cocreate.app"
    },
    
    "sources": [
        {
            "array": "files",
            "object": {
                "_id": "${object}",
                "name": "index.html",
                "path": "/docs/${name}",
                "pathname": "/docs/${name}/index.html",
                "src": "{{./docs/index.html}}",
                "host": [
                    "general.cocreate.app"
                ],
                "directory": "${name}",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        }
    ]
}
`;

  if (!object.length) {
    console.log("object Undefined: ", directoryPath);
  } else if (object.length !== 24) {
    console.log("object not valid! Please check your config: ", directoryPath);
  } else {
    const filePath = path.join(directoryPath, fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, fileContent);
  }
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
const fileName = "CoCreate.config.js";

// Execute directory search and create/update file if the directory exists
directories.forEach((directory) => {
  findDirectories(directory, createOrUpdateFile, fileName);
});

console.log("Finished");
