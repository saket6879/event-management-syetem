const confiq=require('../config/config').get(process.env.NODE_ENV);
const jwt=require('jsonwebtoken');

var mongoose=require('mongoose');

const eventSchema=mongoose.Schema({
    eventname:{
        type: String,
        required: true,
        maxlength: 100
    },
    eventId:{
        type: String,
        required: true,
        maxlength: 100,
        unique: 1
    },
    venue:{
        type: String,
        required: true,
        maxlength: 100
    },
    date:{
        type: String,
        required: true
    },
    creator:{
        type: String,
        maxlength: 100
    },
    invited:{
        type: Array,
    },
    token:{
        type: String
    }
},{
    timestamps:true
});

//Update Event
eventSchema.methods.updateEvent=function(updatedata){
    var event = this;
    if(updatedata.venue!=null && updatedata.venue!=""){
        event.venue = updatedata.venue;
    }
    if(updatedata.date!=null && updatedata.date!=""){
        event.date = updatedata.date;
    }
    if(updatedata.invited!=null && updatedata.invited!=[]){
        event.invited = updatedata.invited;
    }
    event.save(function(err){
        if(err) return "error";
    })
    return event;
}

module.exports=mongoose.model('Event',eventSchema);