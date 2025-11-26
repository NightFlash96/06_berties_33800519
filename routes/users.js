// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { redirectLogin } = require('../middleware/middleware.js');
const { check, validationResult } = require('express-validator');

// function auditLog(username, success) {
//     db.query("INSERT INTO audit (username, datetime, success) VALUES (?, NOW(), ?)", [username, success], (err, result) => {
//         if (err) {
//             next(err)
//         }
//         else {
//             console.log('Failed login attempt logged. Wrong username/email.')
//         }
//     });
// }

router.get('/register', function (req, res, next) {
    res.render('register.ejs')
});

router.post('/registered', 
    [check("email").isEmail(),
    check("username").isLength({min: 3, max: 50}),
    check("password").isLength({min: 8}),
    check("first").isEmpty().not(),
    check("last").isEmpty().not()
    ],
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('./register')
        }
        else {
            // Hash
            // const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const plainPassword = req.sanitize(req.body.password);

            bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                // Store hashedPassword in your database.
                let username = req.sanitize(req.body.username);
                let firstname = req.sanitize(req.body.first);
                let lastname = req.sanitize(req.body.last);
                let email = req.sanitize(req.body.email);
                let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
                // execute sql query to insert user data
                db.query(sqlquery, [username, firstname, lastname, email, hashedPassword], (err, result) => {
                    if (err) {
                        next(err)
                    }
                    else {
                        result = 'Hello '+ firstname + ' '+ lastname +' you are now registered!  We will send an email to you at ' + email
                        result += 'Your password is: '+ plainPassword +' and your hashed password is: '+ hashedPassword
                        res.send(result)
                    }
                })
            })
        }
    }
); 

router.get('/list', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM users"; // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            // remove the password from the json object before rendering
            result.forEach(user => {
                delete user.hashedPassword;
            });
            console.log(result);
            res.render("listusers.ejs", {users: result})
        }
    });
});

router.get('/login', function (req, res, next) {
    res.render('login.ejs')
});

router.post('/loggedin', function (req, res, next) {
    let username = req.sanitize(req.body.username);
    let password = req.sanitize(req.body.password);
    let sqlquery = "SELECT hashedPassword FROM users WHERE username= ? OR email= ?"; // query database to get hashed password for the username/email
    // execute sql query
    db.query(sqlquery, [username, username], (err, result) => {
        if (err) {
            next(err)
        }
        else if (result.length === 0) { // if the username or email does not exist, send error message and log failed attempt
            res.send('Username or email not found.')
            console.log(result);
            db.query("INSERT INTO audit (username, datetime, success, eventType) VALUES (?, NOW(), 0, 'incorrect username/email')", [username], (err, result) => {
                if (err) {
                    next(err)
                }
                else {
                    console.log('Failed login attempt logged. Incorrect username/email.')
                }
            });
        }
        else { // else hash and compare the submitted password to the stored hashed password
            bcrypt.compare(password, result[0].hashedPassword, function(err, result) {
                if (err) {
                    next (err)
                }
                else if (result == true) { // if match, log successful attempt
                    req.session.userID = username; // create session variable
                    res.render('logged-in.ejs')
                    // res.send('You are now logged in!')
                    db.query("INSERT INTO audit (username, datetime, success, eventType) VALUES (?, NOW(), 1, 'login')", [username], (err, result) => {
                        if (err) {
                            next(err)
                        }
                        else {
                            console.log('Successful login attempt logged.')
                        }
                    });
                }
                else { // if the password does not match, log failed attempt due to incorrect password
                    res.send('Login failed, incorrect password.')
                    db.query("INSERT INTO audit (username, datetime, success, eventType) VALUES (?, NOW(), 0, 'incorrect password')", [username], (err, result) => {
                        if (err) {
                            next(err)
                        }
                        else {
                            console.log('Failed login attempt logged. Incorrect password.')
                        }
                    });
                }
            });    
        }
    });
});

router.get('/audit', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM audit"; // query database to get all the audit logs
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        else {
            console.log(result);
            res.render("auditlog.ejs", {auditlogs: result})
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;
