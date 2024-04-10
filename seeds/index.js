const mongoose = require("mongoose");
const path = require("path");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 100; i++)  {
    const random1000 = Math.floor(Math.random() * 1000) + 1; 
    const camp = new Campground({
      author: '660951a9fc6230c0e500a0a8',
      location: `${sample(cities).city}, ${sample(cities).state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price: Math.floor(Math.random() * 30) + 10,
      images:[
        {
          url: 'https://res.cloudinary.com/dm7npx4mj/image/upload/v1712128555/cld-sample-2.jpg',
          filename: 'cc'
        }
      ],
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit.Exercitationem impedit, saepe tempore hic amet laudantium sed deserunt provident officiis.Odit, libero quaerat aliquid amet deserunt alias suscipit voluptas pariatur accusamus.'
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
})
