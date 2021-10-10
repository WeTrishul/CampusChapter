const cookieParser = require('cookie-parser');
const express = require('express')
const Env = require('../config/environment')
const db = require('../config/db')
const mongoose = require('mongoose')
const User = require('../models/user')
const Event = require('../models/events')
const Blog = require('../models/blog')
const Post = require('../models/post')
const passport =require('passport')
const passport_local = require('../config/passport-local-auth')
const fetch = require('node-fetch')
const moment = require('moment')
const startingTime = require('../config/timecalc')
const passportLocal=require('../config/passport-local-auth')
const forgot = require('../mailers/forgotPassword_mailer')
const multer = require('multer')
const path=require('path')
const fs =require('fs')
const queue = require('../config/kue')
const otpWorkers = require('../workers/otp_workers')
const signupotpWorkers = require('../workers/verifyUser_workers')
const globaleventsmethods = require('../config/GlobaleventMethods')
const Hackerrank = require('../config/Hackerank')
const resourses = require('../models/resourses')
const upcomingEvents = require('../models/UpcomingEvents')
const signup_mailer = require('../mailers/signup_mailer')


const jwt  = require('jsonwebtoken');
const { findOneAndDelete } = require('../models/user');

module.exports.getlogin=(req,res)=>{

    if(req.isAuthenticated())
    {
    res.redirect('/dashboard')  
    }
else
{
    res.render('login',{
        title:'login',
        msg:undefined,
        flag:undefined
    })
}
}

module.exports.postlogin = (req,res)=>{
    res.redirect('/dashboard')
}

module.exports.getsignup = (req,res)=>{

if(req.isAuthenticated())
{
  res.redirect('/dashboard')  
}
else
{
    res.render('signup',{
        title:'signup',
        msg:undefined
    })
}

}

module.exports.postsignup = async (req,res)=>{

    console.log(req.body)
    
        const newObjUser = req.body

        try {
                const token =  jwt.sign(newObjUser,'CampusChapter',{expiresIn:60*60*24})
                console.log(token)
    
    
                const obj = {
                    token:token,
                    email:req.body.email
                }
    
                let job = queue.create('signupVerify',obj).priority('high').save(function(err){
                    if(err)
                    {
                        console.log('Error in sending Otp from signup',err)
                        return
                    }
                    console.log('Signup OTP enqueued successfully',job.id)
                })
    
                res.render('signup',{
                    title:'signup',
                    msg:'Go verify Your Email Dude!'
                })
           
        } catch (error) {
            console.log(error)
            res.redirect('back')
        }
    }


    module.exports.verifySignup= async (req,res)=>{
        const token = req.params.token
        console.log(token)
        try {

            jwt.verify(token,'CampusChapter', async (error,decodedData)=>{
                if(error)
                {
                    console.log('Incorrect token or it is expired' + error.message)
                    return
                }
                const email = decodedData.email

                const user =await User.findOne({email})

                if(user)
                {
                    // res.redirect('/login')  
                   return res.render('login',{
                        title:'login',
                        msg:'Signup failed : User already exists',
                        flag:'error'
                    })
                }
                else
                {
                    const Newuser = await new User(decodedData)
                    await Newuser.save()
                }
                console.log(decodedData)
                // res.redirect('/login')
                res.render('login',{
                    title:'login',
                    msg:'Verified successfully !!',
                    flag:'success'
                })
            })
            
        } catch (error) {  
            res.render('signup',{
                title:'signup',
                msg:'User couldnot be verifed.Go change your password!'
            }) 
        }
    }
    

module.exports.dashboard = async (req,res)=>{
    try { 
        
        const posts = await Post.find({}, {}, { sort: { 'createdAt' : -1 }}).limit(8)
        
        const events = await Event.find({}, {}, { sort: { 'createdAt' : -1 }}).limit(4)

        const blog = await Blog.find({}, {}, { sort: { 'createdAt' : -1 }}).limit(8)


        res.render('dashboard',{
            title:'Dasboard',
            posts : posts,
            events : events,
            blogs : blog
        })
       
        
    } catch (error) {
        res.render('error_page')
    }
    
}

module.exports.upcomingevents = async (req,res)=>{
    try {
        
        var myevents = []
        await Event.find({},(error,event)=>{
          myevents = event
        }) 

       
        res.render('UpcomingEvents',{
          
            myevents:myevents
        })
       
        
    } catch (error) {
        console.log(error)
        res.render('error_page')
    }
}


module.exports.globaleventpage = async (req,res) =>{

    try {
       let eventsArray = []
       let eventsTiming = []

       var events =  await upcomingEvents.find({})

       if(!events.length)
       {
           const temp = await upcomingEvents.create({})
           events.push(temp)
       }
       console.log('pura events',events[0])

     if(req.params.platform=='CodeForces')
     {
          eventsArray= events[0].codeforces
          console.log('function me se',eventsArray)
     }

   else if(req.params.platform=='CodeChef')
     {
         eventsArray= events[0].codechef
     }
     else if(req.params.platform=='hackerrank')
     {
         let obj = await Hackerrank.scrapeProduct('https://www.hackerrank.com/contests')

          eventsArray = obj.services
          eventsTiming = obj.services1
     }
     console.log(eventsArray)

     res.render('globalevents',{
         result : eventsArray,
         query: req.params.platform,
         resultTiming:eventsTiming
     })
        
    } catch (error) {
        console.log(error)
        res.render('error_page')
    } 
}


