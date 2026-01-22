# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, default: "user"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

### Books

#### Get All Books
```http
GET /books?search=gatsby&genre=fiction&author=fitzgerald&page=1&limit=10
```

#### Get Book by ID
```http
GET /books/:id
```

#### Create Book (Admin Only)
```http
POST /books
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "genre": "Fiction",
  "description": "A novel about...",
  "publishedYear": 1925,
  "totalCopies": 5
}
```

#### Update Book (Admin Only)
```http
PUT /books/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "totalCopies": 10
}
```

#### Delete Book (Admin Only)
```http
DELETE /books/:id
Authorization: Bearer <admin_token>
```

### Borrows

#### Borrow Book
```http
POST /borrows
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here"
}
```

#### Return Book
```http
PUT /borrows/:borrowId/return
Authorization: Bearer <token>
```

#### Get My Borrows
```http
GET /borrows/my-borrows?status=borrowed
Authorization: Bearer <token>
```

#### Pay Fine
```http
PUT /borrows/:borrowId/pay-fine
Authorization: Bearer <token>
```

### Admin - Users

#### Get All Users
```http
GET /users?page=1&limit=10&search=john
Authorization: Bearer <admin_token>
```

#### Update User
```http
PUT /users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
