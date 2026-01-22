# Analytics API Documentation

## Overview
The Analytics API provides comprehensive statistical data and reporting capabilities for the library management system. All analytics endpoints require authentication and admin privileges.

## Base URL
```
/api/analytics
```

## Authentication
All endpoints require:
- Valid JWT token in Authorization header
- Admin role

```http
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Get Dashboard Statistics
Returns overview statistics for the entire library system.

**Endpoint:** `GET /api/analytics/dashboard`

**Response:**
```json
{
  "totalBooks": 150,
  "totalUsers": 75,
  "activeBorrows": 45,
  "overdueBorrows": 8,
  "totalBorrows": 523,
  "availableBooks": 105,
  "returnRate": 89.5
}
```

**Fields:**
- `totalBooks`: Total number of books in the library
- `totalUsers`: Total number of registered users (excluding admins)
- `activeBorrows`: Currently borrowed books
- `overdueBorrows`: Books past their due date
- `totalBorrows`: Historical total of all borrows
- `availableBooks`: Total available copies across all books
- `returnRate`: Percentage of books returned on time

---

### 2. Get Popular Books
Returns the most borrowed books.

**Endpoint:** `GET /api/analytics/popular-books`

**Query Parameters:**
- `limit` (optional): Number of books to return (1-50, default: 10)

**Example:** `/api/analytics/popular-books?limit=5`

**Response:**
```json
[
  {
    "_id": "60d5ec49f1b2c72b8c8e4f1a",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "genre": "Fiction",
    "borrowCount": 47,
    "currentlyBorrowed": 2,
    "availableCopies": 3
  }
]
```

---

### 3. Get User Activity
Returns user borrowing statistics and top borrowers.

**Endpoint:** `GET /api/analytics/user-activity`

**Query Parameters:**
- `userId` (optional): Filter by specific user ID

**Example:** `/api/analytics/user-activity?userId=60d5ec49f1b2c72b8c8e4f1b`

**Response:**
```json
{
  "statusBreakdown": [
    { "_id": "borrowed", "count": 45 },
    { "_id": "returned", "count": 450 },
    { "_id": "overdue", "count": 8 }
  ],
  "topBorrowers": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "John Doe",
      "email": "john@example.com",
      "totalBorrows": 35,
      "activeBorrows": 3
    }
  ]
}
```

---

### 4. Get Borrowing Trends
Returns daily borrowing statistics over a time period.

**Endpoint:** `GET /api/analytics/borrowing-trends`

**Query Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 30)

**Example:** `/api/analytics/borrowing-trends?days=7`

**Response:**
```json
[
  {
    "date": "2026-01-15",
    "totalBorrows": 12,
    "returned": 10,
    "overdue": 1,
    "active": 1
  },
  {
    "date": "2026-01-16",
    "totalBorrows": 15,
    "returned": 12,
    "overdue": 2,
    "active": 1
  }
]
```

---

### 5. Get Genre Distribution
Returns statistics about book genres including popularity and utilization rates.

**Endpoint:** `GET /api/analytics/genre-distribution`

**Response:**
```json
[
  {
    "genre": "Fiction",
    "bookCount": 75,
    "totalCopies": 150,
    "availableCopies": 95,
    "borrowCount": 325,
    "utilizationRate": 36.67
  },
  {
    "genre": "Science",
    "bookCount": 40,
    "totalCopies": 80,
    "availableCopies": 55,
    "borrowCount": 180,
    "utilizationRate": 31.25
  }
]
```

**Fields:**
- `utilizationRate`: Percentage of copies currently borrowed

---

### 6. Get Overdue Report
Returns detailed information about all overdue books including fine calculations.

**Endpoint:** `GET /api/analytics/overdue-report`

**Response:**
```json
[
  {
    "borrowId": "60d5ec49f1b2c72b8c8e4f1c",
    "book": {
      "id": "60d5ec49f1b2c72b8c8e4f1a",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "genre": "Fiction"
    },
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f1b",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "borrowDate": "2026-01-01T00:00:00.000Z",
    "dueDate": "2026-01-15T00:00:00.000Z",
    "daysOverdue": 7,
    "fineAmount": "7.00"
  }
]
```

---

### 7. Get Revenue Statistics
Returns fine revenue statistics over a time period.

**Endpoint:** `GET /api/analytics/revenue`

**Query Parameters:**
- `days` (optional): Number of days to analyze (1-365, default: 30)

**Example:** `/api/analytics/revenue?days=7`

**Response:**
```json
{
  "totalRevenue": "127.50",
  "averageFine": "4.58",
  "transactionCount": 28,
  "dailyBreakdown": [
    {
      "date": "2026-01-15",
      "revenue": "15.00"
    },
    {
      "date": "2026-01-16",
      "revenue": "23.50"
    }
  ]
}
```

---

### 8. Export Analytics Report
Exports a comprehensive analytics report including all metrics.

**Endpoint:** `GET /api/analytics/export`

**Query Parameters:**
- `format` (optional): Export format (currently only 'json' is supported, default: 'json')

**Response:**
```json
{
  "generatedAt": "2026-01-22T10:30:00.000Z",
  "dashboard": { /* Dashboard stats */ },
  "popularBooks": [ /* Popular books array */ ],
  "trends": [ /* Borrowing trends array */ ],
  "genreDistribution": [ /* Genre stats array */ ],
  "overdueReport": [ /* Overdue books array */ ],
  "revenue": { /* Revenue stats */ }
}
```

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request:**
```json
{
  "message": "Limit must be between 1 and 50"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, token failed"
}
```

**403 Forbidden:**
```json
{
  "message": "Not authorized, admin access required"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to get dashboard stats: <error details>"
}
```

---

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Get dashboard statistics
const response = await fetch('/api/analytics/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const stats = await response.json();

// Get popular books
const popularBooks = await fetch('/api/analytics/popular-books?limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json());

// Export full report
const report = await fetch('/api/analytics/export', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(res => res.json());
```

### cURL
```bash
# Get dashboard statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/dashboard

# Get borrowing trends for last 7 days
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/analytics/borrowing-trends?days=7"

# Export full report
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/analytics/export > report.json
```

---

## Rate Limiting
Analytics endpoints are subject to the admin rate limiter:
- 200 requests per 15 minutes per IP address

---

## Notes
- All dates are in ISO 8601 format (UTC timezone)
- Fine amounts are calculated based on the `FINE_PER_DAY` environment variable
- All monetary values are returned as strings with 2 decimal places
- Empty arrays are returned when no data is available (no 404 errors)
- Aggregation queries may take longer for large datasets

---

## Configuration
Relevant environment variables:
```env
FINE_PER_DAY=1  # Fine amount per day overdue
```
