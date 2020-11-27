# SPOT-WEB

### Install

- npm i
- ng serve

# Notes

for zlib bundle to work need to change
node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js
node: {crypto: true, stream: true}
