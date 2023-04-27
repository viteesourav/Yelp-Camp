const express = require('express');
const router = express.Router({mergeParams: true}); //This params passed will make sure any req.param coming from app.js and router url prefix will be treated as params.
//Moved to Middleware File...
// const {reviewSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
// const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler\
const {isLoggedIn, validateReviewSchema, isReviewAuthorized} = require('../utils/Middleware');

const reviewController = require('../controllers/review');  //fetching the Review Controller 

// //requiring custom files from the working directory
// const Campground = require('../models/campground.js');
// const Review = require('../models/review.js'); //Getting the Review Model.


//Handling Post Review Routes.. (Handling the Review-campground Scheama relations here...)
router.post('/', isLoggedIn, validateReviewSchema, catchAsync(reviewController.AddReview))

//handling Delete A particular Review Route..
router.delete('/:reviewId', isLoggedIn, isReviewAuthorized, catchAsync(reviewController.deleteReview))


module.exports = router;