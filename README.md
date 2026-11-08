# LAB 3 – REST API, QUERY PARAMETERS, VALIDATION AND DEBUGGING

**Course:** Backend Development Fundamentals  
**Student Name:** PANNALA HARSHAVARDHAN REDDY  
**Registration Number:** 252U1R1182  
**Section:** CSE-2D  
**Repository / Directory:** `backnd lab 3`

---

## 1. Project Objective

The primary objective of this laboratory assignment is to extend the SQLite Book Management API created in Lab 2 into a robust, secure, and production-grade RESTful API service. Key competencies developed and demonstrated in this lab include:
- Implementing strict RESTful design patterns using resource-oriented nouns and standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- Handling complex multi-criteria filtering with **Query Parameters** (partial title search via SQL `LIKE`, dynamic multi-column sorting, ascending/descending order, pagination via `LIMIT` and `OFFSET`, and price range filtering).
- Safeguarding the application against **SQL Injection** using parameterized SQL queries with `?` placeholders and column/keyword whitelisting.
- Implementing robust **POST body validation** with clear error responses and proper HTTP status code signaling (`200`, `201`, `400`, `404`, `500`).
- Diagnosing and systematically resolving fundamental backend errors (`EADDRINUSE`, bad imports, `no such table`, missing `await`).
- Constructing an automated test harness and a structured Postman collection with comprehensive test coverage.

---

## 2. Technologies Used

- **Runtime Environment:** Node.js (v24 LTS)
- **Web Framework:** Express.js (v4.x)
- **Database Engine:** SQLite 3 (embedded relational database)
- **Database Drivers:**
  - `sqlite3`: Native SQLite3 driver for Node.js.
  - `sqlite`: Modern Promise-based asynchronous wrapper facilitating clean `async/await` syntax.
- **API Testing & Verification:** Postman & Built-in Node.js Automated Test Harness (`testAll.js`).

---

## 3. Database Schema & Architecture

The application uses an embedded SQLite database (`database.db`) with a table named `book`.

### SQL Definition (`database.sql`)
```sql
CREATE TABLE IF NOT EXISTS book (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price INTEGER NOT NULL,
  pages INTEGER DEFAULT 0
);
```

### Initial Seed Records (10 Books)
| ID | Title | Author | Price (₹) | Pages |
|:--:|---|---|:---:|:---:|
| 1 | Clean Code | Robert C. Martin | 650 | 464 |
| 2 | The Pragmatic Programmer | Andrew Hunt, David Thomas | 799 | 352 |
| 3 | JavaScript: The Good Parts | Douglas Crockford | 450 | 176 |
| 4 | You Don't Know JS: Scope & Closures | Kyle Simpson | 399 | 98 |
| 5 | Design Patterns | Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides | 899 | 395 |
| 6 | Introduction to Algorithms | Thomas H. Cormen | 1250 | 1312 |
| 7 | Node.js Design Patterns | Mario Casciaro | 720 | 520 |
| 8 | Head First Design Patterns | Eric Freeman, Elisabeth Robson | 680 | 694 |
| 9 | Refactoring | Martin Fowler | 850 | 448 |
| 10 | Eloquent JavaScript | Marijn Haverbeke | 550 | 472 |

---

## 4. Installation & Setup Instructions

### Step 1: Install Dependencies
Open PowerShell or command prompt inside the project folder:
```bash
npm install
```

### Step 2: Initialize Database
To create the database and seed the 10 initial records:
```bash
npm run init-db
```

### Step 3: Start the Backend Server
```bash
npm start
```
The server will start listening at `http://localhost:3000`.

### Step 4: Run Automated Verification Suite
To run all 19 automated tests validating queries, validation rules, status codes, and database modifications:
```bash
npm run test-api
```

---

## 5. REST API Endpoints Specification

All endpoints follow strict RESTful naming conventions using nouns representing resources.

| HTTP Method | Endpoint | Description | Request Body | Success Code | Error Codes |
|---|---|---|---|:---:|:---:|
| `GET` | `/books` | Retrieve books with optional query parameters (search, sort, pagination, price filter) | None | `200 OK` | `400 Bad Request`, `500 Internal Server Error` |
| `GET` | `/books/:bookId` | Retrieve a single book by primary key ID | None | `200 OK` | `404 Not Found`, `500 Internal Server Error` |
| `POST` | `/books` | Create and insert a new book record | JSON object (`title`, `author`, `price`, `pages`) | `201 Created` | `400 Bad Request`, `500 Internal Server Error` |
| `PUT` | `/books/:bookId` | Update an existing book's details | JSON object (`title`, `author`, `price`, `pages`) | `200 OK` | `400 Bad Request`, `404 Not Found`, `500 Internal Server Error` |
| `DELETE` | `/books/:bookId` | Remove a book permanently from database | None | `200 OK` | `404 Not Found`, `500 Internal Server Error` |

