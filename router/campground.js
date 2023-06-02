const express = require('express');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler
//Moved to Middleware file.....
// const ExpressError = require('../utils/ExpressError');
// const {campgroundSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
const router = express.Router();
//fetching the Passport authentication middleware
const {isLoggedIn, validateSchema, isAuthorized} = require('../utils/Middleware');
const campgroundController = require('../controllers/campground');  //requiring Campground Controller
//Adding the multi-part middleware to parse form data with File attached
const multer = require('multer');
// const upload = multer({dest: 'uploads/'}); //using local stroage to store files.
//instead of storing in local, we will use cloudinary destination to store it.
const {storage} = require('../cloudinary');
const upload = multer({storage});  //takes the cloudinary storage space...


router.route('/')
    .get(catchAsync(campgroundController.fetchAllCampgrounds)) //basic Routing, home-page for campground.
    .post(isLoggedIn, upload.array('campImages'), validateSchema, catchAsync(campgroundController.AddNewCamp)); //validateSchema handles validation if the body dont have a campground data...

//Route to naivage to Add new campground..
router.get('/new', isLoggedIn, campgroundController.renderNewCampForm);

router.route('/:id')
    .get(isLoggedIn, catchAsync(campgroundController.renderShowCamp)) //basic show-route, detail of one campground.
    .put(isLoggedIn, isAuthorized, upload.array('campImages'), validateSchema, catchAsync(campgroundController.updateCamp)) //validating the input using joi schema validator...
    .delete(isLoggedIn, isAuthorized, catchAsync(campgroundController.deleteCamp)); //campground delete route...

//edit route..
router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(campgroundController.editCampground));

module.exports = router;