const path = require("path");
const fs = require("fs");
const spawn = require("./spawn");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const { getConfig } = require("./getConfig");

const { color } = require("./fonts");

module.exports = async function execute(command, config) {
	let failed = [];
	let [filename, ...args] = command.replaceAll("'", '"').trim().split(" ");

	let type;

	if (filename.endsWith(".js")) {
		type = filename.slice(0, -3);
	} else {
		type = filename;
		filename += ".js";
	}

	let predefined = path.resolve(__dirname, "commands", filename);
	let isPredefined = fs.existsSync(predefined);
	let repositories = [];

	for (let repo of config.repositories || []) {
		try {
			if (
				repo.exclude &&
				(repo.exclude.includes(type) || repo.exclude.includes(filename))
			) {
				continue;
			}

			const packageJsonPath = path.resolve(repo.path, "package.json");
			const packageObj = require(packageJsonPath);
			repo.entry = packageObj.main;

			if (isPredefined) {
				repositories.push(repo);
				continue;
			}

			console.log(color.green + `${repo.name}: ` + color.reset, command);
			let exitCode;
			if (config.hideMessage) {
				const { error } = await exec(command, {
					cwd: repo.absolutePath
				});

				if (error) exitCode = 1;
			} else {
				exitCode = await spawn(type, args, {
					cwd: repo.absolutePath,
					shell: true,
					stdio: "inherit"
				});
			}

			if (exitCode !== 0) {
				repo.error = "command failed: " + command;
				failed.push(repo);
			}
		} catch (err) {
			console.error(
				color.red +
					`an error occured executing command in ${repo.name} repository` +
					color.reset,
				err.message
			);
		}
	}

	if (isPredefined) {
		failed = await require(predefined)(repositories, args);
	}

	return failed;
};
