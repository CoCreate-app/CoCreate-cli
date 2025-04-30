const spawn = require("../spawn");
const path = require("path");
let fs = require("fs");

module.exports = async function gitClone(repos, args) {
	const failed = [];
	const cwdPath = path.resolve(process.cwd());

	for (let i = 0; i < repos.length; i++) {
		// TODO: Check if path exist and if git.config or package.json  exist continue
		if (cwdPath !== repos[i].absolutePath) {
			if (!fs.existsSync(repos[i].directory))
				fs.mkdirSync(repos[i].directory);

			if (
				!repos[i].repo.startsWith("http://") &&
				!repos[i].repo.startsWith("https://")
			)
				repos[i].repo = "https://" + repos[i].repo;

			let exitCode = await spawn("git", ["clone", `${repos[i].repo}`], {
				stdio: "inherit",
				cwd: repos[i].directory
			});
			if (exitCode !== 0) {
				failed.push({ name: repos[i].name, error: `cloning failed` });
			}
		}
	}

	return failed;
};
