let glob = require("glob");
let fs = require('fs');
const path = require("path")

function globUpdater(er, files) {

    if (er)
        console.log(files, 'glob resolving issue')
    else
        files.forEach(filename => {
            update(filename + '/automated.yml')
        })
    console.log('Completed')
}

function update(YmlPath) {
    let fileContent = `name: Automated Workflow
on:
  push:
    branches:
      - master
jobs:
  about:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Jaid/action-sync-node-meta
        uses: jaid/action-sync-node-meta@v1.4.0
        with:
          direction: overwrite-github
          githubToken: "\${{ secrets.GITHUB }}"
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 14
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v3
        id: semantic
        with:
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/git
            @semantic-release/github
        env:
          GITHUB_TOKEN: "\${{ secrets.GITHUB }}"
          NPM_TOKEN: "\${{ secrets.NPM_TOKEN }}"
    outputs:
      new_release_published: "\${{ steps.semantic.outputs.new_release_published }}"
      new_release_version: "\${{ steps.semantic.outputs.new_release_version }}"
  upload:
    runs-on: ubuntu-latest
    needs: release
    if: needs.release.outputs.new_release_published == 'true'
    env:
      VERSION: "\${{ needs.release.outputs.new_release_version }}"
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Set npm registry auth
        run: echo "//registry.npmjs.org/:_authToken=\${{ secrets.NPM_TOKEN }}" > ~/.npmrc
      - name: Install dependencies
        run: yarn install
      - name: Build
        run: yarn build
      - name: Set Environment Variables
        run: |
          echo "organization_id=\${{ secrets.COCREATE_ORGANIZATION_ID }}" >> $GITHUB_ENV
          echo "key=\${{ secrets.COCREATE_KEY }}" >> $GITHUB_ENV
          echo "host=\${{ secrets.COCREATE_HOST }}" >> $GITHUB_ENV
      - name: CoCreate Upload
        run: coc upload

`;
    // process.exit()
    if (fs.existsSync(YmlPath))
        fs.unlinkSync(YmlPath)
    fs.writeFileSync(YmlPath, fileContent)

}



// glob("/home/cocreate/CoCreate/CoCreate-components/CoCreate-actions/.github/workflows", globUpdater)
glob("/home/cocreate/CoCreate/CoCreate-components/*/.github/workflows/", globUpdater)
glob("/home/cocreate/CoCreate/CoCreate-apps/*/.github/workflows/", globUpdater)
glob("/home/cocreate/CoCreate/CoCreate-plugins/*/.github/workflows/", globUpdater)

glob("/home/cocreate/CoCreate/CoCreate-admin/.github/workflows/", globUpdater)
glob("/home/cocreate/CoCreate/CoCreateCSS/.github/workflows/", globUpdater)
glob("/home/cocreate/CoCreate/CoCreateJS/.github/workflows/", globUpdater)
glob("/home/cocreate/CoCreate/CoCreate-wesite/.github/workflows/", globUpdater)
