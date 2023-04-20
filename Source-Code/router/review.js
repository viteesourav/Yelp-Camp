const express = require('express');
const router = express.Router({mergeParams: true}); //This params passed will make sure any req.param coming from app.js and router url prefix will be treated as params.
const {reviewSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler

//requiring custom files from the working directory
const Campground = require('../models/campground.js');
const Review = require('../models/review.js'); //Getting the Review Model.

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

//Handling Post Review Routes.. (Handling the Review-campground Scheama relations here...)
router.post('/', validateReviewSchema, catchAsync(async(req,res)=>{
    //res.send({...req.body.review});
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review({...req.body.review});
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'New Review Added !!');
    res.redirect(`/campgrounds/${req.params.id}`);
}))

//handling Delete A particular Review Route..
router.delete('/:reviewId', catchAsync(async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //This will pull one review that matches from the reviews list and remove it.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully !');
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;