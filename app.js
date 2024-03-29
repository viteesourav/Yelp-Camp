//adding the dotenv to fetch env details...[It will be specific to your cloudinary configurations]
if(process.env.NODE_ENV != "production") {  //Currently running in development mode, After deployement it will production mode.
   require('dotenv').config()  //brings env values here...
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Joi = require('joi'); //Js schema validator tool
const bodyParser = require('body-parser');
const catchAsync = require('./utils/catchAsync.js'); //this brings us the custom async error handler
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate'); //this is ejs engine used for simplifying partials.
const session = require('express-session'); // handles the session realted stuff.
const flash = require('connect-flash'); //this handles flash messages.
//Requiring Passport
const User = require('./models/user.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
//Requiring for Protection againt mongo Injection.
const mongoSanitize = require('express-mongo-sanitize');
//HTTP response header Middleware for security
const helmet = require("helmet");
//moving the session-store to mongo
const MongoStore = require('connect-mongo'); //Stores session info in Mongo DB


//requiring custom files from the working directory
const Campground = require('./models/campground.js');
const Review = require('./models/review.js'); //Getting the Review Model.

//app configurations..
mongoose.set('strictQuery', true); //suppress the warning...
app.engine('ejs', ejsMate); //this defines the ejs engine to use ejs-mate instead of the default one.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware-configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(mongoSanitize());  //This will sanitize req body, query and params
//Add the security for HTTP Response Headers...
app.use(helmet());

//Configuring Helmet's Content Security Prolicy (CSP)...
//This are the allowed exteranl CDNs URL that we want to use in our native application...
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

//Configuring Helmet's CSP based on the above allowed URls List...
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dt5g032wn/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//Manage the Prod DB and local DB urls...

const dbHostUrl = (process.env.IS_PROD_DB.toUpperCase() === "TRUE") ? process.env.MONGO_ATLAS_URL : process.env.MONGO_LOCAL_DB;

console.log("Current DB HOST URL: ",dbHostUrl);

//mongoose configurations...
mongoose.connect(dbHostUrl)
    .then(()=>{
        console.log("Successfully connected to the MongoDB");
    })
    .catch(()=>{
        console.log('error while connecting to the DB');
    })

//Mongo-store session configurrations...
const store = MongoStore.create({
    mongoUrl: dbHostUrl,
    touchAfter: 24 * 60 * 60 //lazy session refresh will happen every 24 hours [in seconds]
});

//Handling any error occured with mongo session store...
store.on("error", (err)=>{
    console.log("Mongo-session store error occured", err);  
})

//consfiguring session Secret token...
const secret = process.env.SECRET || 'ThisMySecretKeyForSessionSign';
//enabling session
app.use(session({
    store, //using Mongo-store to store session data
    name: 'ExpSession',
    secret,  //Required Parameter for session
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        // secure: true,  //only use in production env
        maxAge: 1000*60*60*24*7, //this sets the max age of the session to 1 week. (takes in millisecond)
    }
}))

//We will configure our Passport here...
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));  //tells passport to implements localStrategy

//handles the storing of USer data in and out of the session...
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Dummy Login Route.. [For testing passport]
// app.get('/fakeLogin', async(req,res)=>{
//     const newUser = new User({email: "sourav.mitra@campGround.com", username: "sourRock45"});  //new user without password.
//     const registeredUser = await User.register(newUser, 'this23yearOld');  //new User is registered with passpord.
//     res.send(registeredUser);
// })

//enabling flash..
app.use(flash());
//defining flash-middleware to make sure it renders the messages.
//This middleware handles global variables sent to all the render forms..
app.use((req,res,next)=>{
    res.locals.userLoggedIn = req.user;
    // console.log("LoggedIn User Details: ",res.locals.userLoggedIn);
    res.locals.success = req.flash('success');  //res.locals defines params that goes straight to the render form i.e success and error is accessable to all ejs templates. 
    res.locals.error = req.flash('error');
    next();
})

//we will server the static public directory
app.use(express.static(path.join(__dirname, 'public')));

//basic Routes..
app.get('/', (req,res)=>{
    //res.send('Hi, This is yelp Camp Root Route :)');
    res.render('home.ejs');
});

//testing the campground model with express..
// app.get('/insertDummy', catchAsync(async (req, res)=>{
//     const newCamp = new Campground({title: 'Backyard', price: "0", description: "Cheap and Free Ground", location: 'My house'});
//     await newCamp.save();
//     res.send('Dummy Camp inserted in the DB');
// }))

//calling the auth related Routers
const userRouters = require('./router/user.js');
app.use('/', userRouters);

//importing and implementing required Routers...
const CampgroundRouters = require('./router/campground');
app.use('/campgrounds', CampgroundRouters);

const ReviewRouters = require('./router/review');
app.use('/campgrounds/:id/reviews', ReviewRouters);  //Dont forgot to pass the param in Router defination, so that it will treat :id as path param.


//A default route for catching a route that doesn't exist
app.all('*', (req,res,next)=>{
    console.log("None of the Routes Matched !!");
    return next(new ExpressError('Page not found', 404));
})


//Error-handling middlewares
app.use((err, req, res, next)=>{
    // const {statusCode = 500, message = 'Damn ! It broke :('} = err;
    // res.status(statusCode).send(message);
    //res.send('Damn ! It broke :( ');
    if(!err.message) err.message = 'Damn ! It broke :(';  //this will update the message in err if its not there...
    const {statusCode = 500} = err;
    console.log('****** ERROR STACK START ***********');
    console.log(err); //Logs the error to the server console
    console.log('****** ERROR STACK END *************');
    res.status(statusCode).render('error.ejs', {err});
})

//configuring server port..
const port = process.env.PORT || 8080;  //prod env will have the port, if not Server deployed at 8080

//EXpress Server listening port configuration...
app.listen(port, ()=>{
    console.log(`Server Live at ${port} !`);
})