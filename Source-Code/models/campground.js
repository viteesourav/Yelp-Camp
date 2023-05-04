const mongoose = require('mongoose');
const Review = require('./review');
const schema = mongoose.Schema;

//defining one virtual keyword that handles and manipulate the images from cloudinary...
const ImageSchema = new schema({     
    url: String,
    filename: String
});
//Virtual property can only be implemented inside a Schema...
ImageSchema.virtual('thumbnail_img').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const campgroundSchema = new schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: schema.Types.ObjectId,
        ref: 'User'
    },
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
