const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { isLoggedIn, redirectURL } = require('../utils/loginMiddleware');

//basic Route to navigate to REgister Form - GET
router.get('/register', (req,res)=>{
    res.render('user/register');
})

//actual Route for adding a new user in the db...
router.post('/register', async(req,res,next)=>{
    // res.send(req.body);  -- Testing the Router works or not when form is submitted...
    try {
        const userData = {...req.body.user};
        const {email, username} = userData;
        const newUserData = new User({email, username}); //This puts email and usrname at place.
        const registeredUser  = await User.register(newUserData, userData.password); //this will save th user in the db too..
        console.log(registeredUser);
        // res.redirect('/login');
        req.login(registeredUser, (err)=>{
            if(err) {
                return next(err);
            }
            req.flash('success', `${req.user.username} is successfully Registerd To Application`);
            res.redirect('/campgrounds')
        })
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
});

//Defining the login route...
router.get('/login', (req,res)=>{
    res.render('user/login');  //takes you to the login page...
})

//handles the login POST Route using the passport authenticate middleware...
router.post('/login', redirectURL, passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), (req,res)=>{

    req.flash('success', `Welcome back ${req.user.username} !`);
    // res.redirect('/campgrounds');
    //Instead of directly redirecting to campgrounds we will check if any redirectURL present or not ?
    const redirectURL = res.locals.redirectURL || '/campgrounds';
    console.log(req.session); //After successful login, the session refreshes, and all previous session data cleared.
    res.redirect(redirectURL);

})

//implementing Logout Route
router.get('/logout', isLoggedIn, (req,res)=>{
    req.logout((err)=>{
        if(err) return next(err);
        req.flash('success', 'Logged You Out successFully !');
        res.redirect('/login');
    });
})

module.exports = router;
