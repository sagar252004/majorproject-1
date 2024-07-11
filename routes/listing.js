const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConflig.js");
const upload = multer({storage});

router
   .route("/")
   .get(wrapAsync(listingController.index))
   .post(
       isLoggedIn,
       validateListing,
       upload.single("listing[image]"),
       wrapAsync(listingController.createListing)
    );

// create(new) Route
router.get("/new", isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put( 
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
         wrapAsync(listingController.deleteListing)
    )

    
    
     
// // index route
// router.get("/", wrapAsync(listingController.index));



//show (Read) Route


// create Route
// router.post("/",
//     validateListing,
//     isLoggedIn, 
//     wrapAsync(listingController.createListing));

// edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
     wrapAsync(listingController.renderEditForm));

// update Route
// router.put(
//     "/:id", 
//     isLoggedIn,
//     isOwner,
//     validateListing,
//     wrapAsync(listingController.updateListing));

// Delete Route
// router.delete("/:id",
//     isLoggedIn,
//     isOwner,
//      wrapAsync(listingController.deleteListing));

module.exports = router;