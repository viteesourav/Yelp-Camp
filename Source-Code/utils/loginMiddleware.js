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