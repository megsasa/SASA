var express = require('express');
var router = express.Router();
var mEvents = require('../models/uevents');
var path = require('path');
var users = require('../models/user');




router.get('/',(req,res)=>{

    //console.log(req.session.user);
    if(!req.session.user){
        res.redirect('/login');
    }else{
       mEvents.find({},function(err,docs){
        
        res.json(docs);
    }); 
    }
});
 router.post('/',function(req,res){
   if(!req.session.user ){
        res.redirect('/login');
    }else{
    if(req.body.EventID==null) res.redirect('/',403);  
    if(req.session.user.accessLevel <2 )res.redirect('/act?action=failed');   
    else {var doc = {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end ,
        color: req.body.color    
    };
    if(req.session.user.accessLevel!=4)
    {
        mEvents.findOne({_id: req.body.EventID },function(err,event){
            if(event.userId != req.session.user.username)res.redirect('/act?action=failed');  
            else {
                mEvents.findByIdAndUpdate( req.body.EventID, doc,{new: true},function(error, model){
                    if (error)return ;  
                      return res.redirect('/');
                    });
              res.redirect('/');
              
            }
                                                     });

    }else{
        mEvents.update({_id: req.body.EventID},doc,function(err, data){
        if (err)res.redirect('/act?action=failed'); 
          res.redirect('/act?action= success');
        });
    
}   
    }}
    });

    router.put('/',function(req,res){
        if(!req.session.user ){
            res.redirect('/login');
        }else{
        if(req.body.EventID==null) res.redirect('/',403);  
        if(req.session.user.accessLevel <2 ){
          res.status(500).send({error: 'you have an error'});
        }else{
        var doc = {
            title: req.body.title,
            start: req.body.start,
            end: req.body.end ,
            color: req.body.color    
        };
        if(req.session.user.accessLevel!=4)
        {
            mEvents.findOne({_id: req.body.EventID },function(err,event){
                if(event.userId != req.session.user.username) res.status(500).send({error: 'you have an error'});
                else {
                    mEvents.update({_id: req.body.EventID},doc,function(err, data){
                        if (err) {
                            res.status(500).send({error: 'you have an error'});
                          }                    
                          res.send();
                        });
                }
                                                         });

                }else{
                 mEvents.update({_id: req.body.EventID},doc,function(err, data){
                 if (err) {
                    res.status(500).send({error: 'you have an error'});
                 }        
              res.send();
            });
        
            }   
            }}
    });

// router.get('/:id',function(req,res){
//         users.findOne({_id: req.params.id },function(err,docs){
//         res.json(docs.username)
//     });
// });

// router.get('/:usern',(req,res)=>{
//     var id;
//     users.findOne({username: req.params.usern },function(err,user){
//         if(err)res.redirect('/');
//         else {
//           id = user._id;
//         mEvents.find({ userId : id },function(err,docs){
//         res.json(docs);
//     });}
//     });
    
// });


module.exports = router;