const spawn = require('../spawn');
const path = require("path")
const { color } = require('../fonts');

module.exports = async (repos, args) => {
    const failed = [], isLinked = {};

    try {
        for (let repo of repos) {
            if (!repo) continue;
            if (repo.exclude && repo.exclude.includes('link'))
                continue

            if (process.cwd() === repo.absolutePath)
                continue

            if (repo.packageManager === 'npm') {
                let dir = path.resolve(process.cwd(), 'node_modules');
                let dest = path.resolve(path.resolve(repo.absolutePath), 'node_modules');
                if (dir && dest) {
                    if (fs.existsSync(dest))
                        await fs.promises.rm(dest, { recursive: true, force: true });

                    await fs.promises.symlink(dir, dest, 'dir');
                    console.log(repo.packageManager, 'link', repo.packageName)
                }
            } else {

                let exitCode = await spawn(repo.packageManager, ['link'], {
                    cwd: repo.absolutePath,
                    shell: true,
                    stdio: 'inherit'
                });

                if (exitCode !== 0) {
                    failed.push({
                        name: repo.name,
                        des: `${repo.packageManager} link failed`
                    })
                    console.error(color.red + `${repo.name}: ${repo.packageManager} link failed` + color.reset)
                } else {
                    console.log(repo.packageManager, 'link', repo.packageName)

                    let exitCode = await spawn(repo.packageManager, ['link', repo.packageName], {
                        cwd: process.cwd(),
                        shell: true,
                        stdio: 'inherit'
                    })
                    if (exitCode !== 0) {
                        failed.push({
                            name: repo.name,
                            des: `${repo.packageManager} link ${repo.packageName} failed`
                        });
                        console.error(color.red + `${repo.name}: ${repo.packageManager} link ${repo.packageName} failed` + color.reset)
                    }
                }

            }
        }

    }
    catch (err) {
        failed.push({ name: 'GENERAL', des: err.message })
        console.error(color.red + `${err}` + color.reset)
    }

    return failed;
}
