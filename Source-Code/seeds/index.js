//The Role of the seed file is to put dummy data in the DB for testing...
//NOTE: Run this file seperately..
const mongoose = require('mongoose');
mongoose.set('strictQuery', true); //suppress the warning...

//requiring custom files from the working directory
const Campground = require('../models/campground.js');
const location = require('./cities.js');
const {descriptors, places} = require('./seedHelpers.js');

//mongoose configurations...
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(()=>{
        console.log("Successfully connected to the MongoDB");
    })
    .catch(()=>{
        console.log('error while connecting to the DB');
    })

//new function, return a random value from the passed array
const returnRand = arr => arr[Math.floor(Math.random()* arr.length)];

//here we will write a async function, and call it to clear the db and then insert fresh records for testing..
const dbSeed = async() =>{
    await Campground.deleteMany({}); //Delete all the existing data from the DB.
    //insert a dummy data..
    // const camp = new Campground({title: "testCamp", description: "myPlace"});
    // await camp.save();
    //Lets create bunch of random Data in the db...
    for(let i=0;i<50;i++) {
        let rand = Math.floor(Math.random()*1000);
        let newPlace = `${location[rand].city}, ${location[rand].state}`;
        let newTitle =  `${returnRand(descriptors)} ${returnRand(places)}`;
        let newCamp = new Campground({
            title: newTitle, 
            location: newPlace,
            author: '64457c2b30ab23cb4dadf190',  //This id is taken directly from DB, We have an user with this ID already present in User database in Yelp-camp.
            image: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw0ODMyNTF8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=60',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde consectetur minima reprehenderit illo repellat? Voluptatem iure ratione animi culpa corrupti et, libero eligendi accusantium voluptate deserunt! Eius, non. Tenetur, eaque?',
            price: Math.floor(Math.random() * 20) + 10
        });
        await newCamp.save();
    }
}
//Executing the above fucntion...
dbSeed()
    .then(()=>{
        console.log("Seed Data successful, Closing the connection !");
        mongoose.connection.close();
    })