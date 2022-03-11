let glob = require("glob");
let fs = require('fs');
const prettier = require("prettier");
const path = require("path")

function globUpdater(er, files) {

  if (er)
    console.log(files, 'glob resolving issue')
  else
    files.forEach(filename => {

      console.log(filename + '/manual.yml', 'glob resolving issue')
      update(filename + '/manual.yml')
    })

}




function update(YmlPath) {
  // component name
  let name = path.basename(path.resolve(path.dirname(YmlPath), '../..')).substr(9);
  let fileContent = `name: Manual Workflow
on:
  workflow_dispatch:
    inputs:
      invalidations:
        description: |
          If set to 'true', invalidates previous upload.
        default: 'true'
        required: true

jobs:
  cdn:
    runs-on: ubuntu-latest
    env:
      DRY_RUN: \${{ github.event.inputs.dry_run }}
      GITHUB_TOKEN: '\${{ secrets.GITHUB_TOKEN }}'
      NPM_TOKEN: '\${{ secrets.NPM_TOKEN }}'

    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: setup nodejs
        uses: actions/setup-node@v2
        with:
          node-version: 14.15.4
      - name: yarn install
        run: >
          echo "//registry.npmjs.org/:_authToken=\${{ secrets.NPM_TOKEN }}" >
          .npmrc

          yarn install
      - name: yarn build
        run: yarn build
      - name: upload latest bundle
        uses: CoCreate-app/CoCreate-s3@master
        with:
          aws-key-id: '\${{ secrets.AWSACCESSKEYID }}'
          aws-access-key: '\${{ secrets.AWSSECERTACCESSKEY }}'
          distributionId: '\${{ secrets.DISTRIBUTION_ID }}'
          bucket: testcrudbucket
          source: ./dist
          destination: /${name}/latest
          acl: public-read
          invalidations: \${{ github.event.inputs.invalidations }}

`;
  let formated = prettier.format(fileContent, { semi: false, parser: "yaml" });
  // console.log(fileContent);
  // process.exit()
  if (fs.existsSync(YmlPath))
  fs.unlinkSync(YmlPath)
  fs.writeFileSync(YmlPath, formated)

}



// glob("../CoCreate-components/CoCreate-action/.github/workflows", globUpdater)
glob("../CoCreate-components/*/.github/workflows/", globUpdater)
glob("../CoCreate-apps/*/.github/workflows/", globUpdater)
glob("../CoCreate-plugins/*/.github/workflows/", globUpdater)

// substrin (9) removes CoCreateC leving namme as SS
// glob("../CoCreateCSS/.github/workflows/", globUpdater)

// does not need to add name... will require for name to be removed from destination
// glob("../CoCreateJS/.github/workflows/", globUpdater)

console.log('finished')
