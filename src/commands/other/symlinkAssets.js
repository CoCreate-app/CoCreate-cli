const fs = require('fs')

function createSymlink(dir, dest){
    if (!fs.existsSync(dir)) {
        console.log('does not exist')
        return
    } 

    if (fs.existsSync(dest))
        fs.unlinkSync(dest)

    fs.symlink( dir, dest, 'dir', (err) => {
        if (err)
          console.log(err);
        else {
          console.log("symlink added");
        }    
    })

}


// createSymlink('./assets', '../../assets')
createSymlink('./manifest.webmanifest', '../../manifest.webmanifest')
createSymlink('./sw.js', '../../sw.js')
createSymlink('./offline.html', '../../offline.html')