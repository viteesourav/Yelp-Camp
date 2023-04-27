const express = require('express');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler
//Moved to Middleware file.....
// const ExpressError = require('../utils/ExpressError');
// const {campgroundSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
const router = express.Router();
//fetching the Passport authentication middleware
const {isLoggedIn, validateSchema, isAuthorized} = require('../utils/Middleware');

//requiring custom files from the working directory
const Campground = require('../models/campground.js');

//basic Routing, home-page for campground.
router.get('/', catchAsync( async(req,res)=>{
    const response = await Campground.find({}).populate('reviews').populate('author');
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
    newCamp.author = req.user._id;
    // res.send(newCamp);
    await newCamp.save();
    req.flash('success', 'Congratulations !! New CampGroup Created successfully !');
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

//baisc show-route, detail of one campground.
router.get('/:id', isLoggedIn, catchAsync( async(req,res)=>{
    //This is how you handle nested populate of fields...
    //basically, here, you will first get all Reviews based on review Id
    // then for each Review, you will populate the users based on userId
    const campground = await Campground.findById(req.params.id)
    .populate( { 
        path: 'reviews',
        populate: {
            path: 'author'
        }
     }).populate('author');
    console.log('Populated Campground Details: ',campground);
    if(!campground) {
        req.flash('error', 'Cannot find the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {campground});
}))


//edit route..
router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync( async(req,res)=>{
    // console.log('campground id: ', req.params);
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find and update the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {campground});
}))

//validating the input using joi schema validator...
router.put('/:id', isLoggedIn, isAuthorized, validateSchema, catchAsync( async(req,res)=>{
    const {id} = req.params;
    //console.log(req.params);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); //using spread operator..
    console.log('Updated Data: ', campground);
    req.flash('success', 'Congratulations !! CampGround Updated successfully !');
    res.redirect(`/campgrounds/${id}`);
}))

//campground delete route...
router.delete('/:id', isLoggedIn, isAuthorized, catchAsync( async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully !');
    res.redirect('/campgrounds');
}))


module.exports = router;