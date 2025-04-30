// Import necessary modules
let fs = require("fs"); // File system module
const path = require("path"); // Path module for handling file paths
const util = require("node:util"); // Utility module for different helper functions
const exec = util.promisify(require("node:child_process").exec); // Promisified version of exec
const createSpinner = require("../spinner"); // Import custom spinner module

// Initialize variables to use throughout the module update process
let pathList = [], // Array to store paths to package.json files
	item = {}, // Object to store the latest versions of modules
	failed = []; // Array to track any failures that occur

let promiseMap = new Map(); // A map to cache promises for fetching versions

/**
 * Updates module versions across multiple repositories.
 * @param {Array} repos - An array of repository objects containing `absolutePath`.
 * @param {Object} args - Additional arguments for the update process (not used here but passed for potential future use).
 * @returns {Promise<Array>} - Resolves with the list of failed update attempts.
 */
module.exports = async function update(repos, args) {
	pathList = repos.map((o) => path.resolve(o.absolutePath, "package.json"));

	// Start a spinner to indicate progress
	const spinner = createSpinner({
		prefix: "Waiting for all versions to be fetched"
	});

	// Trigger version fetching for each package.json path
	for (let filePath of pathList) {
		getVersions(filePath);
	}

	// Await the resolution of all version fetching promises
	await Promise.all(promiseMap.values());

	// Populate the 'item' object with fetched versions
	for (let [key, promise] of promiseMap) {
		const version = await promise;
		if (version) {
			item[key] = `^${version}`;
		}
	}

	// End spinner as fetching process is complete
	spinner.end();

	// Update each package.json with new version data
	for (let filePath of pathList) {
		updateVersion(filePath);
	}

	console.log("Completed updating modules to their latest versions.");
	return failed;
};

/**
 * Fetches the latest versions of dependencies listed in a package.json file.
 * @param {string} filePath - The path to the package.json file.
 */
function getVersions(filePath) {
	if (fs.existsSync(filePath)) {
		let object = require(filePath); // Load JSON content
		const dependencies = object.dependencies || {}; // Current dependencies
		const devDependencies = object.devDependencies || {}; // Current devDependencies
		const allDependencies = { ...dependencies, ...devDependencies }; // Combine both

		// Iterate over each dependency
		for (const key of Object.keys(allDependencies)) {
			// Check and process only @cocreate/ prefixed packages
			if (key.startsWith("@cocreate/") && !promiseMap.has(key)) {
				const promise = exec(`npm view ${key} version`)
					.then((versionObj) => versionObj.stdout.trim())
					.catch((error) => {
						failed.push({ name: key, error: error.message });
						console.error(
							`Failed fetching version for ${key}: ${error.message}`
						);
						return null;
					});
				promiseMap.set(key, promise);
			}
		}
	} else {
		const errorMessage = `Path doesn't exist: ${filePath}`;
		failed.push({
			name: "get version",
			error: errorMessage
		});
		console.error(errorMessage);
	}
}

/**
 * Updates the package.json file with the latest module versions.
 * @param {string} filePath - The path to the package.json file.
 */
function updateVersion(filePath) {
	if (fs.existsSync(filePath)) {
		delete require.cache[require.resolve(filePath)];
		const object = require(filePath);

		if (object) {
			const dependencies = object.dependencies || {};
			const devDependencies = object.devDependencies || {};
			const allDependencies = { ...dependencies, ...devDependencies };

			let updated = false;
			let newObject = { ...object };

			for (let key of Object.keys(allDependencies)) {
				if (!key.startsWith("@cocreate/")) continue;
				const currentVersion = allDependencies[key];
				const latestVersion = item[key];

				if (latestVersion && latestVersion !== currentVersion) {
					if (dependencies[key]) {
						newObject.dependencies[key] = latestVersion;
					}
					if (devDependencies[key]) {
						newObject.devDependencies[key] = latestVersion;
					}

					updated = true;
					console.log(
						`Updated ${key} from ${currentVersion} to ${latestVersion}.`
					);
				} else {
					if (latestVersion === null) {
						console.log(
							`Could not update ${key}: Failed to fetch the latest version.`
						);
					} else {
						console.log(
							`Skipped updating ${key}, already at the latest version: ${currentVersion}.`
						);
					}
				}
			}

			if (updated) {
				fs.writeFileSync(filePath, JSON.stringify(newObject, null, 2));
				console.log(`Updated ${filePath} successfully.`);
			}
		}
	} else {
		const errorMessage = `Path doesn't exist: ${filePath}`;
		failed.push({
			name: "update version",
			error: errorMessage
		});
		console.error(errorMessage);
	}
}
