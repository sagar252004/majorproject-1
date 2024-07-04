const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");


const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
        if(error){
            let errMSg = error.details.map((el)=> el.message).join(",");
            throw new ExpressError(400,errMsg);
        }else{
            next();
        }
};
// index route
router.get("/", wrapAsync(async (req,res)=>{
    const allListings = await Listing.find({});
    // console.log(allListings);
    return res.render("listings/index.ejs", {allListings});
}));

// create(new) Route
router.get("/new", isLoggedIn, (req,res)=>{
    
     res.render("listings/new.ejs");
});

//show (Read) Route
router.get("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    return res.render("listings/show.ejs", {listing});
}));

// create Route
router.post("/",
    validateListing,
    isLoggedIn, 
    wrapAsync(async (req,res,next,err)=>{
        // let result = listingShema.validate(req.body);
        // if(result.error){
        //     throw new ExpressError(400,result.error);
        // } 
        let newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
        if(err)
            next(err);
    })
);

// edit Route
router.get("/:id/edit",isLoggedIn,
     wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing doesnot exist!");
        res.redirect("/listings");
    }
     res.render("listings/edit.ejs",{listing});
}));

// update Route
router.put("/:id", 
    validateListing,
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

// Delete Route
router.delete("/:id",isLoggedIn,
     wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;