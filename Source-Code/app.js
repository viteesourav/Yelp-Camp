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

//enabling session
app.use(session({
    secret: 'ThisMySecretKeyForSessionSign',  //Required Parameter for session
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        maxAge: 1000*60*60*24*7, //this sets the max age of the session to 1 week. (takes in millisecond)
    }
}))
//enabling flash..
app.use(flash());
//defining flash-middleware to make sure it renders the messages.
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');  //res.locals defines params that goes straight to the render form.
    res.locals.error = req.flash('error');
    next();
})


//we will server the static public directory
app.use(express.static(path.join(__dirname, 'public')));

//mongoose configurations...
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log("Successfully connected to the MongoDB");
    })
    .catch(()=>{
        console.log('error while connecting to the DB');
    })

//basic Routes..
app.get('/', (req,res)=>{
    //res.send('Hi, This is yelp Camp Root Route :)');
    res.render('home.ejs');
});

//testing the campground model with express..
app.get('/insertDummy', catchAsync(async (req, res)=>{
    const newCamp = new Campground({title: 'Backyard', price: "0", description: "Cheap and Free Ground", location: 'My house'});
    await newCamp.save();
    res.send('Dummy Camp inserted in the DB');
}))


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
    res.status(statusCode).render('error.ejs', {err});
})

//EXpress Server listening port configuration...
app.listen(8080, ()=>{
    console.log('Server Live at 8080 port');
})