const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email : {
        type: String,
        required: true,
        unique: true
    }
});

//this is how you can add the passport required...
//This going to handle username and password
// and also provide some utitly methods like register and authenticate and others...
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);