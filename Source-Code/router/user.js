const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { isLoggedIn, redirectURL } = require('../utils/Middleware');

const userController = require('../controllers/user');

//basic Route to navigate to REgister Form - GET
router.get('/register', userController.renderRegister);

//actual Route for adding a new user in the db...
router.post('/register', userController.registerNewUser);

//Defining the login route...
router.get('/login', userController.renderLogin);

//handles the login POST Route using the passport authenticate middleware...
router.post('/login', redirectURL, passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), userController.doLogin)

//implementing Logout Route
router.get('/logout', isLoggedIn, userController.doLogout);

module.exports = router;
