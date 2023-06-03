const fs = require('fs')
const path = require('path')

function symlink(dir, dest, option) {
    if (!fs.existsSync(dir)) {
        return console.log(dir, 'does not exist')
    } else
        dir = path.resolve(dir)

    if (fs.existsSync(dest))
        fs.rm(dest, { recursive: true, force: true }, function (err) {
            if (err) {
                console.log('failed');
            }
            createSymlink(dir, dest, option)
        });
    else
        createSymlink(dir, dest, option)
}

function createSymlink(dir, dest, option) {
    dest = path.resolve(dest)

    fs.symlink(dir, dest, option, (err) => {
        console.log(dir, dest, option)
        if (err)
            console.log(err);
        else {
            console.log("symlink added");
        }

    })

}

symlink('./src/assets', '../assets', 'dir')
symlink('./src/manifest.webmanifest', '../manifest.webmanifest', 'file')
symlink('./src/sw.js', '../sw.js', 'file')
symlink('./src/offline.html', '../offline.html', 'file')