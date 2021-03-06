const express = require('express');
const path = require('path');

const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOveride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/reviews.js');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
   // useCreateIndex: true,
    useUnifiedTopology : true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"Connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});
const app = express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOveride('_method'));

const validateCampground = (req, res, next) =>{
   
    const {error} =campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
   // console.log(result);
}

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el =>el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

app.get('/',(req,res)=>{
    res.render('home')
});

app.get('/campgrounds',catchAsync(async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}));

app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
});

app.post('/campgrounds',validateCampground, catchAsync(async (req,res,next) =>{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
   
}))

app.get('/campgrounds/:id', catchAsync(async(req,res)=>{
    const campground= await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground});
}));

app.get('/campgrounds/:id/edit',catchAsync(async (req,res) =>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground});
}));

app.put('/campgrounds/:id',validateCampground,  catchAsync(async (req,res)=>{
   const {id} = req.params;
   const campground= await Campground.findByIdAndUpdate(id,{...req.body.campground})
   res.redirect(`/campgrounds/${campground._id}`)
    // res.send('IT Worked!!')
}));

app.delete('/campgrounds/:id',catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews',validateReview , catchAsync(async(req, res)=>{
    const campground=await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.all('*',(req, res, next) =>{
    //res.send("404!!!!")
    next(new ExpressError('Page Not Found', 404))
})

app.use((err,req, res, next)=>{
    const {statusCode = 500,message = 'Something went wrong'}= err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err})
   
})
// app.get('/makecampground',(req,res)=>{
//    //res.render('home')
//    const camp= new Campground({title : " My Backyard", description:'cheap camping'});
//    camp.save();
//    res.send(camp)
// })
app.listen(3000, () =>{
    console.log('Serving on port 3000')
})

