// Create a new router
const express = require("express")
const router = express.Router()

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
    //saving to the database
    let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)"
    // execute sql query
    let newrecord = [req.body.name, req.body.price]
    db.query(sqlquery, newrecord, (err, result) => {
        if (err) {
            next(err)
        }
        else
            res.send("This book has been added to the databse, name: "+ req.body.name + " price: "+ req.body.price)         
        })
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