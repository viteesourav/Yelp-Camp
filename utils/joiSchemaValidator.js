const BasedJoi = require('joi'); //Js schema validator tool
const santizeHTML = require('sanitize-html');  //This santize the String..

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.santizeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        santizeHTML: {
            validate(value, helpers) {
                const clean = santizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                //check if after santization the value changes ?
                if(clean !== value) return helpers.error('string.santizeHTML', {value});
                return clean; //If the value is allowed.
            }
        }
    }
});

const Joi = BasedJoi.extend(extension); // Include the custom extension method.

module.exports.campgroundSchema = Joi.object({
    campground : Joi.object({
        title: Joi.string().required().santizeHTML(),   //using custom santize method here..
        price: Joi.number().integer().min(0).required(),
        description: Joi.string().required().santizeHTML(),
        // image: Joi.string().required(),
        location: Joi.string().required().santizeHTML(),
    }).required(),
    deleteImgList: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        ratings: Joi.number().integer().min(1).max(5).required(),
        body: Joi.string().required().santizeHTML()
    }).required()
});