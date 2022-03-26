# Spot-Server

## Setup

* Get NodeJs and Postgresql

- Add awskey.ts to config folder
```
{
    "AccessKeyID": "",
    "SecretAccessKey": ""
}
```
- Add googlekey.ts to config folder
```
{
    "APIKey": ""
}
```
- Add secret.ts to config folder
```
{
    "secret": ""
}
```
- Update config.ts in config folder with nsfwModelDir and logFileDir

## Run
```
npm install

// Babel and Typescript
npm run dev
// or
npm run prod
```

### Redis
- Install and Run Redis for caching
