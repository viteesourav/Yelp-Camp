const express = require('express');
const catchAsync = require('../utils/catchAsync'); //this brings us the custom async error handler
//Moved to Middleware file.....
// const ExpressError = require('../utils/ExpressError');
// const {campgroundSchema} = require('../utils/joiSchemaValidator'); //this brings the joi schema validator
const router = express.Router();
//fetching the Passport authentication middleware
const {isLoggedIn, validateSchema, isAuthorized} = require('../utils/Middleware');
const campgroundController = require('../controllers/campground');  //requiring Campground Controller

//basic Routing, home-page for campground.
router.get('/', catchAsync(campgroundController.fetchAllCampgrounds));

//basic create route..
router.get('/new', isLoggedIn, campgroundController.renderNewCampForm);

//This handles validation if the body dont have a campground data...
router.post('/',isLoggedIn, validateSchema, catchAsync(campgroundController.AddNewCamp));

//baisc show-route, detail of one campground.
router.get('/:id', isLoggedIn, catchAsync(campgroundController.renderShowCamp));

//edit route..
router.get('/:id/edit', isLoggedIn, isAuthorized, catchAsync(campgroundController.editCampground));

//validating the input using joi schema validator...
router.put('/:id', isLoggedIn, isAuthorized, validateSchema, catchAsync(campgroundController.updateCamp))

//campground delete route...
router.delete('/:id', isLoggedIn, isAuthorized, catchAsync(campgroundController.deleteCamp));


module.exports = router;