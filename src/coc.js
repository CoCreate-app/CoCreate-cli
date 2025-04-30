#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const execute = require("./execute");
const addMeta = require("./addMeta");
const { color } = require("./fonts");

let config = {};

const argv = process.argv.slice(2);
const options = ["-self"];
for (let option of options) {
	if (argv.includes(option)) {
		config[option.replace(/^--/, "")] = true;
		const index = argv.indexOf(option);
		delete argv[index];
	}
}

command = argv
	.map((part) =>
		part.match(/ |'|"/) ? `'${part.replace(/'/, "\\'")}'` : part
	)
	.join(" ");

function getRepositories(path) {
	try {
		const config = require(path);
		return config.repositories;
	} catch (err) {
		console.error(
			color.red + "cannot read repository file in" + color.reset,
			path,
			color.red + "error:" + color.reset,
			err.message
		);
		process.exit(1);
	}
}

async function main(config = {}, repos = null, directory = null) {
	if (!repos) {
		// Existing logic to determine repositories and configuration
		const currentRepoPath = path.resolve(
			process.cwd(),
			"CoCreate.config.js"
		);
		const packageJsonPath = path.resolve(process.cwd(), "package.json");

		if (config["c"] && fs.existsSync(config["c"])) {
			repos = getRepositories(config["c"]);
			directory = path.dirname(config["c"]);
			console.warn(
				`${color.yellow}using ${config["c"]} configuration${color.reset}`
			);
		} else if (!config["self"] && fs.existsSync(currentRepoPath)) {
			repos = getRepositories(currentRepoPath);
			directory = path.dirname(currentRepoPath);
			console.warn(
				`${color.yellow}using ${currentRepoPath} configuration${color.reset}`
			);
		} else if (fs.existsSync(packageJsonPath)) {
			const repoPath = path.resolve(process.cwd());
			const packageObj = require(packageJsonPath);
			const repoUrl =
				packageObj.repository &&
				packageObj.repository.url.substring(12);
			const repoEntry = packageObj.main;
			repos = [
				{
					path: repoPath,
					repo: repoUrl,
					entry: repoEntry
				}
			];
			directory = path.dirname(packageJsonPath);
			console.warn(
				`${color.yellow}using ${packageJsonPath} configuration${color.reset}`
			);
		} else {
			console.error(
				`${color.red}a configuration file cannot be found${color.reset}`
			);
			process.exit(1);
		}
	}

	config = { hideMessage: false, ...config };

	if (repos && repos.length) repos = await addMeta(repos, [], directory);

	const failed = await execute(command, repos, config);

	if (failed && failed.length > 0) {
		console.log(
			color.red +
				" **************** failures **************** " +
				color.reset
		);
		for (const failure of failed) {
			console.log(
				color.red + `${failure.name}: ${failure.error}` + color.reset
			);
		}

		await promptRetry(failed, config, directory);
	}
}

async function promptRetry(failed, config, directory) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.question(
		"Do you want to retry the failed commands? (yes/no): ",
		async (answer) => {
			rl.close();
			if (answer.toLowerCase() === "yes") {
				await main(config, failed, directory);
			} else {
				process.exit(0);
			}
		}
	);
}

main(config);
