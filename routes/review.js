const express = require("express");
const router = express.Router( { mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


//Review Route
//Post Route Create
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//Delete Reviews Route
router.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.deleteReview));


module.exports = router;