---

## 6. Query Parameters for `GET /books`

The `GET /books` endpoint supports rich filtering, ordering, and pagination via query parameters. All parameters have sensible defaults and operate individually or in combination.

| Parameter | Type | Default Value | Description | SQL Implementation |
|---|---|---|---|---|
| `search_q` | String | `""` (no filter) | Case-insensitive partial book title search | `WHERE title LIKE ?` with `'%search_q%'` |
| `order_by` | String | `"id"` | Column to sort records by (`id`, `title`, `author`, `price`, `pages`) | Whitelisted identifier interpolation |
| `order` | String | `"ASC"` | Sorting direction (`ASC` or `DESC`) | Whitelisted keyword interpolation |
| `limit` | Integer | `10` | Maximum number of books returned | `LIMIT ?` |
| `offset` | Integer | `0` | Number of records to skip from beginning | `OFFSET ?` |
| `min_price` | Number | *None* | Minimum price boundary | `WHERE price >= ?` |
| `max_price` | Number | *None* | Maximum price boundary | `WHERE price <= ?` |

### Security Measures: Preventing SQL Injection
1. **Parameterized Queries (`?` placeholders):** User-supplied filter values (`search_q`, `min_price`, `max_price`, `limit`, `offset`) are passed directly through SQLite parameterized arrays, neutralizing quote-escaping and injection vectors.
2. **Whitelist Validation:** SQL column identifiers (`order_by`) and sort directions (`order`) cannot be passed via `?` in SQLite. To prevent injection, the code validates them against strict whitelists:
   - Allowed columns: `['id', 'title', 'author', 'price', 'pages']` (falls back to `'id'`)
   - Allowed directions: `['ASC', 'DESC']` (falls back to `'ASC'`)

---

## 7. Example API Requests & Responses

### 7.1 GET All Books (Default)
**Request:**
```http
GET http://localhost:3000/books
```
**Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 650,
    "pages": 464
  },
  ...
]
```

### 7.2 GET Books with Partial Title Search
**Request:**
```http
GET http://localhost:3000/books?search_q=Design
```
**Response (`200 OK`):** Returns only the 3 books containing "Design" in the title (*Design Patterns*, *Node.js Design Patterns*, *Head First Design Patterns*).

### 7.3 GET Books Sorted by Price Ascending
**Request:**
```http
GET http://localhost:3000/books?order_by=price&order=ASC
```
**Response (`200 OK`):** Returns books sorted starting from ₹399 up to ₹1250.

### 7.4 GET Books with Pagination
**Request:**
```http
GET http://localhost:3000/books?limit=3&offset=2
```
**Response (`200 OK`):** Returns 3 records starting from book ID 3.

### 7.5 GET Books with Combined Query Parameters
**Request:**
```http
GET http://localhost:3000/books?search_q=Design&order_by=price&order=ASC&limit=5&offset=0&min_price=600&max_price=900
```
**Response (`200 OK`):**
```json
[
  {
    "id": 8,
    "title": "Head First Design Patterns",
    "author": "Eric Freeman, Elisabeth Robson",
    "price": 680,
    "pages": 694
  },
  {
    "id": 7,
    "title": "Node.js Design Patterns",
    "author": "Mario Casciaro",
    "price": 720,
    "pages": 520
  },
  {
    "id": 5,
    "title": "Design Patterns",
    "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    "price": 899,
    "pages": 395
  }
]
```

### 7.6 POST Create a Valid Book
**Request:**
```http
POST http://localhost:3000/books
Content-Type: application/json

{
  "title": "Mastering Node.js & SQLite",
  "author": "P. Harshavardhan Reddy",
  "price": 599,
  "pages": 320
}
```
**Response (`201 Created`):**
```json
{
  "message": "Book created successfully",
  "book": {
    "id": 11,
    "title": "Mastering Node.js & SQLite",
    "author": "P. Harshavardhan Reddy",
    "price": 599,
    "pages": 320
  }
}
```

### 7.7 POST Invalid Request (Missing Title)
**Request:**
```http
POST http://localhost:3000/books
Content-Type: application/json

