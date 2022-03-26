<img src="./spot-web/src/assets/images/logo_v7_transparent.png" alt="spot" width="250"/>

Spot is a social media web application for anonymous location based posts you can share with friends across social media including facebook and google

# Setup

Please view each folders README.md for more information

Clone the repository
```
git clone https://github.com/krleitch/spot.git
```

spot-web
- Add SSL certificates to spot-web (server.crt and server.key)
- Setup environemnt.ts with your googleProviderId and server base url

spot-server
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

## Spot-Server
Express Server with Postgresql Db

## Spot-Web
Angular13 with NgRx13 store
## Spot-Commons
Common Models, Exceptions, and Constants for both web and server
