//This is a controller File, handles all the Callbacks for Campgrounds...
const Campground = require('../models/campground');  //Brings the campground Model file here...

module.exports.fetchAllCampgrounds = async(req,res)=>{
    const response = await Campground.find({}).populate('reviews').populate('author');
    res.render('campgrounds/index.ejs', {campgrounds: response});
};

module.exports.renderNewCampForm = (req,res)=>{
    //This part is moved to its seperate middleware...
    // if(!req.isAuthenticated()) {
    //     req.flash('error', 'User must be Logged in !');
    //     return res.redirect('/login');
    // }
    console.log('Opening create new campground page');
    res.render('campgrounds/new.ejs');
};

module.exports.AddNewCamp = async(req,res)=>{
    //console.log(req.body); //just to view the submitted data
    //if(!req.body.campground) throw new ExpressError('Invalid campground-form Data', 400); 
    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    // res.send(newCamp);
    await newCamp.save();
    req.flash('success', 'Congratulations !! New CampGroup Created successfully !');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.renderShowCamp = async(req,res)=>{
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
    // console.log('Populated Campground Details: ',campground);
    if(!campground) {
        req.flash('error', 'Cannot find the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {campground});
};

module.exports.editCampground = async(req,res)=>{
    // console.log('campground id: ', req.params);
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find and update the campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {campground});
};

module.exports.updateCamp = async(req,res)=>{
    const {id} = req.params;
    //console.log(req.params);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); //using spread operator..
    console.log('Updated Data: ', campground);
    req.flash('success', 'Congratulations !! CampGround Updated successfully !');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCamp = async(req,res)=>{
    //res.send("Yes this will be Deleted !!");
    const{id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully !');
    res.redirect('/campgrounds');
};