const express = require('express');
const router = new express.Router();
const Event = require('../models/event');
const User = require('../models/user');
const {auth} = require('../middleware/auth');


// adding new event
router.post('/api/create_event',auth,function(req,res){

    const newevent=new Event(req.body)
    
    Event.findOne({eventId:newevent.eventId},function(err,event){
        if(event) return res.status(400).json({ auth : false, message :"eventId taken"});

        newevent.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            doc.creator = req.user.email;
            res.status(200).json({
                success:true,
                event : doc
            });
            User.findOne({'email':doc.creator},function(err,user){        
                user.createdevents.push(newevent.eventId);
                user.save();
            });
            for(i=0; i<doc.invited.length;i++){
                User.findOne({'email':doc.invited[i]},function(err,user){
                    if(user && user.email!=doc.creator){
                        user.invitedevents.push([newevent.eventId, doc.creator] );
                        console.log(user.invitedevents);
                        user.save();
                    }
                });    
            }  
        });
    });  
 });

 //Update Event
router.post('/api/update_event',auth,function(req,res){
    Event.findOne({'eventId':req.body.eventId},function(err,event){
        if(!event) return res.json({isAuth : false, message : 'Auth failed ,eventId not found'});

        doc = event.updateEvent(req.body,(err, event));
        res.status(200).json({
            success:true,
            event : doc
        });
    });       
});

//Event Details
router.get('/api/event_details',auth,function(req,res){

    Event.findOne({'eventId':req.body.eventId},function(err,event){
        if(!event) return res.json({isAuth : false, message : 'Auth failed ,eventId not found'});

        res.json({
            isAuth: true,
            eventname: event.eventname,
            eventId: event.eventId,
            venue: event.venue,
            date: event.date,
            creator: event.creator,
            invited: event.invited,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        })
    });
});

module.exports =router;