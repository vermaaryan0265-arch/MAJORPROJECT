const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}




const express = require("express");
const app=express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
//const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema,reviewSchema} =require("./schema.js");
// const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
console.log("MongoStore:", typeof MongoStore.create);
const flash = require("connect-flash");


const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// const session = require("express-session");
// const flash = require("connect-flash");

//connect database

 const dbUrl = process.env.ATLASDB_URL;


main()
.then(() => {
    console.log("connected to DB");
})
.catch(err => {
    console.log(err);
}
    );


async function main(){
    await mongoose.connect(dbUrl);
};



//ejs setup
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
 //app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// app.use("/listings/:id/reviews", reviewsRouter);

// const store = MongoStore.create({
//     mongoUrl:dbUrl,
//     crypto: {
//         secret:"mysupersecretcode",
//     },
//     touchAfter:24 * 3600,
// });
// store.on("error",()=>{
//     console.log("ERROR IN MONGO SESSION STORE",err);
// });
const store = MongoStore.create({
    mongoUrl: dbUrl,
    // crypto: {
    //     secret: process.env.SESSION_SECRET,
    // },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    },
};





//ROUTE CREATED
// app.get("/",(req,res) => {
//     res.send("hi i am root");
// });



app.use(session(sessionOptions));
app.use(flash());


// app.use((req,res,next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     console.log("req.user:", req.user);
//     res.locals.currUser = req.user;
//     next();
// });


// app.use("/listings",listingRouter);
// app.use("/listings/:id/review",reviewsRouter);
// app.use("/", userRouter );





//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log("req.user:", req.user);
    res.locals.currUser = req.user;
    next();
});


//middleware
app.use((err,req,res,next) => {
    let {statusCode=500,message="something went wrong!"} = err;
    //res.status(statusCode).send(message);
   // res.send("something went wrong!");
   res.render("error.ejs",{message});
});


app.use("/listings",listingRouter);
app.use("/listings/:id/review",reviewsRouter);
app.use("/", userRouter );



app.listen(8080,() => {
    console.log("server is listening to port 8080");
});





























// <!-- <% if( currUser && currUser._id.equals(listing.owner._id)){ %>  -->





// //Index.Route
// app.get("/listings",wrapAsync( async(req,res) => {
//    const allListings = await Listing.find({});
//    res.render("listings/index",{ allListings });
//     }));


// //new Route
// app.get("/listings/new",(req,res) => {
//     res.render("listings/new.ejs");
// });



// //Show Route
// app.get("/listings/:id",wrapAsync (async(req,res,next) => {

//         let{id} = req.params;
//         const listing=await Listing.findById(id).populate("reviews");
//         res.render("listings/show.ejs", {listing});
    
   
  
// }));

// // //Create Route
// app.post("/listings",wrapAsync(async(req,res,next) =>
// {     
//     //  let result= listingSchema.validate(req.body);
//     //  console.log(result);
        
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         res.redirect("/listings");
    
    
// })
// );


// //Edit Route
// app.get("/listings/:id/edit",wrapAsync (async (req,res) => {
//     let{id} =req.params;
//     const listing = await Listing.findById(id);
//        res.render("listings/edit.ejs",{ listing });
     
// }));


// //Update Route
// app.put("/listings/:id",wrapAsync( async (req,res) => {
//     let{id} = req.params;
//    await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));

// //Delete Route
// app.delete("/listings/:id" ,wrapAsync( async(req,res) => {
//      let {id} = req.params;
//      let deletedListing =await Listing.findByIdAndDelete(id);
//      console.log(deletedListing);
//      res.redirect("/listings");

// }
// ));

//demo user
// app.get("/demouser",async (req,res) => {
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });

//      let registeredUser = await User.register(fakeUser,"helloworld");
//      res.send(registeredUser);
// });




// //Review Route
// //Post Route Create
// app.post("/listings/:id/review",validateReview,wrapAsync(async(req,res) =>{

//      let listing = await Listing.findById(req.params.id);
//      let newReview = new Review(req.body.review);

//      listing.reviews.push(newReview);
//      await newReview.save();
//      await listing.save();

//      res.redirect(`/listings/${listing._id}`);
// }));
// //Delete Reviews Route
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res) => {
   
//     let {id,reviewId} = req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);
   

//     res.redirect(`/listings/${id}`);
// }));

// app.get("/testListing",async (req,res) => {
//     let sampleListing = new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");

// });

// app.all("*",(req,res,next) =>{
//     next(new ExpressError(404,"Page Not Found"));
// });
