if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const MONGO_URL= "mongodb://127.0.0.1:27017/airbnb";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
// const {listingSchema,reviewSchema} = require("./schema.js");
// const Review = require("./models/reviews.js");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const {User} = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


main().then(()=>{
    console.log("connected to DB");
}).catch((err) =>{
    console.log("err");
})

async function main(){
    await mongoose.connect(MONGO_URL);

}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOption = {
    secret: "sagar@2004",
    resave: false,
    saveUninitialized:true,
    Cookie:{
        expires : Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
        httpOnly : true
    },

};

// app.get("/",(req,res)=>{
//     res.send("I'm root");
// });

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(( req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student",
//     });
//     let newUser = await User.register(fakeUser,"helloworld");
//     res.send(newUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


// app.get('/testListing', async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:1200,
//         location: "yalahanka , Bengaluru",
//         country: "BHARAT"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });
app.all("*",(req,res,next)=>{
    next(new ExpressError(404 , "Page not found!"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500 , message="something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("listings/error.ejs",{message});
});

app.listen(8080,()=>{
    console.log("server is listening ");
});



