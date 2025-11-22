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
- Protect the audit view with authentication/authorization.
- Consider adding IP/user-agent fields to audit records and implementing retention/archival for older logs.

## License / notes

- This is sample/demo code for learning purposes.
