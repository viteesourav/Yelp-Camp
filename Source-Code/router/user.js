const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { isLoggedIn, redirectURL } = require('../utils/Middleware');

const userController = require('../controllers/user');

router.route('/register')
    .get(userController.renderRegister) //basic Route to navigate to REgister Form - GET
    .post(userController.registerNewUser); //actual Route for adding a new user in the db...

router.route('/login')
    .get(userController.renderLogin) //Defining the login route...
    .post(redirectURL,   
        passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), 
        userController.doLogin); //handles the login POST Route using the passport authenticate middleware...

//implementing Logout Route
router.get('/logout', isLoggedIn, userController.doLogout);

module.exports = router;
