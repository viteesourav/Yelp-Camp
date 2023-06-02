//This is a Review Controller File...
//Fetching the Model Files...
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.AddReview = async(req,res)=>{
    //res.send({...req.body.review});
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review({...req.body.review});
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'New Review Added !!');
    res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteReview = async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //This will pull one review that matches from the reviews list and remove it.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully !');
    res.redirect(`/campgrounds/${id}`);
}