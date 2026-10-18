# COMP3123 Assignment 1 – Secure Employee Management REST API

**Student:** Tanzeem Shaikh (101585484)

Node.js + Express + MongoDB REST API with JWT authentication, per-user employee ownership, input validation, Helmet, rate limiting, local logging, and a health check.

- **Live API:** https://101585484-comp-3123-assignment1.vercel.app
- **Health check:** https://101585484-comp-3123-assignment1.vercel.app/health

## Technologies
Node.js, Express 4, MongoDB Atlas, Mongoose, bcryptjs, jsonwebtoken, express-validator, helmet, express-rate-limit, winston, dotenv, nodemon, Vercel

## Project Structure
```
server.js                 Entry point (local listen / Vercel export)
src/app.js                Express app, middleware and routes
src/config/               env.js (environment variables), db.js (MongoDB connection)
src/models/               User.js, Employee.js (Mongoose schemas)
src/routes/               health, user, employee routers
src/controllers/          Request handlers
src/services/             token.service.js (JWT), employee.service.js (ownership check)
src/middleware/           auth (JWT), rateLimiter, requestLogger, errorHandler
src/validators/           express-validator rules
src/utils/                logger, AppError, asyncHandler
logs/                     Local log files (sample.log committed)
postman/                  Postman collection
```

## Installation
1. Clone: `git clone https://github.com/Tanzeem240/101585484_COMP3123_Assignment1.git`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. MongoDB: use a MongoDB Atlas cluster (or local MongoDB). The database name is `comp3123_assignment1`
5. Start: `npm run dev` (development) or `npm start`
6. Test: import `postman/COMP3123_Assignment1.postman_collection.json` into Postman. Run **Signup** then **Login** first; tokens and IDs are saved automatically to collection variables.

## Environment Variables
| Variable | Description |
|---|---|
| `PORT` | Local port (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |

The real `.env` file is listed in `.gitignore` and is never committed.

## API Endpoints
| # | Method | Endpoint | Auth | Success |
|---|---|---|---|---|
| – | GET | `/health` | No | 200 |
| 1 | POST | `/api/v1/user/signup` | No | 201 |
| 2 | POST | `/api/v1/user/login` | No | 200 |
| 3 | GET | `/api/v1/emp/employees` | Bearer | 200 |
| 4 | POST | `/api/v1/emp/employees` | Bearer | 201 |
| 5 | GET | `/api/v1/emp/employees/{eid}` | Bearer | 200 |
| 6 | PUT | `/api/v1/emp/employees/{eid}` | Bearer | 200 |
| 7 | DELETE | `/api/v1/emp/employees?eid={eid}` | Bearer | 204 |

**Signup body:** `{ "username", "email", "password" }`. The password must be 8–64 characters with at least one letter and one number.

**Login body:** `{ "username" or "email", "password" }`. Returns a JWT in `token`.

**Employee body:** `first_name`, `last_name`, `email`, `position`, `salary` (positive number), `date_of_joining` (YYYY-MM-DD), `department`. For PUT, all fields are optional, but at least one is required.

## Authentication
1. **Signup** creates a user. The password is hashed before saving.
2. **Login** with username or email + password returns a signed JWT (HS256, with expiry).
3. The client sends the token on every employee request:
   `Authorization: Bearer <token>`
4. The `auth` middleware checks the header format, verifies the signature and expiry, and confirms the user still exists. It then sets `req.user`.
5. Missing, invalid, or expired tokens return **401**.

## Authorization (Employee Ownership)
Each employee document stores a `user` field (ObjectId referencing `User`) for the user who created it.
- The owner is always taken from the **verified JWT**, never from the request body. Sending `user` or `_id` in the body is rejected with 400, and only whitelisted fields are saved.
- **List:** the database query is filtered by `{ user: req.user.id }`, so other users' employees are never returned.
- **Get / Update / Delete:** the employee is loaded and its `user` is compared with `req.user.id`. A non-existent employee returns **404**; another user's employee returns **403**. Delete also filters by both `_id` and `user`.
- Changing `eid` in the URL or query string therefore cannot expose or modify another user's data. This was tested with two users (User A and User B) in both directions.

## Security
- **Password hashing:** bcrypt (12 salt rounds) in a Mongoose pre-save hook. The password field uses `select: false` and is removed from all JSON responses.
- **JWT:** signed with `JWT_SECRET` (from environment variables), with an expiry. Tokens are never logged.
- **Helmet:** sets HTTP security headers such as `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, and `Referrer-Policy`, and removes `X-Powered-By`. This helps protect against XSS, clickjacking, MIME sniffing, and information leakage.
- **Rate limiting:** limits how many requests a client (by IP) can make in a time window, slowing down brute-force password guessing and abuse.
  - `POST /api/v1/user/signup` and `POST /api/v1/user/login`: **10 requests per 15 minutes** per IP
  - All `/api` routes: **100 requests per 15 minutes** per IP
  - When the limit is exceeded, the API returns **429 Too Many Requests** with `{ "status": false, "message": "Too many authentication attempts. Try again in 15 minutes." }` and standard `RateLimit` headers. The event is logged as a warning.
  - Tested by sending repeated login requests until a 429 was returned.
- **Input validation:** express-validator checks required fields, string lengths, email format, positive numeric salary, ISO dates, and MongoDB ObjectIds. JSON bodies are limited to 10kb, and malformed JSON returns 400.
- **Environment variables:** all secrets are stored in `.env` (not committed). `.env.example` shows the required keys without real values.

## Error Handling
A centralized error handler returns consistent JSON: `{ "status": false, "message": "...", "errors": [...] }`. Stack traces and internal details are never sent to the client.

| Code | When |
|---|---|
| 200 | Successful read/update/login |
| 201 | User or employee created |
| 204 | Employee deleted |
| 400 | Validation error, invalid ID, malformed JSON |
| 401 | Missing, invalid, or expired token; invalid credentials |
| 403 | Employee belongs to another user |
| 404 | Employee or route not found |
| 409 | Duplicate username or email |
| 429 | Rate limit exceeded |
| 500 | Unexpected server error (details logged on the server only) |

## Logging
- Uses **winston**. Logs are written as JSON to `logs/app.log` (all levels) and `logs/error.log` (errors only). On Vercel, logs go to `/tmp/logs` and the console (viewable in Vercel Logs).
- **Logged:** timestamp, HTTP method, path, status code, response time, client IP, user ID, server startup, DB connection, signups, login success/failure, employee create/update/delete, validation failures, authorization failures, rate-limit hits, and errors.
- **Never logged:** request bodies, passwords, JWTs, the Authorization header, the JWT secret, or database credentials.
- `logs/sample.log` contains a sample of real log output. The full log files are excluded by `.gitignore`.

## Health Check
`GET /health` returns **200**:
```json
{
  "status": true,
  "message": "API is running",
  "environment": "production",
  "uptime_seconds": 94,
  "timestamp": "2026-10-18T22:17:53.760Z",
  "database": { "name": "comp3123_assignment1", "state": "connected" }
}
```

## Test Credentials (non-sensitive, for marking)
| User | Username | Email | Password |
|---|---|---|---|
| A | usera | usera@test.com | Password123 |
| B | userb | userb@test.com | Password123 |