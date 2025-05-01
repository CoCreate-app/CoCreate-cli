#!/usr/bin/env node

// Import necessary modules for path operations, file system operations, and more
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const execute = require("./execute");
const addMeta = require("./addMeta");
const { color } = require("./fonts");

// Configuration object for storing options
let config = {};

// Extract arguments from the command line input
const argv = process.argv.slice(2);

// Define available command-line options
const options = ["-self"];

// Iterate over available options and set configurations if specified in argv
for (let option of options) {
	if (argv.includes(option)) {
		config[option.replace(/^--/, "")] = true;
		const index = argv.indexOf(option);
		delete argv[index];
	}
}

// Format command from argv, handling spaces and quotes
command = argv
	.map((part) => (part.match(/ |'|"/) ? `'${part.replace(/'/, "'")}'` : part))
	.join(" ");

/**
 * Load repository configuration from the given path.
 * @param {string} path - The file path to load repository config from.
 * @returns {Array} - List of repositories.
 */
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

/**
 * Main function to execute commands across repositories.
 * @param {Object} config - The configuration object.
 * @param {Array} [repos=null] - List of repositories to process.
 * @param {string} [directory=null] - The directory path of the configuration.
 */
async function main(config = {}, repos = null, directory = null) {
	if (!repos) {
		// Determine repositories and configuration file paths
		const currentRepoPath = path.resolve(
			process.cwd(),
			"CoCreate.config.js"
		);
		const packageJsonPath = path.resolve(process.cwd(), "package.json");

		// Load repositories from specified config file
		if (config["c"] && fs.existsSync(config["c"])) {
			repos = getRepositories(config["c"]);
			directory = path.dirname(config["c"]);
			console.warn(
				`${color.yellow}using ${config["c"]} configuration${color.reset}`
			);
		}
		// Load repositories from default CoCreate.config.js if exists
		else if (!config["self"] && fs.existsSync(currentRepoPath)) {
			repos = getRepositories(currentRepoPath);
			directory = path.dirname(currentRepoPath);
			console.warn(
				`${color.yellow}using ${currentRepoPath} configuration${color.reset}`
			);
		}
		// If package.json exists, load repository details from it
		else if (fs.existsSync(packageJsonPath)) {
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
		}
		// Error if no configuration can be found
		else {
			console.error(
				`${color.red}a configuration file cannot be found${color.reset}`
			);
			process.exit(1);
		}
	}

	// Set default config values
	config = { hideMessage: false, ...config };

	// Add metadata to repos if any are present
	if (repos && repos.length) repos = await addMeta(repos, [], directory);

	// Execute the command across repositories
	const failed = await execute(command, repos, config);

	// Handle any failed command executions
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

		// Prompt user to retry failed commands
		await promptRetry(failed, config, directory);
	}
}

/**
 * Prompt the user to retry failed commands.
 * @param {Array} failed - List of failed commands.
 * @param {Object} config - Configuration object.
 * @param {string} directory - Path of the configuration directory.
 */
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

// Call the main function with initial configuration
main(config);
