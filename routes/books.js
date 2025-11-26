// Create a new router
const express = require("express")
const router = express.Router()

const { redirectLogin } = require('../middleware/middleware.js');

router.get('/search',function(req, res, next){
    res.render("search.ejs")
});

router.get('/search_result', function (req, res, next) {
    // searching in the database for the keyword from the search form
    let keyword = (req.query.search_text || '').trim();
    let like = '%' + keyword + '%';
    let sqlquery = "SELECT * FROM books WHERE name LIKE ?"; // adjust column name if different (e.g. title)
    // execute sql query
    db.query(sqlquery, [like], (err, result) => {
        if (err) {
            next(err)
        }
        else {
            res.render("searchresult.ejs", { searchResults: result, searchTerm: keyword })
        }
    });
});

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM books"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            res.render("list.ejs", {availableBooks: result})
        }
    });
});

router.get('/bargainbooks', function(req, res, next) {
    let sqlquery = "SELECT * FROM books WHERE price < 20"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            res.render("bargainbooks.ejs", {availableBooks: result})
        }
    });
});


// Export the router object so index.js can access it
module.exports = router
