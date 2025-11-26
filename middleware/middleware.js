const redirectLogin = (req, res, next) => {
    console.log(req.session.userID);
    if (!req.session.userID) {
        res.redirect("../users/login") // redirect to the login page
    } else {
        next(); // move to the next middleware function
    }
}

module.exports = { redirectLogin };