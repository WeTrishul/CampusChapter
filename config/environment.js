const fs = require('fs')
const rfs = require('rotating-file-stream')
const dotenv = require('dotenv')

const path = require('path')



const logDirectory = path.join(__dirname,'../production_logs')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const accessLogStream = rfs.createStream('access.log',{
  interval:'1d',
  path:logDirectory
}) 

const development = {
    name:'development',
    asset_path:'./assets',
    session_cookie_key:'blahblahblah..',
    db:'CodeChefCampusChapter',
    smtp:{
        service:"gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'team.wetrishul@gmail.com', 
          pass: '12019009009994',
        },
      },
    google_client_ID:'724954914773-8tgpsd25gtsegic3g6g1jom7sslie8e9.apps.googleusercontent.com',
    google_client_secret:'TNMJyQfBVgQAQOglMyxIWLce',
    google_callback_URL:'http://localhost:3000/users/auth/google/callback',
    jwt_secret:'CampusChapter',
    morgan:{
      mode:'dev',
      options:{stream:accessLogStream}
    }
}

dotenv.config()

const production = {
    name:'production',
    asset_path:process.env.CAMPUS_CHAPTER_ASSET_PATH,
    session_cookie_key:process.env.CAMPUS_CHAPTER_SESSION_COOKIE_KEY,
    db:process.env.CAMPUS_CHAPTER_DB,
    smtp:{
        service:"gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.CAMPUS_CHAPTER_ADMIN_EMAIL, //team.wetrishul@gmail.com
          pass: process.env.CAMPUS_CHAPTER_ADMIN_PASSWORD,//12019009009994
        },
      },
    google_client_ID:process.env.CAMPUS_CHAPTER_GOOGLE_CLIENT_ID,//CAMPUS_CHAPTER_GOOGLE
    google_client_secret:process.env.CAMPUS_CHAPTER_GOOGLE_CLIENT_SECRET,
    google_callback_URL:process.env.CAMPUS_CHAPTER_GOOGLE_CALLBACK_URL,//yaha pr localhost:3000 k jagah apna domain ayega
    jwt_secret:process.env.CAMPUS_CHAPTER_JWT_SECRET,//WMtu8WvikkMxmmnkrNKNF2kDzpboe2q6
    morgan:{
      mode:'combined',
      options:{stream:accessLogStream}
    }
}

console.log(eval(process.env.NODE_ENV))

module.exports =   eval(process.env.CAMPUS_CHAPTER_ENVIRONMENT) === undefined ? development : eval(process.env.CAMPUS_CHAPTER_ENVIRONMENT) //development
