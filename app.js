const express=require('express')
const mongoose=require('mongoose')
const app= express()
const config=require('./config')
const bodyParser=require('body-parser')
const cookieparser=require('cookie-parser')
const cors=require('cors')
const path=require('path')
const cookieSession = require('cookie-session');
require('dotenv').config()
const userRoutes=require('./routes/userroutes')
const authRoutes=require('./routes/authroutes')
const postRoutes=require('./routes/postroutes')
const passport=require('passport')
const session = require('express-session');
const MongoStore = require('connect-mongo')
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieparser())
app.use(express.static(__dirname +'/assets'));


app.use(passport.initialize());
app.use(passport.session());

app.use(
  session({
    secret: 'keyboard',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: config.mongoUri }),
  
  })
)
mongoose.connect(config.mongoUri,{ useNewUrlParser: true },()=>{
    console.log('connected to db')
})
mongoose.set('useFindAndModify', false);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})
app.use('/', userRoutes)
app.use('/', authRoutes)
app.use('/', postRoutes)


app.listen(config.port)