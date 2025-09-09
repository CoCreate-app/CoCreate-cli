const file = require("@cocreate/file");
const path = require("path");
const fs = require("fs");
const { getConfig } = require("../getConfig");
const translate = require("./other/translate");

module.exports = async function upload(directory, args) {
	if (args && !Array.isArray(args)) args = [args];

	let isWatch = false;
	let translateFn = null;

	if (args && (args.includes("-t") || args.includes("--translate"))) {
		translateFn = translate;
		args = args.filter((arg) => arg !== "-t" && arg !== "--translate");
	}

	if (directory && typeof directory === "string") {
		if (["-w", "--watch"].includes(directory)) {
			isWatch = true;
		}
	}

	directory = process.cwd();

	if (
		isWatch ||
		(args && (args.includes("-w") || args.includes("--watch")))
	) {
		for (let i = 0; i < args.length; i++) {
			if (args[i].startsWith("-")) continue;
			else if (path.isAbsolute(args[i])) directory = args[i];
			else directory = path.resolve(directory, args[i]);
		}

		console.log("Watching: ", directory);
		fs.watch(
			directory,
			{ recursive: true },
			async (eventType, filename) => {
				if (!filename.includes("CoCreate.config.js")) {
					const config = await getConfig(directory, filename);
					if (config.configPath) {
						await file(config, config.configPath, config.filePath, {
							translate: translateFn
						});
					} else {
						console.log(
							"Failed to read or parse CoCreate.config.js."
						);
					}
				}
			}
		);
	} else {
		if (!args || !args.length) {
			const CoCreateConfig = await getConfig(directory);
			if (CoCreateConfig.configPath) {
				await file(
					CoCreateConfig,
					CoCreateConfig.configPath,
					CoCreateConfig.filePath,
					{ translate: translateFn }
				);
			} else {
				console.log("Failed to read or parse CoCreate.config.js.");
			}
		} else {
			for (let arg of args) {
				arg = path.resolve(directory, arg);
				let CoCreateConfig;

				try {
					CoCreateConfig = JSON.parse(arg);
				} catch (error) {}

				if (!CoCreateConfig) {
					CoCreateConfig = await getConfig(arg);
					if (CoCreateConfig.configPath) {
						await file(
							CoCreateConfig,
							CoCreateConfig.configPath,
							CoCreateConfig.filePath,
							{ translate: translateFn }
						);
					} else {
						console.log(
							"Failed to read or parse CoCreate.config.js."
						);
					}
				}
			}
		}
	}
};
