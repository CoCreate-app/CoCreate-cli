const fs = require("fs");
const path = require("path");

module.exports = async function (repos, args) {
    try {
        if (args.length < 2) {
            console.error("Please provide both source and destination paths.");
            return;
        }

        const srcPath = path.resolve(process.cwd(), args[0]);
        const destPath = path.resolve(process.cwd(), args[1]);

        if (!fs.existsSync(srcPath)) {
            console.error(`Source path does not exist: ${srcPath}`);
            return;
        }

        try {
            // Always remove the destination entry if it exists
            if (fs.existsSync(destPath)) {
                await fs.promises.rm(destPath, { recursive: true, force: true });
            }

            // Create a symlink for the directory
            await fs.promises.symlink(srcPath, destPath, "dir");
            console.log(`Directory symlink created: ${srcPath} -> ${destPath}`);
        } catch (err) {
            console.error(`Failed to create symlink for ${srcPath}:`, err);
        }

        console.log("Symlinking complete.");
    } catch (err) {
        console.error("Error during symlinking process:", err);
    }
};
