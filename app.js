const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const MONGO_URL= "mongodb://127.0.0.1:27017/airbnb";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/reviews.js");



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

const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMSg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};

const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
        if(error){
            let errMsg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};
app.get("/",(req,res)=>{
    res.send("I'm root");
});
//index Route
app.get("/listings", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    // console.log(allListings);
    return res.render("listings/index.ejs", {allListings});
}));

// create(new) Route
app.get("/listings/new",(req,res)=>{
     res.render("listings/new.ejs");
});

//show (Read) Route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    return res.render("listings/show.ejs", {listing});
}));

// create Route
app.post("/listings",
    validateListing, 
    wrapAsync(async (req,res,next,err)=>{
        // let result = listingShema.validate(req.body);
        // if(result.error){
        //     throw new ExpressError(400,result.error);
        // } 
        let newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
        if(err)
            next(err);
    })
);

// edit Route
app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     res.render("listings/edit.ejs",{listing});
}));

// update Route
app.put("/listings/:id", 
    validateListing,
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    res.redirect("/listings");
}));

// Reviews
// post
app.post("/listings/:id/reviews",
    validateReview,
    wrapAsync(async (req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    return res.redirect(`/listings/${listing._id}`);
}));

// Delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async (req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull:{reivews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))





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