{
  "author": "P. Harshavardhan Reddy",
  "price": 599
}
```
**Response (`400 Bad Request`):**
```json
{
  "message": "Title is required and must be a non-empty string"
}
```

### 7.8 GET Non-Existing Book ID
**Request:**
```http
GET http://localhost:3000/books/999
```
**Response (`404 Not Found`):**
```json
{
  "message": "Book not found"
}
```

---

## 8. POST & PUT Body Validation Rules

The API applies strict server-side validation to reject malformed data before database execution:
1. **Title Validation:** Must be present, non-null, a string, and non-empty after trimming. If invalid, returns `400 Bad Request` with `{"message": "Title is required and must be a non-empty string"}`.
2. **Author Validation:** Must be present, non-null, a string, and non-empty after trimming. If invalid, returns `400 Bad Request` with `{"message": "Author is required and must be a non-empty string"}`.
3. **Price Validation:** Must be present, non-null, convertible to a valid number (`!isNaN(Number(price))`), and non-negative (`>= 0`). If invalid, returns `400 Bad Request` with `{"message": "Price is required and must be a valid number"}`.
4. **Pages Validation:** Optional; if provided, must be a non-negative integer.

---

## 9. HTTP Status Codes Followed

| Status Code | Meaning | Context Used in Project |
|:---:|---|---|
| `200 OK` | Standard success | Successful `GET` queries, successful `PUT` updates, and successful `DELETE` operations |
| `201 Created` | Resource created | Returned by `POST /books` upon successful database insertion |
| `400 Bad Request` | Client validation error | Missing or malformed request body fields (`title`, `author`, `price`) or invalid query parameters |
| `404 Not Found` | Resource not located | When requesting, updating, or deleting a book with a non-existent `bookId` |
| `500 Internal Server Error` | Unexpected failure | Server-side uncaught database exceptions |

---

## 10. Debugging Exercises & Solutions

During backend development, four critical errors were analyzed, understood, and permanently solved:

### Error 1: `EADDRINUSE` – Port Conflict
- **Why It Happens:** The operating system encounters two processes attempting to bind and listen on the same TCP port simultaneously (e.g. port 3000). A previously running Node process was left hanging in the background or another application is using the port.
- **How to Identify It:**
  ```text
  Error: listen EADDRINUSE: address already in use :::3000
      at Server.setupListenHandle [as _listen2] (node:net:1898:16)
  ```
- **How It Was Fixed:**
  1. Identified and terminated lingering background processes using PowerShell:
     ```powershell
     Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
     ```
  2. Implemented flexible environment variable fallback in `index.js`:
     ```javascript
     const PORT = process.env.PORT || 3000;
     ```
  3. Ensured `testAll.js` cleanly shuts down its server instance in a `finally` block via `server.close()`.

### Error 2: Wrong Import Path – Module Loading Error
- **Why It Happens:** Node.js CommonJS `require()` fails when the specified relative path is incorrect, misspelled, or references a non-existent file or directory.
- **How to Identify It:**
  ```text
  Error: Cannot find module './db' or 'Cannot find module '../initDb''
  code: 'MODULE_NOT_FOUND'
  ```
- **How It Was Fixed:**
  1. Verified file naming case-sensitivity and used `path.join(__dirname, ...)` for absolute resolution of local files:
     ```javascript
     const { initializeDatabase } = require("./initDb");
     const dbPath = path.join(__dirname, "database.db");
     ```
  2. Maintained clean project folder structure and validated exports (`module.exports = { app, initializeDbAndServer };`).

### Error 3: `no such table` – SQLite Table-Name Error
- **Why It Happens:** An SQL statement attempts to query, insert, or update a table that does not exist in the connected database file (e.g. querying `books` plural when the table was defined as `book` singular, or querying an uninitialized empty `.db` file).
- **How to Identify It:**
  ```text
  SqliteError: no such table: book
      code: 'SQLITE_ERROR'
  ```
- **How It Was Fixed:**
  1. Audited table names across SQL queries and `database.sql` to strictly match `book`.
  2. Built an automated schema creation step in `initializeDbAndServer()` so the `book` table is automatically created with `CREATE TABLE IF NOT EXISTS book (...)` before any route handles traffic.
  3. Provided `initDb.js` to initialize and verify table creation upfront.

### Error 4: Missing `await` – Asynchronous Database Operation Error
- **Why It Happens:** Database operations using `sqlite` / promise wrappers return Promises. If `await` is omitted before a call like `db.get()`, `db.all()`, or `db.run()`, the variable receives a pending `Promise` instead of the resolved data. Express then proceeds synchronously, attempting to evaluate `if (!book)` which evaluates to `false` (since a Promise object is truthy), causing incorrect logic, race conditions, or sending an empty object `{}` to the client.
- **How to Identify It:**
  Logging the variable outputs `Promise { <pending> }`, or route responses return `undefined` / empty objects unexpectedly.
- **How It Was Fixed:**
  1. Declared all route handlers as `async (req, res) => { ... }`.
  2. Explicitly added `await` before every asynchronous SQLite database call:
     ```javascript
     const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
     const result = await db.run(insertQuery, [title, author, price, pages]);
     ```

---

## 11. Screenshots Evidence

Capture actual screenshots of Postman and the terminal and save them into the `screenshots/` directory using the filenames indicated below.

---

### 11.1 Terminal Outputs

- **1. Server Starting on Port 3000:**  
  `[ SCREENSHOT HERE: screenshots/01-server-running.png ]`  
  ![Screenshot Here: 01-server-running.png](screenshots/01-server-running.png)

- **2. Database Initialization & Verification (`initDb.js`):**  
  `[ SCREENSHOT HERE: screenshots/02-database-init.png ]`  
  ![Screenshot Here: 02-database-init.png](screenshots/02-database-init.png)

- **3. Automated Test Suite (19 / 19 Tests Passed):**  
  `[ SCREENSHOT HERE: screenshots/21-automated-test-suite.png ]`  
  ![Screenshot Here: 21-automated-test-suite.png](screenshots/21-automated-test-suite.png)

---

### 11.2 Postman GET Requests

- **4. GET /books (All Books with Defaults):**  
  `[ SCREENSHOT HERE: screenshots/03-get-all-books.png ]`  
  ![Screenshot Here: 03-get-all-books.png](screenshots/03-get-all-books.png)

- **5. GET /books?search_q=Design (Partial Title Search):**  
  `[ SCREENSHOT HERE: screenshots/04-get-search-q.png ]`  
  ![Screenshot Here: 04-get-search-q.png](screenshots/04-get-search-q.png)

- **6. GET /books?order_by=price&order=ASC (Sort Ascending):**  
  `[ SCREENSHOT HERE: screenshots/05-get-sort-asc.png ]`  
  ![Screenshot Here: 05-get-sort-asc.png](screenshots/05-get-sort-asc.png)

- **7. GET /books?order_by=price&order=DESC (Sort Descending):**  
  `[ SCREENSHOT HERE: screenshots/06-get-sort-desc.png ]`  
  ![Screenshot Here: 06-get-sort-desc.png](screenshots/06-get-sort-desc.png)

- **8. GET /books?limit=3&offset=2 (Pagination):**  
  `[ SCREENSHOT HERE: screenshots/07-get-limit-offset.png ]`  
  ![Screenshot Here: 07-get-limit-offset.png](screenshots/07-get-limit-offset.png)

- **9. GET /books?min_price=700 (Min Price Filter):**  
  `[ SCREENSHOT HERE: screenshots/08-get-min-price.png ]`  
  ![Screenshot Here: 08-get-min-price.png](screenshots/08-get-min-price.png)

- **10. GET /books?max_price=500 (Max Price Filter):**  
  `[ SCREENSHOT HERE: screenshots/09-get-max-price.png ]`  
  ![Screenshot Here: 09-get-max-price.png](screenshots/09-get-max-price.png)

- **11. GET /books Combined Filters (Search, Sort, Pagination & Price Range):**  
  `[ SCREENSHOT HERE: screenshots/10-get-combined.png ]`  
  ![Screenshot Here: 10-get-combined.png](screenshots/10-get-combined.png)

- **12. GET /books/1 (Single Book 200 OK):**  
  `[ SCREENSHOT HERE: screenshots/11-get-single-200.png ]`  
  ![Screenshot Here: 11-get-single-200.png](screenshots/11-get-single-200.png)

- **13. GET /books/999 (Non-Existing Book 404 Not Found):**  
  `[ SCREENSHOT HERE: screenshots/12-get-single-404.png ]`  
  ![Screenshot Here: 12-get-single-404.png](screenshots/12-get-single-404.png)

---

### 11.3 Postman POST, PUT & DELETE Requests

- **14. POST /books (Valid Creation 201 Created):**  
  `[ SCREENSHOT HERE: screenshots/13-post-valid-201.png ]`  
  ![Screenshot Here: 13-post-valid-201.png](screenshots/13-post-valid-201.png)

- **15. POST /books (Missing Title 400 Bad Request):**  
  `[ SCREENSHOT HERE: screenshots/14-post-missing-title-400.png ]`  
  ![Screenshot Here: 14-post-missing-title-400.png](screenshots/14-post-missing-title-400.png)

- **16. POST /books (Missing Author 400 Bad Request):**  
  `[ SCREENSHOT HERE: screenshots/15-post-missing-author-400.png ]`  
  ![Screenshot Here: 15-post-missing-author-400.png](screenshots/15-post-missing-author-400.png)

- **17. POST /books (Non-Numeric Price 400 Bad Request):**  
  `[ SCREENSHOT HERE: screenshots/16-post-invalid-price-400.png ]`  
  ![Screenshot Here: 16-post-invalid-price-400.png](screenshots/16-post-invalid-price-400.png)

- **18. PUT /books/1 (Update 200 OK):**  
  `[ SCREENSHOT HERE: screenshots/17-put-update-200.png ]`  
  ![Screenshot Here: 17-put-update-200.png](screenshots/17-put-update-200.png)

- **19. PUT /books/999 (Non-Existing Book 404 Not Found):**  
  `[ SCREENSHOT HERE: screenshots/18-put-notfound-404.png ]`  
  ![Screenshot Here: 18-put-notfound-404.png](screenshots/18-put-notfound-404.png)

- **20. DELETE /books/11 (Delete 200 OK):**  
  `[ SCREENSHOT HERE: screenshots/19-delete-existing-200.png ]`  
  ![Screenshot Here: 19-delete-existing-200.png](screenshots/19-delete-existing-200.png)

- **21. DELETE /books/999 (Non-Existing Book 404 Not Found):**  
  `[ SCREENSHOT HERE: screenshots/20-delete-notfound-404.png ]`  
  ![Screenshot Here: 20-delete-notfound-404.png](screenshots/20-delete-notfound-404.png)

---

## 12. Problems Faced and Solutions

1. **Problem:** Dynamic SQL Query Composition with Optional Query Parameters  
   *Solution:* Implemented dynamic array accumulation (`conditions.push(...)`, `queryParams.push(...)`) joined by `AND`. This allows any combination of `search_q`, `min_price`, and `max_price` without writing repetitive SQL queries.
2. **Problem:** Preventing SQL Injection on Dynamic Sorting Columns  
   *Solution:* SQLite does not allow column identifiers or ordering keywords (`ORDER BY ? ?`) to be passed as value placeholders. Solved by defining an explicit whitelist array (`allowedOrderByColumns`) and falling back safely to `'id'` and `'ASC'` for unauthorized values.
3. **Problem:** SQLite Database Concurrency & File Locks on Windows  
   *Solution:* Avoided abrupt `fs.unlinkSync` during runtime; instead structured SQL setup with `DELETE FROM book;` and `DELETE FROM sqlite_sequence WHERE name='book';` to cleanly re-seed data without file contention.

---

## 13. Viva & Interview Questions Guide

### Q1: Query parameter vs Path parameter?
- **Path Parameter (`/books/:bookId`):** Part of the URL path used to identify a specific, unique resource (e.g., primary key `bookId = 1`).
- **Query Parameter (`/books?price=500&order=ASC`):** Key-value pairs appended after `?` used to filter, sort, paginate, or search resources without altering the resource endpoint identity.

### Q2: What does "Stateless" mean in REST?
- "Stateless" means the server does not store any client session context between requests. Every HTTP request sent by a client must contain all necessary information (authentication, parameters, payloads) to be understood and processed independently.

### Q3: Which status code is used for bad input versus a missing record?
- **Bad Input (Validation Failure):** `400 Bad Request` (client supplied invalid or missing fields).
- **Missing Record:** `404 Not Found` (client requested a valid endpoint, but the specific resource ID does not exist in the database).

### Q4: How does SQL LIKE work?
- `LIKE` is an SQL operator used in `WHERE` clauses for pattern matching with string values. The `%` wildcard character represents zero, one, or multiple characters. For example, `title LIKE '%Design%'` matches any title containing the word "Design" anywhere inside it.

### Q5: What are `LIMIT` and `OFFSET` in SQL?
- `LIMIT`: Specifies the maximum number of rows returned by the query (used for page size).
- `OFFSET`: Specifies the number of rows to skip before beginning to return rows from the query (used for page numbers, e.g. `OFFSET = (page - 1) * limit`).

### Q6: Why is input validation important?
- Input validation safeguards system integrity, prevents database corruption, stops malicious exploits (such as SQL injection and script injection), and provides users with explicit, actionable error feedback instead of cryptic server crashes.

