// Create a new router
const express = require("express");
const router = express.Router();

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

router.get('/weather', function (req, res, next) {
    const request = require('request');
    let apiKey = "e888d6e17e402124969b351c1535b04b";
    let city = "london";
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    
    request(url, function (err, response, body) {
        if(err){
            next(err);
        } else {
            // res.send(body);
            var weather = JSON.parse(body)
            var wmsg = "It is "+ weather.main.temp +
            " degrees Celsius in " + weather.name + 
            "! <br> The humidity now is: " +
            weather.main.humidity;
            res.send(wmsg);z
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