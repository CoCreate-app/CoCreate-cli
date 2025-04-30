const fs = require("fs");
const path = require("path");
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);

module.exports = async function addMeta(repos, failed, directory) {
	let packageManager;
	for (let i = 0; i < repos.length; i++) {
		repos[i].name = path.basename(repos[i].path);
		repos[i].plainName = repos[i].name.substring(9);

		if (directory) {
			repos[i].absolutePath = path.resolve(directory, repos[i].path);
			const parsedPath = path.parse(repos[i].absolutePath);
			repos[i].directory = parsedPath.dir;
		}

		let packagejson = path.resolve(repos[i].absolutePath, "package.json");
		if (!fs.existsSync(packagejson)) {
			console.error("package json not found for", repos[i].name);
			failed.push({
				name: repos[i].name,
				error: "package json not found"
			});
		} else {
			let packageObj;
			try {
				packageObj = require(packagejson);
			} catch (err) {
				console.error("packageObj", err.message);
			}

			repos[i].packageName = packageObj.name;

			repos[i].deps = Object.keys(
				packageObj["dependencies"] || {}
			).filter((packageName) => packageName.startsWith("@cocreate/"));
			repos[i].devDeps = Object.keys(
				packageObj["devDependencies"] || {}
			).filter((packageName) => packageName.startsWith("@cocreate/"));

			if (!repos[i].packageManager) {
				if (packageManager) repos[i].packageManager = packageManager;
				else {
					repos[i].packageManager = "npm";
					let lockFile = path.resolve(
						repos[i].absolutePath,
						"package-lock.json"
					);
					if (!fs.existsSync(lockFile)) {
						lockFile = path.resolve(
							repos[i].absolutePath,
							"pnpm-lock.yaml"
						);
						if (fs.existsSync(lockFile))
							repos[i].packageManager = "pnpm";
						else {
							lockFile = path.resolve(
								repos[i].absolutePath,
								"yarn.lock"
							);
							if (fs.existsSync(lockFile))
								repos[i].packageManager = "yarn";
							else {
								try {
									const { error } = await exec(
										"yarn --version"
									);
									if (!error)
										repos[i].packageManager = "yarn";
								} catch (e) {}
							}
						}
						packageManager = repos[i].packageManager;
					}
				}
			}
		}
	}

	return repos;
};
