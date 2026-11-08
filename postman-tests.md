# Postman Test Suite Documentation – Lab 3

**Student Name:** PANNALA HARSHAVARDHAN REDDY  
**Registration Number:** 252U1R1182  
**Section:** CSE-2D  
**Course:** Backend Development Fundamentals  
**Lab Assignment:** Lab 3 – REST API, Query Parameters, Validation and Debugging  
**Base URL:** `http://localhost:3000`

---

## 1. Overview & Collection Organization

The Postman collection is exported as `Lab-03-Postman-Collection.json` adhering to the Postman Collection v2.1.0 format. It organizes all test requests into logical folders according to faculty specifications:

1. **`GET Requests`**: Testing default endpoints, filtering, sorting, pagination, and ID lookups.
2. **`POST Requests`**: Testing valid creation of books.
3. **`PUT Requests`**: Testing record updates and missing ID handling.
4. **`DELETE Requests`**: Testing record deletion and missing ID handling.
5. **`Validation and Error Testing`**: Testing missing and malformed parameters and payloads.

---

## 2. Comprehensive Test Cases Table

| Folder | Test ID | Request Name | Method | Endpoint / URL | Request Body | Expected Status | Expected Response Body Summary |
|---|---|---|---|---|---|---|---|
| **GET Requests** | TC-G01 | Get All Books (Default) | `GET` | `/books` | *None* | `200 OK` | Array of 10 book objects with default sorting (`order_by=id ASC`) |
| **GET Requests** | TC-G02 | Partial Title Search | `GET` | `/books?search_q=Design` | *None* | `200 OK` | Array containing books with "Design" in title |
| **GET Requests** | TC-G03 | Sort by Price Ascending | `GET` | `/books?order_by=price&order=ASC` | *None* | `200 OK` | Array sorted by price ascending (399, 450, 550, ...) |
| **GET Requests** | TC-G04 | Sort by Price Descending | `GET` | `/books?order_by=price&order=DESC` | *None* | `200 OK` | Array sorted by price descending (1250, 899, 850, ...) |
| **GET Requests** | TC-G05 | Pagination (Limit & Offset) | `GET` | `/books?limit=3&offset=2` | *None* | `200 OK` | Array of 3 books skipping the first 2 |
| **GET Requests** | TC-G06 | Filter by Min Price | `GET` | `/books?min_price=700` | *None* | `200 OK` | Array of books where `price >= 700` |
| **GET Requests** | TC-G07 | Filter by Max Price | `GET` | `/books?max_price=500` | *None* | `200 OK` | Array of books where `price <= 500` |
| **GET Requests** | TC-G08 | Combined Query Parameters | `GET` | `/books?search_q=Design&order_by=price&order=ASC&limit=5&offset=0&min_price=600&max_price=900` | *None* | `200 OK` | Filtered books matching all criteria |
| **GET Requests** | TC-G09 | Get Existing Book by ID | `GET` | `/books/1` | *None* | `200 OK` | Single book object with `id: 1` |
| **GET Requests** | TC-G10 | Get Non-Existing Book by ID | `GET` | `/books/999` | *None* | `404 Not Found` | `{"message": "Book not found"}` |
| **POST Requests** | TC-P01 | Create Valid Book | `POST` | `/books` | JSON payload | `201 Created` | `{"message": "Book created successfully", "book": {...}}` |
| **PUT Requests** | TC-U01 | Update Existing Book | `PUT` | `/books/1` | JSON payload | `200 OK` | `{"message": "Book updated successfully", "book": {...}}` |
| **PUT Requests** | TC-U02 | Update Non-Existing Book | `PUT` | `/books/999` | JSON payload | `404 Not Found` | `{"message": "Book not found"}` |
| **DELETE Requests** | TC-D01 | Delete Existing Book | `DELETE` | `/books/11` | *None* | `200 OK` | `{"message": "Book deleted successfully"}` |
| **DELETE Requests** | TC-D02 | Delete Non-Existing Book | `DELETE` | `/books/999` | *None* | `404 Not Found` | `{"message": "Book not found"}` |
| **Validation & Errors** | TC-V01 | POST Missing Title | `POST` | `/books` | Missing `title` | `400 Bad Request` | `{"message": "Title is required and must be a non-empty string"}` |
| **Validation & Errors** | TC-V02 | POST Missing Author | `POST` | `/books` | Missing `author` | `400 Bad Request` | `{"message": "Author is required and must be a non-empty string"}` |
| **Validation & Errors** | TC-V03 | POST Non-Numeric Price | `POST` | `/books` | Price as string | `400 Bad Request` | `{"message": "Price is required and must be a valid number"}` |
| **Validation & Errors** | TC-V04 | GET Invalid min_price | `GET` | `/books?min_price=abc` | *None* | `400 Bad Request` | `{"message": "Invalid min_price: must be a valid number"}` |
| **Validation & Errors** | TC-V05 | GET Invalid max_price | `GET` | `/books?max_price=xyz` | *None* | `400 Bad Request` | `{"message": "Invalid max_price: must be a valid number"}` |

---

## 3. Sample Request Bodies & Expected Responses

### 3.1 POST /books (Valid Creation)
- **Request Body:**
  ```json
  {
    "title": "Mastering Node.js & SQLite",
    "author": "P. Harshavardhan Reddy",
    "price": 599,
    "pages": 320
  }
  ```
- **Response (`201 Created`):**
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

### 3.2 POST /books (Missing Title Validation)
- **Request Body:**
  ```json
  {
    "author": "P. Harshavardhan Reddy",
    "price": 599
  }
  ```
- **Response (`400 Bad Request`):**
  ```json
  {
    "message": "Title is required and must be a non-empty string"
  }
  ```

### 3.3 POST /books (Non-Numeric Price Validation)
- **Request Body:**
  ```json
  {
    "title": "Book with Bad Price",
    "author": "Jane Doe",
    "price": "five hundred"
  }
  ```
- **Response (`400 Bad Request`):**
  ```json
  {
    "message": "Price is required and must be a valid number"
  }
  ```

### 3.4 PUT /books/1 (Successful Update)
- **Request Body:**
  ```json
  {
    "title": "Clean Code: Second Edition",
    "author": "Robert C. Martin",
    "price": 699,
    "pages": 480
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "message": "Book updated successfully",
    "book": {
      "id": 1,
      "title": "Clean Code: Second Edition",
      "author": "Robert C. Martin",
      "price": 699,
      "pages": 480
    }
  }
  ```

### 3.5 PUT /books/999 (Non-Existing Book)
- **Response (`404 Not Found`):**
  ```json
  {
    "message": "Book not found"
  }
  ```

### 3.6 DELETE /books/11 (Successful Deletion)
- **Response (`200 OK`):**
  ```json
  {
    "message": "Book deleted successfully"
  }
  ```

### 3.7 DELETE /books/999 (Non-Existing Book)
- **Response (`404 Not Found`):**
  ```json
  {
    "message": "Book not found"
  }
  ```

---

## 4. How to Import and Run in Postman

1. Open Postman.
2. Click **Import** in the top left corner.
3. Select the file `Lab-03-Postman-Collection.json` located in the project folder.
4. Verify the collection variable `baseUrl` is set to `http://localhost:3000`.
5. Start your Node.js backend server:
   ```bash
   npm start
   ```
6. Send the requests in order to observe status codes and JSON response bodies.

