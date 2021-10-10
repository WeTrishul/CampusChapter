const passport =require('passport')
const Env = require('./environment')
const googleStrategy = require('passport-google-oauth').OAuth2Strategy
const crypto = require('crypto')
const User = require('../models/user')
const passport_local=require('./passport-local-auth')
const LoginMailer = require('../mailers/login_mailer')
const queue = require('./kue')
const loginEmailsWorker = require('../workers/login_emails_workers')

passport.use(new googleStrategy({
    clientID:Env.google_client_ID, //'724954914773-8tgpsd25gtsegic3g6g1jom7sslie8e9.apps.googleusercontent.com'
    clientSecret:Env.google_client_secret,//'TNMJyQfBVgQAQOglMyxIWLce'
    callbackURL:'http://wetrishul.in/users/auth/google/callback' //Env.google_callback_URL
},
    function(accessToken,refreshToken,profile,done){
        User.findOne({email:profile.emails[0].value}).exec((err,user)=>{
            if(err)
            {
                console.log('Error in google passport authentication',err)
                return
            }  
            console.log(profile)
            console.log(accessToken,refreshToken)
            if(user)
            {
                //LoginMailer.newLogin(user)
                let job = queue.create('emails',user).priority('low').save(function(err){
                    if(err)
                    {
                        console.log('Error in sending to the queue',err)
                        return
                    }  
                    console.log('job enqueued',job.id)

                  })
                return done(null,user)
            }
            else{
                User.create({
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    password:crypto.randomBytes(20).toString('hex'),
                    username:profile.emails[0].value,
                    dp:profile.photos[0].value
                },function(err,user){
                    if(err){
                        console.log('Error in google passport authentication',err)
                        return
                    }
                   // LoginMailer.newLogin(user)
                   let job = queue.create('emails',user).priority('low').save(function(err){
                     if(err)
                     {
                         console.log('Error in sending to the queue',err)
                         return
                     }  
                     console.log('job enqueued',job.id)
                   })
                   
                    console.log(profile.emails[0].value)
                    return done(null,user)
                })
            }
        })
    }
))






module.exports = passport