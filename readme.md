# TPBWaitlist 
 ## Badges  
[![GitHub issues](https://img.shields.io/github/issues/deawar/TPBWaitlist?style=plastic)](undefined/network)[![GitHub forks](https://img.shields.io/github/forks/deawar/TPBWaitlist?style=plastic)](undefined/network)[![GitHub pull-requests closed](https://img.shields.io/github/issues-pr-closed/deawar/TPBWaitlist?style=plastic)](undefined/pull/)[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg?style=plastic)](code_of_conduct.md) 
## Description  
  Groomer.io supplimental app to manage customer database so that it is searchable by name, pet, city, zipcode.  
  As a Groomer.io user I want to search my database of customers by name, phone, pet, city and zipcode so that 
  I can schedule them on a unit and be able to see when one will be near them on a given day. This app will give a map view of customers
  and locations of the grooming units.
* [Installation](#installation)  
* [Usage](#usage)  
* [Testing](#testing)  
* [Credit](#credit)  
* [License](#license)  
* [Contributing](#contributing)  
* [Dependencies](#dependencies)  
* [Dev-Dependencies](#dev-dependencies)  
* [Questions](#questions) 
  
## Installation  
``` 
npm install 
``` 
This app will also require a .env file with the following variables:
```
# .env for Waitlist Node App for TPBWaitlist

#Node Environment
#NODE_ENV=test
#NODE_ENV=development
NODE_ENV=production
PORT=5000

#Passport Session Secret
SESSION_SECRET=YourSessionSecret
ENCRYPTION_KEY=Your_Encryption_Key

#Gmail Credentials
GMAIL_USER=Your_Gmail
GMAIL_PW=Your_Password

#Google Client ID
GOOGLE_CLIENT_ID=Your_Google_Client_ID
GOOGLE_CLIENT_SECRET=Your_Google_Client_Secret

# Mongo DB Local Credentials
DBLOCAL_USER=Your_Local_Credentials
DBLOCAL_PASSWORD=Your_Local_Password
DBLOCAL_NAME=Your_Local_DB_Name
DBLOCAL_HOST=YourURL:27017/
#LOCALMONGODB_URI=`mongodb://${process.env.DBLOCAL_USER}:${process.env.DBLOCAL_PASSWORD}@${process.env.DBLOCAL_HOST}${process.env.DBLOCAL_NAME}?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false`
LOCALMONGODB_URI=mongodb://YourDBUsuerName:YourPassword@YourURI:27017/TPBWaitlist?authSource=admin&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false

# Mongo DB Credentials
DB_USER=YourProductionDBUserName
DB_PASSWORD=YourProductionDBPassword
DB_NAME=YourProductionDBName
DB_HOST=Your.DBInstance.mongodb.net/
MONGODB_URI=Your_Mongo_DB_Instance_URI

# JWT Settings
JWT_KEY=Your_JWT_Testing_Token

#ZipCodeAPI.com APPLICATION Key
ZIPCODE_APP_KEY=Your_ZipCodeAPI_Key

#ArcGis Default API Key
ArcGis_API_Key=Your_ARCGIS_API_Key
ARCGIS_CLIENT_ID=Your_Client_ID
ARCGIS_CLIENT_SECRET=Your_Secret_Token
REDIRECT_URI=http://localhost:5000/maps/authenticate
MAIN_URL=https://TheURLOfYourChoosing.com
```
## Usage  
``` 
node app.js 
``` 
## Testing  
``` 
npm test 
``` 
## Credit 
Many Thanks to:  
![Ankit Mudvari](https://avatars.githubusercontent.com/u/59261007?v=4&s=48)    [Ankit Mudvari](https://github.com/ankmud01)  
## License  
[MIT](https://github.com/deawar/TPBWaitlist/blob/master/LICENSE) -A license with no conditions whatsoever which dedicates works to the public domain. Unlicensed works, modifications, and larger works may be distributed under different terms and without source code.
  
## Contrubuting Guidelines 
 This Repo proudly follows the [Contributor Covenant](https://www.contributor-covenant.org/) which is an industry standard. 
 
## Dependencies  
* [axios](https://www.npmjs.com/package/axios)
* [bcryptjs](https://www.npmjs.com/package/bcryptjs)
* [chalk](https://www.npmjs.com/package/chalk)
* [connect-flash](https://www.npmjs.com/package/connect-flash)
* [cross-fetch](https://www.npmjs.com/package/cross-fetch)
* [dotenv](https://www.npmjs.com/package/dotenv)  
* [ejs](https://www.npmjs.com/package/ejs)  
* [express](https://www.npmjs.com/package/express)  
* [express-ejs-layouts](https://www.npmjs.com/package/express-ejs-layouts)  
* [express-session](https://www.npmjs.com/package/express-session)  
* [mongodb](https://www.npmjs.com/package/mongodb)  
* [mongoose](https://www.npmjs.com/package/mongoose)  
* [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator)  
* [morgan](https://www.npmjs.com/package/morgan)  
* [nodemailer](https://www.npmjs.com/package/nodemailer)  
* [passport](https://www.npmjs.com/package/passport)  
* [passport-local](https://www.npmjs.com/package/passport-local)  
* [randomstring](https://www.npmjs.com/package/randomstring)  
## Dev-Dependencies  
* [standard](https://www.npmjs.com/package/standard)  
* [nodemon](https://www.npmjs.com/package/nodemon)  
## Questions 
![Dean Warren](https://avatars.githubusercontent.com/u/15312495?v=4&s=48)   Click on [@Dean Warren](https://github.com/deawar)