module.exports.updatepage = (req,res)=>{
    if(req.isAuthenticated())
    {
    res.render('updatecodershandles')  
    }
else
{
    res.render('login',{
        title:'login'
    })
}
}

module.exports.updatecoderhandles = async (req,res)=>{
    const user =  await User.findOne({email:req.params.email})
    console.log(user)
    try {
        const updates = Object.keys(req.body)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()

        req.login(user, function(err) {
            if (err) {return console.log('some error')}      
        })
      
        console.log(req.user.username)

       res.redirect('/profilepage')
        
    } catch (err) {
       console.log(err) 
       res.redirect('back')
    }   
}

module.exports.othersProfile = async(req,res)=>{
   

    try {

        if(req.isAuthenticated())
            {
                const user = await User.findOne({username:req.params.username})
        res.render('othersProfile',{
            title:'Profile',
            searchuser:user
        })
    }
    res.redirect('/login')
    } catch (err) {
    console.log(err)
    res.redirect('/error_page')
    }
}


module.exports.logout = (req,res)=>{     
    req.logout();
  res.redirect('/login');
}


module.exports.forgotPasswordView = (req,res)=>{
    res.render('forgotPassword',{
        title:'Forgot page'
    })
}


module.exports.forgotPassword = async(req,res)=>{

    const email = req.body.email
    console.log (email+'from forgot password post')
             
        try {
            const user = await User.findOne({email})
            console.log(user + ' from forgot password')
            const token =  await jwt.sign({_id:user._id},Env.jwt_secret,{expiresIn:60})
            console.log(token)

            const obj = {
                token:token,
                email:user.email
            }
            let job = queue.create('otp',obj).priority('high').save(function(err){//
                if(err)
                {
                    console.log('Error in sending Otp ',err)
                    return
                }
                console.log('otp enqueued successfully',job.id)
            })

            await User.updateOne({resetLink:token})
            res.redirect('/signup')
        } catch (error) {
           console.log('Error from forgotPassword',error) 
           res.redirect('/login')
           return
        }
}

module.exports.changePasswordPage = (req,res)=>{
    let token = req.params.token
    res.render('changePassword',{
        title:'Change Password Page',
        token:token
    })
}

module.exports.changePassword = async (req,res)=>{
    
    const newPass =req.body.password
    const token = req.params.token

    const user = await User.findOne({resetLink:token})

    try {
        console.log(user.email)
        jwt.verify(token,'CampusChapter',(error,decodedData)=>{
            if(error)
            {
                console.log('Incorrect token or it is expired')
                return
            }
            user.password = newPass
             user.save()
            res.redirect('/login')
        })
        
    } catch (error) {
        console.log('Error in change password',error)   
        res.redirect('/forgot-password')     
    }



}

module.exports.listUsers = async (req,res)=>{

    try {

        if(req.isAuthenticated())
        {
            const user = await User.find({})
            // console.log(user)
            return res.render('AllUsers',{
                 title:'All Users',
                 users:user
             })
        }
        else
         res.redirect('/login')
       
        
    } catch (error) {
        console.log('Error from listUsers',error)
        res.render('error_page')
        return
    }
}

module.exports.delete = async(req,res)=>{
    const username = req.params.username
    try {

        if(req.isAuthenticated())
        {
            const user = await User.findOne({username:username})
        if(user.UserType==='Admin')
        {
            return res.redirect('/listUsers')
        }

        if(user.dp!=='Nhi hai') 
        {
            if(user.dp[0]!='h')
                 fs.unlinkSync(path.join(__dirname,'..',user.dp))
                 console.log('Path '  +path.join(__dirname,'..',user.dp))
        }
        await User.deleteOne({username:username})
        
        console.log(user)
        return res.redirect('/listUsers')
        }
        else
        res.redirect('/login')
        
    } catch (error) {
         console.log('Error from delete',error)
         res.render('error_page')
    }
}

module.exports.changeRole = async(req,res)=>{
 
    try {

        if(!req.isAuthenticated())
        {
            res.redirect('/login')
        }

        const user = await User.findOne({username:req.query.username})
        console.log('User from changeRole',user)
        if(req.query.role==='events')
            {
                user.UserType='EventsLead'
                await user.save();
         }
         else if(req.query.role==='questionsetter')
         {
            user.UserType='QuestionSetter'
            await user.save();
         }
         else{
            user.UserType='MediaLead'
            await user.save();
         }
         return res.redirect('/listUsers')
    } catch (error) {
        console.log('Error in changing role',error)
        res.render('error_page')
    }
 
}

module.exports.listUserQuestions = async (req,res)=>{
   

    try {
        if(!req.isAuthenticated())
        {
            res.redirect('/login')
        }

        const _id = req.params.id
        const user = await User.findById(_id)

        const arr = user.arr;
        res.render('questionlist',{
            title:'question list',
            l: user.arr.length,
            arr: arr
        })
    } catch (error) {
        res.render('error_page')
    }
}



