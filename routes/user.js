const express = require('express')
const passport = require('passport')
const router = new express.Router()
const UserController = require('../controllers/user')
const UploadController = require('../controllers/upload')
const codechef = require('../config/codeChef')
const CodechefController = require('../controllers/CodechefController')
const fetch = require('node-fetch')

const User = require('../models/user')


router.get('/fileupload',passport.checkAuthentication,UploadController.setQuestions)
router.post('/fileupload/setquestions/:id',UploadController.upload)
router.get('/profilepage',passport.checkAuthentication,UploadController.profile)
router.post('/profilepage/setdp/:id',UploadController.uploadDp)
router.get('/profilepage/:username',UserController.othersProfile)


router.get('/signup',UserController.getsignup)
router.post('/signup/createuser',UserController.postsignup)
router.get('/login',UserController.getlogin)
router.post('/login/createsession',passport.authenticate(
    'local',
    {failureRedirect:'/login'}
    ),UserController.postlogin)


    router.get('/verify/user/:token',UserController.verifySignup)

router.get('/users/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/users/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),UploadController.profile)


router.get('/dashboard',passport.checkAuthentication,UserController.dashboard)

router.get('/UpcomingEvents',passport.checkAuthentication,UserController.upcomingevents)

router.get('/globalevents/:platform',passport.checkAuthentication,UserController.globaleventpage)


router.get('/logout',UserController.logout)



//router.post('/update/coderhandles/:email',UserController.updatecoderhandles)
router.get('/update',UserController.updatepage)
router.post('/update/coderhandles/:email',UserController.updatecoderhandles)

router.get('/forgot-password',UserController.forgotPasswordView)
router.post('/forgot-password',UserController.forgotPassword)
router.get('/reset/password/:token',UserController.changePasswordPage)
router.post('/reset/password/:token',UserController.changePassword)


router.get('/listUsers',UserController.listUsers)
router.get('/delete/:username',UserController.delete)
router.get('/userrole',UserController.changeRole)



router.get('/seeQ/:id',UserController.listUserQuestions)


//codechef routing
clientId = codechef.clientId


router.get('https://api.codechef.com/oauth/authorize?response_type=code&client_id=504ef030a3d0d8456e73a83f62b1cd72&redirect_uri=http://wetrishul.in/getGrantCode&state=xyz')
router.get('/getGrantCode',CodechefController.getGrantCode)
router.get('/helloworld',async (req,res)=>{
    tokenUrl = 'https://api.codechef.com/oauth/token'
    const data = {
        'grant_type': 'authorization_code',
        'code': 'fe0f7e0293eb0d7d9069ddde02fbfff09f309559',
        'client_id': '504ef030a3d0d8456e73a83f62b1cd72',
        'client_secret': '8576906e0da74991d05f9b7d12a9dd4a',
        'redirect_uri': 'http://wetrishul.in/getGrantCode'
      }

      fetch(tokenUrl, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })
      .then(res => res.json())
      .then(res => {
        if (res.status !== 'OK') return console.log('Error hai')
        const tokens = res.result.data

        console.log(tokens)

      })
      .catch(err => console.log('Can not get the token from codechef', err))

})

router.get('/getToken',CodechefController.getToken)










module.exports = router;