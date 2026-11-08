const { initializeDatabase } = require("./initDb");
const { app, initializeDbAndServer } = require("./index");

const PORT = 3000;
let server;

// Helper to make HTTP requests
async function makeRequest(method, path, body = null) {
  const url = `http://localhost:${PORT}${path}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  let responseData;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  return {
    status: response.status,
    data: responseData,
  };
}

async function runTests() {
  console.log("================================================================");
  console.log(" LAB 3 API COMPREHENSIVE TEST SUITE ");
  console.log(" Student: PANNALA HARSHAVARDHAN REDDY (252U1R1182) | Section: CSE-2D");
  console.log("================================================================\n");

  // Step 1: Initialize database with clean schema and seed data
  console.log(">>> Initializing database with seed data...");
  await initializeDatabase();
  await initializeDbAndServer();

  // Step 2: Start server on PORT
  await new Promise((resolve) => {
    server = app.listen(PORT, () => {
      console.log(`>>> Test Server listening on http://localhost:${PORT}\n`);
      resolve();
    });
  });

  const results = [];

  function recordResult(testId, description, method, path, expectedStatus, actualStatus, pass, details = "") {
    results.push({ testId, description, method, path, expectedStatus, actualStatus, pass, details });
    const mark = pass ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] Test ${testId}: ${description}`);
    console.log(`        ${method} ${path} -> Expected: ${expectedStatus}, Got: ${actualStatus}`);
    if (details) {
      console.log(`        Details: ${details}`);
    }
    console.log("");
  }

  try {
    // -----------------------------------------------------------------------
    // A. GET Requests & Query Parameters
    // -----------------------------------------------------------------------
    console.log("--- A. GET Requests & Query Parameters ---\n");

    // 1. Get all books
    let res = await makeRequest("GET", "/books");
    recordResult(
      "A1",
      "Get all books (default parameters)",
      "GET",
      "/books",
      200,
      res.status,
      res.status === 200 && Array.isArray(res.data) && res.data.length === 10,
      `Returned ${res.data.length} books`
    );

    // 2. Partial title search
    res = await makeRequest("GET", "/books?search_q=Design");
    const matchesDesign =
      Array.isArray(res.data) &&
      res.data.length === 3 &&
      res.data.every((b) => b.title.toLowerCase().includes("design"));
    recordResult(
      "A2",
      "Search books by partial title (search_q=Design)",
      "GET",
      "/books?search_q=Design",
      200,
      res.status,
      res.status === 200 && matchesDesign,
      `Found ${res.data.length} books matching 'Design'`
    );

    // 3. Sort by price ascending
    res = await makeRequest("GET", "/books?order_by=price&order=ASC");
    const isAsc =
      Array.isArray(res.data) &&
      res.data.every((b, i, arr) => i === 0 || arr[i - 1].price <= b.price);
    recordResult(
      "A3",
      "Sort by price ascending (order_by=price&order=ASC)",
      "GET",
      "/books?order_by=price&order=ASC",
      200,
      res.status,
      res.status === 200 && isAsc,
      `Lowest: ₹${res.data[0]?.price}, Highest: ₹${res.data[res.data.length - 1]?.price}`
    );

    // 4. Sort by price descending
    res = await makeRequest("GET", "/books?order_by=price&order=DESC");
    const isDesc =
      Array.isArray(res.data) &&
      res.data.every((b, i, arr) => i === 0 || arr[i - 1].price >= b.price);
    recordResult(
      "A4",
      "Sort by price descending (order_by=price&order=DESC)",
      "GET",
      "/books?order_by=price&order=DESC",
      200,
      res.status,
      res.status === 200 && isDesc,
      `Highest: ₹${res.data[0]?.price}, Lowest: ₹${res.data[res.data.length - 1]?.price}`
    );

    // 5. Test limit and offset
    res = await makeRequest("GET", "/books?limit=3&offset=2");
    recordResult(
      "A5",
      "Pagination with limit and offset (limit=3&offset=2)",
      "GET",
      "/books?limit=3&offset=2",
      200,
      res.status,
      res.status === 200 && res.data.length === 3 && res.data[0].id === 3,
      `Returned 3 books starting from ID ${res.data[0]?.id}`
    );

    // 6. Filter by minimum price
    res = await makeRequest("GET", "/books?min_price=700");
    const isMinPrice =
      Array.isArray(res.data) && res.data.every((b) => b.price >= 700);
    recordResult(
      "A6",
      "Filter by minimum price (min_price=700)",
      "GET",
      "/books?min_price=700",
      200,
      res.status,
      res.status === 200 && isMinPrice && res.data.length > 0,
      `Found ${res.data.length} books with price >= 700`
    );

    // 7. Filter by maximum price
    res = await makeRequest("GET", "/books?max_price=500");
    const isMaxPrice =
      Array.isArray(res.data) && res.data.every((b) => b.price <= 500);
    recordResult(
      "A7",
      "Filter by maximum price (max_price=500)",
      "GET",
      "/books?max_price=500",
      200,
      res.status,
      res.status === 200 && isMaxPrice && res.data.length > 0,
      `Found ${res.data.length} books with price <= 500`
    );

    // 8. Combine search, sorting, pagination, and price filtering
    res = await makeRequest(
      "GET",
      "/books?search_q=Design&order_by=price&order=ASC&limit=5&offset=0&min_price=600&max_price=900"
    );
    const isCombined =
      Array.isArray(res.data) &&
      res.data.every(
        (b) =>
          b.title.toLowerCase().includes("design") &&
          b.price >= 600 &&
          b.price <= 900
      );
    recordResult(
      "A8",
      "Combined search, sorting, pagination and price range",
      "GET",
      "/books?search_q=Design&order_by=price&order=ASC&limit=5&offset=0&min_price=600&max_price=900",
      200,
      res.status,
      res.status === 200 && isCombined && res.data.length === 3,
      `Returned ${res.data.length} books matching all combined filters`
    );

    // 9. Get one existing book
    res = await makeRequest("GET", "/books/1");
    recordResult(
      "A9",
      "Get one existing book by ID (/books/1)",
      "GET",
      "/books/1",
      200,
      res.status,
      res.status === 200 && res.data && res.data.id === 1,
      `Title: '${res.data?.title}', Price: ₹${res.data?.price}`
    );

    // 10. Request a non-existing book ID
    res = await makeRequest("GET", "/books/999");
    recordResult(
      "A10",
      "Request a non-existing book ID (/books/999)",
      "GET",
      "/books/999",
      404,
      res.status,
      res.status === 404 && res.data && res.data.message === "Book not found",
      `Error response: ${JSON.stringify(res.data)}`
    );

    // -----------------------------------------------------------------------
    // B. POST Requests & Validation
    // -----------------------------------------------------------------------
    console.log("--- B. POST Requests & Body Validation ---\n");

    // 11. Create a valid book
    const newBookPayload = {
      title: "Mastering Node.js & SQLite",
      author: "P. Harshavardhan Reddy",
      price: 599,
      pages: 320,
    };
    res = await makeRequest("POST", "/books", newBookPayload);
    const createdId = res.data?.book?.id;
    recordResult(
      "B1",
      "Create a valid book",
      "POST",
      "/books",
      201,
      res.status,
      res.status === 201 && createdId !== undefined && res.data?.book?.title === newBookPayload.title,
      `Created Book ID: ${createdId}, Message: '${res.data?.message}'`
    );

    // 12. Submit without title
    res = await makeRequest("POST", "/books", {
      author: "P. Harshavardhan Reddy",
      price: 599,
    });
    recordResult(
      "B2",
      "Submit POST without title (Validation error)",
      "POST",
      "/books",
      400,
      res.status,
      res.status === 400 && res.data && res.data.message.includes("Title is required"),
      `Response: ${JSON.stringify(res.data)}`
    );

    // 13. Submit without author
    res = await makeRequest("POST", "/books", {
      title: "Book Without Author",
      price: 599,
    });
    recordResult(
      "B3",
      "Submit POST without author (Validation error)",
      "POST",
      "/books",
      400,
      res.status,
      res.status === 400 && res.data && res.data.message.includes("Author is required"),
      `Response: ${JSON.stringify(res.data)}`
    );

    // 14. Submit with non-numeric price
    res = await makeRequest("POST", "/books", {
      title: "Book With Invalid Price",
      author: "Author Name",
      price: "five hundred rupees",
    });
    recordResult(
      "B4",
      "Submit POST with non-numeric price (Validation error)",
      "POST",
      "/books",
      400,
      res.status,
      res.status === 400 && res.data && res.data.message.includes("Price is required and must be a valid number"),
      `Response: ${JSON.stringify(res.data)}`
    );

    // -----------------------------------------------------------------------
    // C. PUT Requests
    // -----------------------------------------------------------------------
    console.log("--- C. PUT Requests ---\n");

    // 15. Update an existing book
    const updatePayload = {
      title: "Clean Code: Second Edition",
      author: "Robert C. Martin",
      price: 699,
      pages: 480,
    };
    res = await makeRequest("PUT", "/books/1", updatePayload);
    recordResult(
      "C1",
      "Update an existing book (/books/1)",
      "PUT",
      "/books/1",
      200,
      res.status,
      res.status === 200 && res.data?.book?.title === "Clean Code: Second Edition" && res.data?.book?.price === 699,
      `Updated Title: '${res.data?.book?.title}', New Price: ₹${res.data?.book?.price}`
    );

    // 16. Update a non-existing book ID
    res = await makeRequest("PUT", "/books/999", updatePayload);
    recordResult(
      "C2",
      "Update a non-existing book ID (/books/999)",
      "PUT",
      "/books/999",
      404,
      res.status,
      res.status === 404 && res.data && res.data.message === "Book not found",
      `Response: ${JSON.stringify(res.data)}`
    );

    // -----------------------------------------------------------------------
    // D. DELETE Requests
    // -----------------------------------------------------------------------
    console.log("--- D. DELETE Requests ---\n");

    // 17. Delete an existing book (the newly created book from B1)
    res = await makeRequest("DELETE", `/books/${createdId}`);
    recordResult(
      "D1",
      `Delete an existing book (/books/${createdId})`,
      "DELETE",
      `/books/${createdId}`,
      200,
      res.status,
      res.status === 200 && res.data?.message === "Book deleted successfully",
      `Response: ${JSON.stringify(res.data)}`
    );

    // 18. Delete a non-existing book ID
    res = await makeRequest("DELETE", "/books/999");
    recordResult(
      "D2",
      "Delete a non-existing book ID (/books/999)",
      "DELETE",
      "/books/999",
      404,
      res.status,
      res.status === 404 && res.data && res.data.message === "Book not found",
      `Response: ${JSON.stringify(res.data)}`
    );

    // 19. Confirm deleted book is actually gone
    res = await makeRequest("GET", `/books/${createdId}`);
    recordResult(
      "D3",
      `Confirm deleted book no longer exists (/books/${createdId})`,
      "GET",
      `/books/${createdId}`,
      404,
      res.status,
      res.status === 404 && res.data?.message === "Book not found",
      `Database verified: record ${createdId} was permanently removed`
    );

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------
    console.log("================================================================");
    console.log(" TEST SUMMARY REPORT");
    console.log("================================================================");
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;
    console.log(`Total Tests Run: ${total}`);
    console.log(`Passed:         ${passed}`);
    console.log(`Failed:         ${total - passed}`);
    console.log(`Success Rate:   ${((passed / total) * 100).toFixed(1)}%`);
    console.log("================================================================\n");

    if (passed === total) {
      console.log("ALL 19 TEST CASES PASSED PERFECTLY!");
    } else {
      console.error("SOME TESTS FAILED! Please check logs above.");
    }
  } finally {
    if (server) {
      server.close();
      console.log(">>> Test server closed.");
    }
    // Re-seed DB cleanly so student can use Postman with original 10 records
    console.log(">>> Resetting database with original 10 records for Postman testing...");
    await initializeDatabase();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
