async function updateModules() {

    let data = await CoCreate.crud.readDocument({
        collection: ['modules'],
    })

    if (data && data.document && data.document.length) {
        for (let document of data.document) {
            let isUpdateable = false
            if (document.icon) {
                console.log(document.icon)
                let name = document.icon
                if (name.includes('fa fa-'))
                    name = name.substring(16).replace('"></i>', "")
                else
                    name = name.substring(17).replace('"></i>', "")
                console.log(name)
                if (name) {
                    document.icon = name
                    let updateDocument = await CoCreate.crud.updateDocument({
                        collection: ['modules'],  
                        document
                    })
                    console.log(updateDocument)
                    
                }
            }
            // let keys = ['navbar-menu-primary', 'navbar-menu-secondary', 'main-menu-primary', 'main-menu-secondary', 'settings-menu-primary', 'settings-menu-secondary']
            // for (let key of keys) {
            //     if (document[key] && document[key].path) {
            //         let parts = document[key].path.split('/')
            //         let name = parts.pop() 
            //         let parentDirectory = parts.pop()
            //         if (!name)
            //             continue
            //         console.log(name, parentDirectory)
            //         document[key].name = name
            //         document[key].parentDirectory = parentDirectory || ''
            //         isUpdateable = true
            //     }
            // }
            // if (isUpdateable) {
            //     let updateDocument = await CoCreate.crud.updateDocument({
            //         collection: ['modules'],  
            //         document
            //     })
            //     console.log(updateDocument)
            // }
        }
    }
}