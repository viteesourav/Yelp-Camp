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

//Handling the visiblity of Virtuals keys [Default false, we are making it true..]
const schemaOptions = {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals:true
    }

}

const campgroundSchema = new schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
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
},schemaOptions);

//Virtual Property to handle the 'properties' key needed for cluster map by map-box
campgroundSchema.virtual('properties').get(function() {
    return {
        id: `${this._id}`,
        title: `${this.title}`,
        imgUrl: `${this.images[0].url}`
    }
})

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
