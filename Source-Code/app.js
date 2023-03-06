const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Joi = require('joi'); //Js schema validator tool
const bodyParser = require('body-parser');
const catchAsync = require('./utils/catchAsync.js'); //this brings us the custom async error handler
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./utils/joiSchemaValidator'); //this brings the joi schema validator
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate'); //this is ejs engine used for simplifying partials.
const Review = require('./models/review.js'); //Getting the Review Model.

//requiring custom files from the working directory
const Campground = require('./models/campground.js');

//app configurations..
mongoose.set('strictQuery', true); //suppress the warning...
app.engine('ejs', ejsMate); //this defines the ejs engine to use ejs-mate instead of the default one.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

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

//basic Routing, home-page for campground.
app.get('/campgrounds', catchAsync( async(req,res)=>{
    const response = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds: response});
}));

//basic create route..
app.get('/campgrounds/new', (req,res)=>{
    console.log('Opening create new campground page');
    res.render('campgrounds/new.ejs');
})

//Joi validator handler middleware to mongoose schema vlaidation...
const validateSchema = (req,res,next)=>{
    //using js schema validator... 
    const {error} = campgroundSchema.validate(req.body);  //validating the incoming data from the form.
    //console.log(error);
    if(error) {
        //console.log(error.details);  --> this returns a list of objects contianing info about the schema error encountered.
        const msg = error.details.map(err => err.message).join(','); //this is how you extract the message from JOI error object.
        throw new ExpressError(msg, 400);  //also can be written like: return next(new ExpressError(msg, 400));
    } else {
        next();
    }
}

//Joi validation middleware to do schema validation of review...
const validateReviewSchema = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);

    if(error) {
        const msg = error.details.map(err => err.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//This handles validation if the body dont have a campground data...
app.post('/campgrounds',validateSchema, catchAsync( async(req,res,next)=>{
    //console.log(req.body); //just to view the submitted data
    //if(!req.body.campground) throw new ExpressError('Invalid campground-form Data', 400); 
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

//baisc show-route, detail of one campground.
app.get('/campgrounds/:id', catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground);
    res.render('campgrounds/show.ejs', {campground});
}))

//Handling Post Review Routes.. (Handling the Review-campground Scheama relations here...)
app.post('/campgrounds/:id/reviews', validateReviewSchema, catchAsync(async(req,res)=>{
    //res.send({...req.body.review});
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review({...req.body.review});
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//edit route..
app.get('/campgrounds/:id/edit', catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs', {campground});
}))

//validating the input using joi schema validator...
app.put('/campgrounds/:id',validateSchema, catchAsync( async(req,res)=>{
    const {id} = req.params;
    //console.log(req.params);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); //using spread operator..
    console.log('Updated Data: ', campground);
    res.redirect(`/campgrounds/${id}`);
}))

//campground delete route...
app.delete('/campgrounds/:id', catchAsync( async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//handling Delete A particular Review Route..
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //This will pull one review that matches from the reviews list and remove it.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

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