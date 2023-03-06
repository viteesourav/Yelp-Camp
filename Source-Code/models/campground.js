const mongoose = require('mongoose');
const Review = require('./review');
const schema = mongoose.Schema;

const campgroundSchema = new schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async(deletedDoc)=>{
   console.log("Triggering Campground post hook !!");
   console.log(deletedDoc);
   await Review.deleteMany({
        _id: {
            $in: deletedDoc.reviews
        }
   })
   console.log("All related Reviews Deleted !!!");
})

module.exports = mongoose.model('Campground', campgroundSchema);
