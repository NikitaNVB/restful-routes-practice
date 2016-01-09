var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX -  Display a list of all campgrounds
router.get("/", function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if (err){
           console.log(err);
       } else {
           res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
       }
    });
});

//CREATE - Adds new stuff to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author: author};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
       if (err){
           console.log(err);
       } else {
            req.flash("success", "Created the " + newlyCreated.name + " post!")
            res.redirect("/campgrounds");
       }
    });
    //redirect back to campgrounds page
   
});

//NEW - Display a form to add to the DB
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new"); 
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    // find the campground wit the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if (err){
           console.log(err);
       } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
       }
    });
    
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   // find and update the correcct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if (err){
           req.flash("error", "Something went wrong!");
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere (show page)
           req.flash("success", "Updated the post!");
           res.redirect("/campgrounds/" + req.params.id);
       }
   })
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;