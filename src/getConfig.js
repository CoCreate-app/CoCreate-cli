const fs = require("fs");
const path = require("path");

async function getConfig(directory, filename = "CoCreate.config.js") {
	let config;
	const filePath = path.resolve(directory, filename);
	if (!filePath.includes("node_modules/")) {
		const configPath = findClosestConfig(filePath, "CoCreate.config.js");
		if (configPath) {
			config = require(configPath);
			config.configPath = configPath;
			config.filePath = filePath;
		} else {
			console.log("No CoCreate.config file found in parent directories.");
		}
	}

	return config;
}

function findClosestConfig(filePath, filename) {
	let currentDir = filePath;

	while (currentDir !== "/" && currentDir !== ".") {
		let configFile = path.join(currentDir, filename);

		if (fs.existsSync(configFile)) {
			return configFile;
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
}

module.exports = { getConfig, findClosestConfig };
