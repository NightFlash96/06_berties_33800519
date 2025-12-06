// Create a new router
const express = require("express");
const router = express.Router();

router.get('/books', function (req, res, next) {
    // Extract query parameters
    const { search, minprice, maxprice, sort } = req.query;

    let sqlquery = "SELECT * FROM books WHERE 1 = 1";
    let params = [];

    // search by name
    if (search) {
        sqlquery += " AND name LIKE ?";
        params.push(`%${req.sanitize(search)}%`);
    }

    // filter by mininum price
    if (!isNaN(minprice)) {
        sqlquery += " AND price >= ?";
        params.push(req.sanitize(minprice));
    }

    // filter by maximum price
    if (!isNaN(maxprice)) {
        sqlquery += " AND price <= ?";
        params.push(req.sanitize(maxprice));
    }

    // sort results
    const allowedSort = ["price", "name"];
    if (sort && allowedSort.includes(sort.toLowerCase())) {
        sqlquery += ` ORDER BY ${sort}`;
    }

    // Execute the query
    db.query(sqlquery, params, (err, results) => {
        if (err) {
            res.json(err);
            next(err);
        } else {
            res.json(results);
        }
    });
});

// router.get('/books', function (req, res, next) {
//     // Check if there is a search query
//     if (req.query.search) {
//         // Sanitize the search term to prevent SQL injection
//         const searchTerm = `%${req.sanitize(req.query.search)}%`;

//         //Query the database to get the books that match the search term
//         let sqlquery = "SELECT * FROM books WHERE name LIKE ?"

//         db.query(sqlquery, [searchTerm], (err, results) => {
//             if (err) {
//                 res.json(err);
//                 next(err);
//             } else {
//                 res.json(results);
//             }
//         });
//     } else {
//         //Query the database to get all the books
//         let sqlquery = "SELECT * FROM books"

//         //Execute the query
//         db.query(sqlquery, (err, results) => {
//             //Return results as a JSON object
//             if (err) {
//                 res.json(err);
//                 next(err);
//             } else {
//                 res.json(results);
//             }
//         });
//     }
// });

// Export the router object so index.js can access it
module.exports = router