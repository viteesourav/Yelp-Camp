const Joi = require('joi'); //Js schema validator tool

module.exports.campgroundSchema = Joi.object({
    campground : Joi.object({
        title: Joi.string().required(),
        price: Joi.number().integer().min(0).required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        location: Joi.string().required(),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        ratings: Joi.number().integer().min(1).max(5).required(),
        body: Joi.string().required()
    }).required()
});