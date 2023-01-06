let glob = require("glob");
let fs = require('fs');
const prettier = require("prettier");
const path = require("path")

function globUpdater(er, files) {

  if (er)
    console.log(files, 'glob resolving issue')
  else
    files.forEach(filename => {

      console.log(filename + '/automated.yml', 'glob resolving issue')
      update(filename + '/automated.yml')
    })

}




function update(YmlPath) {
  // component name
  let name = path.basename(path.resolve(path.dirname(YmlPath), '../..')).substr(9);
  let fileContent = `name: Automated Workflow
'on':
  push:
    branches:
      - master
jobs:
  about:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Jaid/action-sync-node-meta
        uses: jaid/action-sync-node-meta@v1.4.0
        with:
          direction: overwrite-github
          githubToken: '\${{ secrets.GITHUB }}'
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v3
        id: semantic
        with:
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/npm
            @semantic-release/git
            @semantic-release/github
        env:
          GITHUB_TOKEN: '\${{ secrets.GITHUB_TOKEN }}'
          NPM_TOKEN: '\${{ secrets.NPM_TOKEN }}'
    outputs:
      new_release_published: '\${{ steps.semantic.outputs.new_release_published }}'
      new_release_version: '\${{ steps.semantic.outputs.new_release_version }}'
  cdn:
    runs-on: ubuntu-latest
    needs: release
    if: needs.release.outputs.new_release_published == 'true'
    env:
      VERSION: '\${{ needs.release.outputs.new_release_version }}'
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
      - name: upload bundle as version
        uses: CoCreate-app/CoCreate-s3@master
        with:
          aws-key-id: '\${{ secrets.AWSACCESSKEYID }}'
          aws-access-key: '\${{ secrets.AWSSECERTACCESSKEY }}'
          bucket: testcrudbucket
          source: ./dist
          destination: '/${name}/\${{env.VERSION}}'
          acl: public-read
      - name: upload bundle as latest
        uses: CoCreate-app/CoCreate-s3@master
        with:
          aws-key-id: '\${{ secrets.AWSACCESSKEYID }}'
          aws-access-key: '\${{ secrets.AWSSECERTACCESSKEY }}'
          bucket: testcrudbucket
          source: ./dist
          destination: /${name}/latest
          acl: public-read
          invalidations: true
  docs:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      
      - name: update documentation
        uses: CoCreate-app/CoCreate-docs@master

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
