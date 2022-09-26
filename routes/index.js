var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//implementing authorization on a protected route
router.get('/protected' , (req, res) =>{ 
  console.log(req.session);
  if(req.session && req.session.userId){  //if the request has a cookie with a sessionId and the session-middleware is able to fetch a userId from the session store based on the sessionId that means the user is logged in
    res.send("Protected Resource is accesible since user is logged in");  
  }
  else{
    res.status(401).send("Protected Resource is not accesible since user is not logged in");
  }
  
})

module.exports = router;
