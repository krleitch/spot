# Spot-Web

## Setup
- Add SSL certificates to spot-web (server.crt and server.key)
- Setup environemnt.ts with your googleProviderId and server base url

https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

```
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
```

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
