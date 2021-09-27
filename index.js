const express=require('express');
const mongoose= require('mongoose');
const cookieParser=require('cookie-parser');
const db=require('./config/config').get(process.env.NODE_ENV);
const userRouter=require('./router/user');
const eventRouter=require('./router/event');

const app=express();
// app use
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(cookieParser());
app.use(userRouter);
app.use(eventRouter);

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});

app.get('/',function(req,res){
    res.status(200).send(`Welcome to "EMS" api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});

