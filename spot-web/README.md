# Spot-Web

## Setup
- Add SSL certificates to spot-web (server.crt and server.key)
- Setup environemnt.ts with your googleProviderId and server base url

## Run
```
npm install

// dev
ng serve

// prod
ng serve --prod
```

## zlib bundle

- for zlib bundle to work need to change
node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js
```
node: {crypto: true, stream: true}
```
