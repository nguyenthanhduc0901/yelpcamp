if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}


const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const methodOverride = require("method-override");
const flash = require('connect-flash')

const ExpressError = require("./utils/ExpressError");

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const campgroundRoutes = require("./router/campgrounds")
const reviewRoutes = require("./router/reviews")
const userRoutes = require("./router/users")

const MongoDBStore = require("connect-mongo")(session);

const dbUrl = "mongodb://localhost:27017/yelp-camp" || "mongodb+srv://our-first-user:nhock0918@atlascluster.9t0qmtb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster"

//"mongodb+srv://our-first-user:nhock0918@atlascluster.9t0qmtb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,'public')))


const store = new MongoDBStore({
  url: dbUrl,
  secret:'makhautot',
  touchAfter: 24*60*60
})

store.on('error', function (err) {
  console.log('SESSION STORE ERROR', err)
})

const sessionConfig = {
  store,
  secret: "makhautot",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7
  }
}

app.use(session(sessionConfig));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req,res,next) => {
  if(!['/login', '/'].includes(req.originalUrl)){
    req.session.returnTo = req.originalUrl
   
  }

  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error'); 
  next();
})


app.get('/fakeUser', async (req, res) => {
  const user = new User({email: 'gacon@gmail.com', username: 'congamai'})
  const newUser = await User.register(user, 'congatrong')
  res.send(newUser)
})

app.use('/' , userRoutes)
app.use('/campgrounds' , campgroundRoutes)
app.use('/campgrounds/:id/reviews' , reviewRoutes)



app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong by you!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
