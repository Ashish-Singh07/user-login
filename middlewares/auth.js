var User = require('./../models/users')

module.exports = {
    protectedRoute: (req, res, next) => {   //this middleware when applied, will tell us whether a user is logged in or not
        if(req.session && req.session.userId){  //if the request has a cookie with a sessionId and the session-middleware is able to fetch a userId from the session store based on the sessionId that means the user is logged in
          //res.send("Protected Resource is accesible since user is logged in");  
          next();   //if user is logged in then proceed with the next steps in the request
        }
        else{
          return res.status(401).send("Protected Resource is not accesible since user is not logged in");
        }
    },
    userInfo: (req, res, next) => {     // this middleware should be applied before moving to any routes so that we have the access to the userInfo if a user is logged in
        var userId = req.session && req.session.userId;
        if(userId) {
            User.findById(userId, "name email" , (err, user) => {   //because of the second parameter here, we will get only the name and email fields in the user object
                if(err) return next(err) ;
                req.user = user;    //making user object available to all other routes via request object
                res.locals.user = user;     //making user object available to all templates to render any userInfo on UI
                next();
            })
        } else {
            req.user = null;
            res.locals.user = null;
            next();
        }
    }
}

