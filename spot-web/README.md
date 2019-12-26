# Spot-Web

## Setup

* Install Node.js
* Install the Angular CLI "npm install -g @angular/cli"
* Install NativeScript CLI "npm install -g nativescript"
* Install the NativeScript schematics "npm install --global @nativescript/schematics"
* Compelte the NativeScript full setup at https://docs.nativescript.org/start/quick-setup#full-setup
* Make sure ANDROID_HOME and ANDROID_SDK_ROOT system path variables are set to your android sdk location
* Make sure you have Android SDK 28 or later
* Create an android virtual device (API 28) (Currently tested with Pixel_2_API_28)
* Run your avd with your android sdk emulator "emulator.exe -avd avd_name"
* ng serve to run web app on localhost:4200
* tns run (android || ios) --bundle to serve to mobile device
* tns debug android --bundle to debug in chrome

* You will need to enable HTTPS for interaction with facebook api
* Server with ng serve --ssl after creating, signing, and updating angular.json

## Resources

* Learn ngrx here https://wesleygrimes.com/angular/2018/05/30/ngrx-best-practices-for-enterprise-angular-applications
* Configure for HTTPS https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

Get Spot-Server at https://github.com/krleitch/spot-server
