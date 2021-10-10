const express = require('express')
const Env = require('./config/environment')
const app=express()
require('./config/view-helpers')(app)
const session = require('express-session')
const logger = require('morgan')
const ejs = require('ejs')
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser')
const UserRouter = require('./routes/user')
const DiscussRouter = require('./routes/DiscussionForum')
const LeaderboardsRouter = require('./routes/Leaderboards')
const EventRouter = require('./routes/events')
const TeamChatRouter = require('./routes/TeamChat')
const BlogsRouter = require('./routes/Blogs')
const passport = require('passport')
const passport_local = require('./config/passport-local-auth')
const passportGoogle = require('./config/passport-google-oauth2.0-strategy')
const passportJWT = require('./config/passport-jwt-strategy')
const db = require('./config/db')
const MongoStore = require('connect-mongo')
const RatingsHandler = require('./config/RatingsHandler')
const pollRouter = require('./routes/Polling')
const resourceRouter = require('./routes/resources')
const cors = require('cors')
const User = require('./models/user')
const Noticleaner = require('./config/Noti_cleaner')
const globalEventMethods = require('./config/GlobaleventMethods')
const applyrouter = require('./routes/applyRouter')






app.use(cors({
    origin:'*'
}))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://wetrishul.in");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });


const port=process.env.PORT || 3000
//app.use(express.json())


app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())


app.set('view engine','ejs')
app.set('views','./views')


app.use(session({
    name: 'CodeChefCampusChapter',
    secret: Env.session_cookie_key,
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge: (1000*60*100)
    },
    store: MongoStore.create({
        mongoUrl: `mongodb://127.0.0.1:27017/${Env.db}`,
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

app.use(express.static(Env.asset_path))
app.use(EventRouter)

app.use(UserRouter)
app.use(DiscussRouter)
app.use(LeaderboardsRouter)
app.use(TeamChatRouter)
app.use(pollRouter)
app.use(BlogsRouter)
app.use(resourceRouter)
app.use(applyrouter)

app.use('/uploads',express.static(__dirname + '/uploads'))

app.use(logger(Env.morgan.mode,Env.morgan.options))


const ChatServer = require('http').Server(app)
const ChatSocket = require('./config/chatsocket').chat(ChatServer)

ChatServer.listen(5000)

const NotificationServer = require('http').Server(app)
const NotificationSocket = require('./config/notification_socket').notification(NotificationServer)

NotificationServer.listen(7000)


// sudo killall -9 node


app.listen(port,()=>{

    setInterval( async ()=>{
        
        // await Noticleaner.cleanit()
        await globalEventMethods.codeforcesevents()
        await globalEventMethods.codeChefEvents()

    }, 86400000);

    setInterval( async ()=>{
        console.log('Fired')
        const user = await User.find({})

        const k = await RatingsHandler.updateRatingsOfAllUsers()
        
        const t = (user.length)*25000

        setTimeout(() => RatingsHandler.updateLeaderboards(), t) 
        
    },604800000);//604800000
    

    console.log('Server is up on port '+ port)
})