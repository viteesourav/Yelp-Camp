//requiring the cloudinary and multer-storage-cloudianry
const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');

//configuring the cloudinary account
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//now setting the folder path for the cloudinary storage..
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'CampGrounds',
        allowedFormats: ['jpg', 'png']
    }
})

//exporting cloudinary and storage
module.exports = {
    cloudinary,
    storage
}
