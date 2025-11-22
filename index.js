// Import express, ejs, mysql2, path, and dotenv modules
var express = require ('express')
var ejs = require('ejs')
var mysql = require('mysql2')
const path = require('path')
require('dotenv').config()

// Create the express application object
const app = express()
const port = process.env.PORT || 8000

// Define the database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST ||'localhost',
    user: process.env.DB_USER || 'berties_books_app' ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'berties_books',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
});
global.db = db;

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

// Set up public folder (for css and static js)
app.use(express.static(path.join(__dirname, 'public')))

// Define our application-specific data
app.locals.shopData = {shopName: "Bertie's Books"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /books
const booksRoutes = require('./routes/books')
app.use('/books', booksRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))