var express = require('express');
var router = express.Router();
var User = require('../models/user'),path = require('path');
var mEvents = require('../models/uevents');
// GET route for reading data

router.get('/', (req, res) => {
  res.render('principal.html', {title: "Acceuill"  ,current: req.session.user});
});




router.get('/Signin', (req, res) => {
  if (req.session.user) {
    res.redirect('/Profile');
  } else res.render('signin.html', {title: "Register"});
});
router.get('/Login', (req, res) => {
  if (req.session.user) {
    res.redirect('/Profile');
  } else res.render('login.html', {title: "Login"});
});
router.get('/Admin',async (req, res) => {
   if(!req.session.user || req.session.accessLevel<4){
        res.redirect('/login');
    }else{
      try {
      res.render('admin.html', { 
        users: await User.find({},function(err,docs){
        return docs;
           }) ,
        current: req.session.user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
       
    }
});
router.post('/Admin', (req, res) => {
   if(!req.session.user || req.session.accessLevel<4){
        res.redirect('/login');
    }else{
      var doc = {
            accessLevel: req.body.accessLevel 
        };
      try {
        User.update({_id: req.body.uId},doc,function(err, data){
                 if (err) {
                    res.status(500).send({error: 'you have an error'});
                 }        
              else res.send();
            });
      
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
       
    }
});

//POST route for updating data
router.post('/signin', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordverify) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password ) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      accessLevel:1
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  }else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

router.post('/login', function (req, res, next) {
if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var Error={
          msg: "username ou mot de pass incorrect !!",
          type:0
        };
        return res.render('login.html', {title: "Accueil",current: req.session.user,Error:Error});
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
   }
})

// GET route after registering
router.get('/profile', function (req, res, next) {
   if (!req.session.userId) {
    res.redirect('/Login');
  } else 
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          req.session.user= user;
          return res.render('profile.html', {title: "Profile",current: req.session.user})
        }
      }
    });
});
// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.post('/ajouter',function(req,res){
  
  if(!req.session.user){
     return res.redirect('/login');
  }else{
   if (req.session.user.accessLevel!=0 && req.body.title &&req.body.start &&req.body.end&&req.body.color ) { 
     
  var NewEvent = {
      userId:req.session.user.username,
      title: req.body.title,
      start: req.body.start,
      end: req.body.end,
      color: req.body.color
  };
  mEvents.create(NewEvent, function (error, event) {
      if (error) {
        return res.redirect('/act?action=failed');
      } else {
        res.redirect('/');
      }
    }); 
  }else res.redirect('/act?action=failed');
} 
});
router.post('/effacer',function(req,res){
  if(!req.session.user ){
    res.redirect('/login');
}else{
if(req.body.EventID==null) res.redirect('/',403);  
if(req.session.user.accessLevel <3 )res.status(500).send({error: 'you have an error'});
  else{
if(req.session.user.accessLevel!=4)
{
    mEvents.findOne({_id: req.body.EventID },function(err,event){
        if(event.userId != req.session.user.username) res.status(500).send({error: 'you have an error'});
        else {
          mEvents.deleteOne({_id : req.body.EventID}, function (error, event) {
            if (error) {
              res.status(500).send({error: 'you have an error'});
            } else {
              res.send();
            }
          }); 
        }
                    });

 }      else{
          mEvents.deleteOne({_id : req.body.EventID}, function (error, event) {
            if (error) {
              res.status(500).send({error: 'you have an error'});
            } else {
              res.send();
            }
          }); 

    }   
    }}
});
router.get('/act', function (req, res,next) {

  var Error={
    msg: "vous n'avez pas le droit pour faire cette action !!",
    type:0
  };
  if(req.query.action=="failed")
  return res.render('principal.html', {title: "Accueil",current: req.session.user,Error:Error});
 res.redirect('/');
});

/*
router.get('/:name', (req, res) => {
  if(req.params.name!=""){
    res.render('principal.html', {title: "calendar of "+req.body.name  ,current: req.session.user});
  }
});
*/



module.exports = router;