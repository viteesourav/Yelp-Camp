//defining all the requires needed by this middleware-file
const {campgroundSchema} = require('./joiSchemaValidator'); //this brings the joi schema validator
const ExpressError = require('./ExpressError');
const Campground = require('../models/campground');


//This verify if the user is still logged-in or not ?
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectURL = req.originalUrl; //This is hit as its validate is the user is login ? if not pick the current url and store it in session.
        console.log(req.session);
        req.flash('error', 'User must be Logged in !');
        return res.redirect('/login');
    }
    next();
}

//This saves the currentPageUrl from the session and stores it in the res.locals.. 
module.exports.redirectURL = (req,res,next)=>{
    if(req.session.redirectURL){
        res.locals.redirectURL = req.session.redirectURL;
    }
    next();
}

//Joi validator handler middleware to mongoose schema vlaidation...
module.exports.validateSchema = (req,res,next)=>{
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

//this middleware job is to Check if the current User is Authorized to do the activity or not ?
module.exports.isAuthorized = async(req, res, next) =>{
    // console.log('campground id: ', req.params);
    const {id} = req.params;
    console.log('Camp Id from param: ', id);
    const campdetails = await Campground.findById(id);
    console.log('campdetails: ', campdetails);
    // since am not populating the autor data here, and author key will store the ObjectId of User..
    // we can directly comapre the id...
    if(!campdetails.author.equals(req.user._id)) {
        req.flash('error', 'This User is not allowed to perform the Operation');
        return res.redirect('/campgrounds');
    }
    next();
}