const mongoose = require('mongoose');
const schema = mongoose.Schema;

const reviewSchema = new schema({
    body: String,
    ratings: Number
});

module.exports = mongoose.model('Review', reviewSchema);
