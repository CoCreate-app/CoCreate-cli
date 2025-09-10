const fs = require("fs");
const path = require("path");

async function getConfig(directory, filename = "") {
	let configPath = findClosestConfig(directory, "CoCreate.config.js");
	if (configPath) {
		let config = require(configPath);
		config.configPath = configPath;
		config.filePath = path.resolve(directory, filename);
		return config;
	} else {
		console.log("No CoCreate.config file found in parent directories.");
	}
}

function findClosestConfig(directory, filename) {
	let currentDir = directory;

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
