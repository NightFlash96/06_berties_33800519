# Bertie's Books

A small Node.js/Express demo application used in a Dynamic Web Applications module.

## Key features
- Basic CRUD-style pages for books and users
- User registration and login (**passwords hashed with bcrypt**)
- Audit logging of login attempts (stored in the database)
- EJS server-side templates

## Tech stack
- Node.js + Express
- EJS for views
- MySQL (`mysql2` driver)
- `dotenv` for configuration

## API Integration

The application integrates with the **OpenWeatherMap API** to provide weather information. The weather feature is accessible via the `/weather` route:

- **GET /weather**: Displays the weather search form
- **POST /weather**: Accepts a city name from user input and fetches current weather data from the OpenWeatherMap API
  - The city parameter is sanitised using `req.sanitize()` before being sent to the API
  - The API response is parsed and displayed to the user with temperature, humidity, and other weather details
  - If the city is not found or the API returns an error, a user-friendly error message is displayed
  - The API key is stored securely in the `.env` file as `APIKEY` and accessed via `process.env.APIKEY`

### Books API

The application also includes an internal **Books REST API** (`routes/api.js`) that returns book data in JSON format. This API supports flexible filtering and sorting:

- **GET /api/books**: Returns all books or filtered results based on query parameters
  - `search` (optional): Filter by book name using pattern matching (e.g., `/api/books?search=fiction`)
  - `minprice` (optional): Filter books by minimum price (e.g., `/api/books?minprice=5`)
  - `maxprice` (optional): Filter books by maximum price (e.g., `/api/books?maxprice=20`)
  - `sort` (optional): Sort results by `price` or `name` (e.g., `/api/books?sort=price`)
  - Query parameters can be combined (e.g., `/api/books?search=novel&minprice=10&maxprice=50&sort=price`)

**SQL Injection Protection:**

The Books API is protected against SQL injection attacks through:

1. **Parameterised Queries**: All user-supplied values are passed as parameters (`?` placeholders) rather than concatenated into the SQL string. This ensures the database driver treats them as data, not executable SQL code.
2. **Input Sanitisation**: Each parameter is sanitised using `req.sanitize()` before being added to the parameter array, removing any potentially malicious content.
3. **Whitelist Validation for Sort**: The `sort` parameter is validated against an allowedlist of safe column names (`["price", "name"]`). Only if the sort value matches one of these allowed values is it used in the query, preventing column name injection attacks.

## Prerequisites
- Node.js (v14+ recommended)
- MySQL server

## Install

### **1) Install dependencies**

```
npm install
```

### **2) Create the database and tables**

The repository includes `create_db.sql` which creates the `berties_books` database and required tables (including the `audit` table). Run it from your MySQL client:

```
mysql -u root -p < create_db.sql
```

### **3) Configure environment variables (.env)**

Create a `.env` file in the project root (do NOT commit this file). Example:

```
# .env (example)
PORT=8000
DB_HOST=localhost
DB_USER=berties_books_app
DB_PASSWORD=your_db_password_here
DB_NAME=berties_books
DB_CONNECTION_LIMIT=10
```

## Configuration

### **dotenv**

The app uses `dotenv` to load the `.env` file at startup. In `index.js` the app calls:

```js
require('dotenv').config()
```

After loading, configuration values are accessed via `process.env` (for example `process.env.PORT`, `process.env.DB_HOST`, `process.env.DB_USER`, `process.env.DB_PASSWORD`, `process.env.DB_NAME`, and `process.env.DB_CONNECTION_LIMIT`). These values are used to set the server port and configure the MySQL connection pool.

## Audit logging

### **Schema**

The `create_db.sql` contains an `audit` table with these columns:

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `date` DATETIME NOT NULL
- `username` VARCHAR(50) NOT NULL
- `success` BOOLEAN NOT NULL
- `eventType` VARCHAR(50) NOT NULL

### **Routes / behavior**

- The login flow in `routes/users.js` inserts audit records on each login attempt, for example:
  - **incorrect username/email** — `eventType = 'incorrect username/email'`, `success = 0`
  - **incorrect password** — `eventType = 'incorrect password'`, `success = 0`
  - **successful login** — `eventType = 'login'`, `success = 1`
- The route `GET /users/audit` queries `SELECT * FROM audit` and renders `views/auditlog.ejs` so an admin can view audit entries.
- There is a commented helper `auditLog(username, success)` in `routes/users.js` showing a way to centralise the insert logic.

## Security notes

- **Passwords are hashed with `bcrypt`** (see `routes/users.js`).
- Avoid storing or returning plaintext passwords. The current `registered` handler returns the submitted password in the response; remove that in production.
- Keep `.env` out of version control and use secure credentials for the DB user.

## Authorisation, validation and sanitisation

- **Authorisation (session-based):** The app uses a small middleware helper `redirectLogin` in `middleware/middleware.js` that checks for `req.session.userID` and redirects unauthenticated users to the login page. This middleware is applied to routes that expose sensitive data or perform sensitive actions — specifically `GET /users/list`, `GET /users/audit`, `GET /books/list` and the logout route — to prevent unauthorised access to user lists, audit logs and user-specific actions.

- **Validation:** Registration input is validated using `express-validator` in `routes/users.js` (the `POST /users/registered` route). The checks include: `email` must be a valid email, `username` must be 3–50 characters, `password` must be at least 8 characters, and `first`/`last` name must be present. If validation fails the registration view is re-rendered — this keeps data consistent and helps prevent malformed records.

- **Sanitisation:** The project uses request sanitisation (`req.sanitize(...)`) before using user-supplied values in queries or rendering. Sanitisation is applied to registration/login fields, the book-add form (`POST /bookadded`), and the search input (`GET /books/search_result`) among others. In addition to sanitisation, all SQL queries use parameterised placeholders (`?`) which together reduce risks of XSS and SQL injection.

- **Why these pages:**
  - `users/list` and `users/audit`: contain personal or audit information and must be protected with authorisation.
  - `books/list` and logout: involve user-specific actions/state and are guarded to ensure only logged-in users can access them.
  - `POST /users/registered` and `POST /bookadded`: receive user input so they use validation + sanitisation to ensure correct and safe data is stored.
  - `GET /books/search_result` and `POST /users/loggedin`: user-supplied strings are sanitised to reduce XSS or dangerous content in output.

These controls are intentionally lightweight for the demo app: they provide a basic, clear separation between authenticated and public pages and demonstrate common validation/sanitisation patterns you can expand for production.

## Running the app

1. Ensure the DB exists and `.env` is configured.
2. Install dependencies: `npm install`.
3. Start the server:

```
node index.js
```

Open http://localhost:8000 (or the configured `PORT`).

## Viewing audit logs

- Visit: http://localhost:8000/users/audit to view audit entries (if records exist).

## Troubleshooting

- If the app cannot connect to the DB, check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`.
- If you see `ER_ACCESS_DENIED_ERROR`, ensure the DB user exists and has privileges for `berties_books`.

## Next steps / recommended improvements

- Remove plaintext password exposure in registration responses.
- Protect `users/audit` and `users/list` behind admin-only access.
- Harden session cookies and enforce HTTPS in production.
- Add CSRF protection and rate-limiting for login/submit routes.
- Improve input validation (including `price`) and enforce unique usernames/emails.
- Record IP/user-agent in audit logs and define a retention policy.

## License / notes

- This is sample/demo code for learning purposes.
