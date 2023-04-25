const express = require('express');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
const router = express.Router();
//fetching the Passport authentication middleware
const {isLoggedIn} = require('../utils/loginMiddleware');

//requiring custom files from the working directory
const Campground = require('../models/campground.js');

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

//basic Routing, home-page for campground.
router.get('/', catchAsync( async(req,res)=>{
    const response = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds: response});
}));

//basic create route..
router.get('/new', isLoggedIn, (req,res)=>{
    //This part is moved to its seperate middleware...
    // if(!req.isAuthenticated()) {
    //     req.flash('error', 'User must be Logged in !');
    //     return res.redirect('/login');
    // }
    console.log('Opening create new campground page');
    res.render('campgrounds/new.ejs');
})

//This handles validation if the body dont have a campground data...
router.post('/',isLoggedIn, validateSchema, catchAsync( async(req,res,next)=>{
    //console.log(req.body); //just to view the submitted data
    //if(!req.body.campground) throw new ExpressError('Invalid campground-form Data', 400); 
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    req.flash('success', 'Congratulations !! New CampGroup Created successfully !');
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

//baisc show-route, detail of one campground.
router.get('/:id', isLoggedIn, catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {campground});
}))


//edit route..
router.get('/:id/edit', isLoggedIn, catchAsync( async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find and update the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {campground});
}))

//validating the input using joi schema validator...
router.put('/:id', isLoggedIn, validateSchema, catchAsync( async(req,res)=>{
    const {id} = req.params;
    //console.log(req.params);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); //using spread operator..
    console.log('Updated Data: ', campground);
    req.flash('success', 'Congratulations !! CampGround Updated successfully !');
    res.redirect(`/campgrounds/${id}`);
}))

//campground delete route...
router.delete('/:id', isLoggedIn, catchAsync( async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully !');
    res.redirect('/campgrounds');
}))


module.exports = router;