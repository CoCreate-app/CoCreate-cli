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


symlink('./dist/service-worker.js', '../../service-worker.js', 'file')
// symlink('./dist/service-worker.js', '../../CoCreate-admin/src/service-worker.js', 'file')
// symlink('./dist/service-worker.js', '../../CoCreate-website/src/service-worker.js', 'file')

symlink('./demo/offline.html', '../../offline.html', 'file')
// symlink('./demo/offline.html', '../../CoCreate-admin/src/offline.html', 'file')
// symlink('./demo/offline.html', '../../CoCreate-website/src/offline.html', 'file')

symlink('./demo/manifest.webmanifest', '../../manifest.webmanifest', 'file')
// symlink('./demo/manifest.webmanifest', '../../CoCreate-admin/src/manifest.webmanifest', 'file')
// symlink('./demo/manifest.webmanifest', '../../CoCreate-website/src/manifest.webmanifest', 'file')

// symlink('./demo/manifest-assets', '../../manifest-assets', 'dir')
// symlink('./demo/manifest-assets', '../../CoCreate-admin/manifest-assets', 'dir')
// symlink('./demo/manifest-assets', '../../CoCreate-website/manifest-assets', 'dir')
