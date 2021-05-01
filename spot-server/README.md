# Spot-Server

## Setup

* Download node.js version 8.11.3 LTS
* Download MySQL Community Server 8.0.11+ 32 bit
* Download Python 2.7
* Download MySQL python connector 32 bit
* Open MySQL command line client and enter

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin';
```

- Add awskey.json to config folder
```
{
    "AccessKeyID": "",
    "SecretAccessKey": ""
}
```
- Add googlekey.json to config folder
```
{
    "APIKey": ""
}
```
- Add secret.json to config folder
```
{
    "secret": ""
}
```
- Update config.ts in config folder with nsfwModelDir and logFileDir

## Run
```
npm install

// Compile ts and and run normally
npm run tsc
node build/main.js

// Watch files and skip transpiling
npm run dev

// Script for transpiling commands above
npm run prod
```

### MongoDb

Get Homebrew

https://brew.sh/

```
brew tap mongodb/brew
brew install mongodb-community@4.2
```

Run one of the following to start (fg, bg, service)

```
mongod --config /usr/local/etc/mongod.conf
mongod --config /usr/local/etc/mongod.conf --fork
brew services start mongodb-community@4.2
```

MySQL is the primary storage and MongoDB used as caching/intermediate storage for speed

### Redis
- Install and Run Redis for caching
