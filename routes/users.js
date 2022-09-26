var express = require('express');
var router = express.Router();
var auth = require('./../middlewares/auth')

var Users = require('./../models/users');

/* GET all users listing. */
router.get('/', (req, res, next) => {
  Users.find({}, (err,user)=>{
    if(err) next(err);
    user ? res.json({user}) : res.status(404).send("No user found");
  })
});

router.get('/:id', (req,res,next) => {
  var id = req.params.id;
  Users.findById(id, (err,user)=>{
    if(err) next(err);
    user ? res.json(user) : res.status(404).send("No user found by this id");
  })
})


/* Register Users */
router.post('/register', (req, res, next) => {
  Users.create(req.body, (err,user)=>{
    console.log(err? err : user);
    if(err) return next(err);
    res.json(user);
  })
  // res.send('user logged to the console');  // we must not send response from here since create is an async operation and the response will be sent without even completing create request
});


/* Login Users */
router.post('/login' , (req, res, next) => {
  var { email , password } = req.body;
  if( !email || !password) {
    res.send("Email/Password not provided")
  }
  Users.findOne({ email: email } , (err, user) => {
    if(err) return next(err);
    // no user
    if(!user) {
      return res.send(`${email} is not yet registered. Please Register first`);
    }

    // Compare password
    user.verifyPassword(password , (err, result) => {
      if(err) return next(err);
      if(!result){
        return res.send("Incorrect Password")
      }
      //persist logged in user information  (here we need to create a session and store it into mongo for long term storage)  
      req.session.userId = user.id; //creates a sesison and put the logged in userId in the userId key. This entire session will be stored in memory store by default
      return res.send(`User Login Successful. Session: ${req.session.userId} `);
      console.log(req.session);
    })
  })
  })

//To show sessions
router.get('/login/sessions' , (req, res, next) => {
  console.log(req.session);
  res.json({session: req.session});
  })


//Logout Route
router.get('/logout' , (req, res, next) => {
  req.session.destroy();
  res.clearCookie('connect.sid');
})


//implementing authorization on a protected route
router.get('/authorization/protected' , (req, res) =>{ 
  console.log(req.session);
  if(req.session && req.session.userId){  //if the request has a cookie with a sessionId and the session-middleware is able to fetch a userId from the session store based on the sessionId that means the user is logged in
    res.send("Protected Resource is accesible since user is logged in");  
  }
  else{
    res.status(401).send("Protected Resource is not accesible since user is not logged in");
  }
  
})


//implementing authorization on a protected route using middlewares auth.protectedRoute which is defined by us
router.get('/authorization/middlewares/protected', auth.protectedRoute , (req, res) =>{ 
  console.log(req.session);
  res.send("Protected Resource is accesible since user is logged in");
})


//implementing authorization for all the routes which come after this point without indivisually plugging in the authorization middleware
router.use(auth.protectedRoute);


router.get('/authorization/middlewares/protected', (req, res) =>{ 
  console.log(req.session);
  res.send("Protected Resource is accesible since user is logged in");
})


/* Update users by id using PUT */
router.put('/:id', (req,res,next) => {
  var id = req.params.id;
  console.log(req.body);
  Users.findByIdAndUpdate(id, req.body, (err,user)=>{
    console.log(err? err : user);
    if(err) next(err);
    res.json(user);
  })
});

/* Update users by id using patch */
router.patch('/:id', (req,res,next) => {
  var id = req.params.id;
  console.log(req.body);
  Users.findByIdAndUpdate(id, req.body, (err,user)=>{
    console.log(err? err : user);
    if(err) next(err);
    res.json(user);
  })
});

/* Delete users by id */
router.delete('/:id', (req,res,next) => {
  var id = req.params.id;
  Users.findByIdAndDelete(id, (err,deletedUser)=>{
    if(err) next(err);
    res.send(`User ${deletedUser.name} was deleted from the record`);
  })
})


module.exports = router;
