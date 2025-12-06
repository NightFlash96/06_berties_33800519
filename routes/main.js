// Create a new router
const express = require("express");
const router = express.Router();
require('dotenv').config();

const { redirectLogin } = require('../middleware/middleware.js');

// Handle our routes
router.get('/',function(req, res, next){
    res.render('index.ejs')
});

router.get('/about',function(req, res, next){
    res.render('about.ejs')
});

router.get('/books/addbook', function (req, res, next) {
    res.render("addbook.ejs")
});

router.post('/bookadded', function (req, res, next) {
    let name = req.sanitize(req.body.name);
    let price = req.sanitize(req.body.price);
    //saving to the database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [name, price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send("This book has been added to the databse, name: "+ req.body.name + " price: "+ req.body.price)         
        }
    )
})

// This route displays the weather form
router.get('/weather', function (req, res, next) {
    res.render("weather.ejs", {weatherMsg: null, city: ""});
});

// This route sends the weather request to the API and displays the result
router.post('/weather', function (req, res, next) {
    const request = require('request');
    let apiKey = process.env.APIKEY;
    let city = req.sanitize(req.body.search_text) || "london";
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    request(url, function (err, response, body) {
        if(err){
            next(err);
        } else {
            // res.send(body);
            var weather = JSON.parse(body)

            if (weather!==undefined && weather!==undefined){
                var winfo =
                    "Temperature: " + weather.main.temp + " °C<br>" +
                    "Feels like: " + weather.main.feels_like + " °C<br>" +
                    "Humidity: " + weather.main.humidity + " %<br>" +
                    "Pressure: " + weather.main.pressure + " hPa<br>" +
                    "Visibility: " + weather.visibility + " meters<br>" +
                    "Wind Speed: " + weather.wind.speed + " m/s<br>";
                var windir = weather.wind.deg;

                res.render("weather.ejs", {weatherMsg: winfo, city: city});
            } else {
                res.render("weather.ejs", {weatherMsg: "City not found or API error.", city: city});
            }
        }
     });
})


router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./')
        }
        res.send('You have been logged out. <a href='+'./'+'>Home</a>')
    })
})

// Export the router object so index.js can access it
module.exports = router