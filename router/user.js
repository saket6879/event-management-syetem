const express=require('express');
const router = new express.Router();
const User=require('../models/user');
const Event = require('../models/event');
const {auth} =require('../middleware/auth');
var request = require("request");
const mailgun = require("mailgun-js");
const DOMAIN = "sandboxed48667ab2594a0f9c0eed9547e11cb5.mailgun.org";
const mg = mailgun({apiKey: "feea4130c614a2d485299977ca53cb04-45f7aa85-8c2d3eae", domain: DOMAIN});

// adding new user (sign-up route)
router.post('/api/register',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
         
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                success:true,
                user : doc
            });
        });
    });
 });

 // login user
router.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id,
                        email : user.email
                    });
                });    
            });
          });
        }
    });
});
// get logged in user
router.get('/api/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        email: req.user.email,
        name: req.user.firstname + " " + req.user.lastname,
        createdevents: req.user.createdevents,
        invitedevents: req.user.invitedevents
    })
});


//Invited Events
router.get('/api/invited_events',auth,function(req,res){
    const filters = req.query;
    const filteredUsers = req.user.invitedevents.filter(user => {
        let isValid = true;
        for (key in filters) {
            console.log(key, user[1], filters[key]);
            isValid = (user[1] == filters[key]);
        }
        return isValid;
    });
    res.json({
        invitedevents: filteredUsers
    })
});


//Created Events
router.get('/api/created_events',auth,function(req,res){
    res.json({
        createdevents: req.user.createdevents
    })
});


//logout user
router.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 

//change password
router.post('/api/change_password',auth,function(req,res){
    User.findOne({'email':req.body.email},function(err,user){
        if(!user) return res.json({isAuth : false, message : 'Auth failed ,email not found'});

        user.comparepassword(req.body.oldpassword,(err,isMatch)=>{
            if(!isMatch) return res.json({ isAuth : false,message : "old password doesn't match"});

            if(req.body.password!=req.body.password2) return res.json({isAuth : true,message : "Password doesn't match"});

            else{
                user.changepassword(req.body.password,(err,user));
                res.json({
                    isAuth: true,
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.firstname + " " + req.user.lastname,
                    message: "password changed"
                    
                })
            }

        });
    });
});

//Reset Password
router.get('/api/reset_password', function(req, res){
    User.findOne({'email':req.body.email},function(err,user){
        if(!user) return res.json({isAuth : false, message : 'Auth failed ,email not found'});

        const code = Math.floor((Math.random() * 1000000) + 1);
        user.resetpasswordcode = code;
        user.save();

        const data = {
            from: "Mailgun Sandbox <postmaster@sandboxed48667ab2594a0f9c0eed9547e11cb5.mailgun.org>",
            to: "saket@blowhorn.net",
            subject: "Hello",
            text: "Testing some Mailgun awesomness!"
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });

        // request(options, function (error, response, body) {
        //     if (error) throw new Error(error);
          
        //     console.log(body);
        //   });
        // var client = new postmark.Client("b67a43f6-011d-41a4-a171-4d2db941ea14");

        // client.sendEmail({
        //     "From": "saketagrawal@iitkgp.ac.in",
        //     "To": "nitinkohli.dz@iitkgp.ac.in",
        //     "Subject": "Reset Password",
        //     "TextBody": "Your code for updating password is" + code + "./n" + "Go to /api/update_password to update your password."
        // });
        // test("try catch and read error", async () => {
        // try {
        //     await mailslurp.inboxController.sendEmailAndConfirm(
        //         'cool333saket333@gmail.com', 
        //         {to: [req.body.email],
        //         subject: "Password reset code",
        //         body: "Your code for updating password is" + code + "./n" + "Go to /api/update_password to update your password."
        //         }
        //     )
        //   } catch (e) {
        //     // handle the error and status code in your code
        //     // 404 is returned when emails cannot be found for a given condition for instance
        //     const message = await e.text();
        //     const statusCode = e.status;
        //     // test action
        //     expect(e.status).toEqual(400)
        //     expect(message).toContain("Invalid ID passed")
        //   }
        // })  

        // // const sentEmail =  mailslurp.inboxController.sendEmailAndConfirm(
        // //     "cool333saket333@gmail.com",
        // //     {
        // //       to: [req.body.email],
        // //       subject: "Password reset code",
        // //       body: "Your code for updating password is" + code + "./n" + "Go to /api/update_password to update your password.",
        // //     },
        // // );
    });
});
module.exports =router;