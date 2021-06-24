const express = require('express')
const session = require('express-session')
const ejs = require('ejs')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const UserRouter = require('./routes/user')
const DiscussRouter = require('./routes/DiscussionForum')
const LeaderboardsRouter = require('./routes/Leaderboards')
const passport = require('passport')
const passport_local = require('./config/passport-local-auth')
const db = require('./config/db')
const MongoStore = require('connect-mongo')
const RatingsHandler = require('./config/RatingsHandler')


const app=express()
const port=process.env.PORT || 3000
//app.use(express.json())



app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())



app.set('view engine','ejs')
app.set('views','./views')

app.use(session({
    name: 'CodechefCampusChapter',
    secret: 'blahblahblah..',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge: (1000*60*100)
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/CodeChefCampusChapter',
        autoRemove:'disabled',
    },
    function(err)
    {
        console.log(err||'connect-mongodb setup ok')
    })
}))

/*app.use(session({
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/test-app' })
})) */

app.use(passport.initialize())
app.use(passport.session())
app.use(passport.setAuthenticatedUser)

app.use(UserRouter)
app.use(DiscussRouter)
app.use(LeaderboardsRouter)



app.listen(port,()=>{

   

    setInterval( async ()=>{
        // RatingsHandler.getRatings({codeforces:'coder_hk47'})
        await RatingsHandler.updateRatingsOfAllUsers()
        RatingsHandler.updateLeaderboards()
    }, 60000);


    console.log('Server is up on port '+ port)
})