const path = require("path");
const fs = require("fs");
const spawn = require("./spawn");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const { color } = require("./fonts");

module.exports = async function execute(command, repos = [], config) {
	let failed = [];
	let args = command.replaceAll("'", '"').trim().split(" ");
	let type = args[0];
	args.shift();

	let predefined = path.resolve(__dirname, "commands", type + ".js");

	if (fs.existsSync(predefined)) {
		failed = require(predefined)(repos, args);
	} else {
		for (let repo of repos) {
			try {
				if (repo.exclude && repo.exclude.includes(type)) continue;
				console.log(
					color.green + `${repo.name}: ` + color.reset,
					command
				);
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
					repo.des = "command failed: " + command;
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
	}

	return failed;
};
