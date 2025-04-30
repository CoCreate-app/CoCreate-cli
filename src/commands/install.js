const addMeta = require("../addMeta");

module.exports = async function (repos, args) {
	let failed = [];
	try {
		let cloneFailed = await require("./clone.js")(repos, args);
		if (cloneFailed) failed.push(cloneFailed);

		repos = await addMeta(repos, failed);

		let symlinkFailed = await require("./symlink.js")(repos, args);
		if (symlinkFailed) failed.push(symlinkFailed);

		let linkFailed = await require("./link.js")(repos, args);
		if (linkFailed) failed.push(linkFailed);
	} catch (err) {
		console.error(err);
		failed.push({ name: "general", error: err.message });
	}
	return failed;
};
