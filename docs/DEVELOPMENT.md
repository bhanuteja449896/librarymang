# Development Guide

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB v4.4+
- Git

### Setup Development Environment

1. **Clone and Install**
   ```bash
   git clone https://github.com/bhanuteja449896/librarymang.git
   cd librarymang
   npm run install:all
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env` in both root and server directories
   - Update MongoDB URI and JWT secret

3. **Start Development Servers**
   ```bash
   npm run dev:all
   ```

## Code Structure

### Backend (`/server`)

```
server/
├── config/          # Database and app configuration
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, error)
├── models/          # Mongoose models
├── routes/          # API route definitions
├── utils/           # Utility functions
├── tests/           # Test files
│   ├── unit/        # Unit tests
│   └── integration/ # Integration tests
└── server.js        # Entry point
```

### Frontend (`/src`)

```
src/
├── components/      # Reusable React components
├── context/         # React Context (state management)
├── pages/           # Page components
│   └── admin/       # Admin-specific pages
├── services/        # API service functions
├── utils/           # Utility functions
├── __tests__/       # Test files
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Testing Guidelines

### Backend Tests

**Unit Tests** - Test individual functions and models
```javascript
describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = await User.create({...});
    expect(user.password).not.toBe(plainPassword);
  });
});
```

**Integration Tests** - Test API endpoints
```javascript
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
  });
});
```

### Frontend Tests

**Component Tests**
```javascript
describe('BookCard', () => {
  it('renders book information', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText('Book Title')).toBeInTheDocument();
  });
});
```

## Commit Message Guidelines

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding/updating tests
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Build/config changes

Example:
```
feat: add book search functionality
test: add unit tests for User model
fix: resolve authentication token expiry issue
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit PR with descriptive title and description
6. Ensure at least 5 files are changed
7. Include test files in the PR

## Code Style

### Backend (JavaScript/Node.js)
- Use ES6+ features
- Follow ESLint configuration
- Use async/await for asynchronous code
- Add JSDoc comments for functions

### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use meaningful component names
- Keep components focused and small

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'user', 'admin'),
  borrowedBooks: [ObjectId],
  isActive: Boolean
}
```

### Book
```javascript
{
  title: String,
  author: String,
  isbn: String (unique),
  genre: String,
  description: String,
  publishedYear: Number,
  totalCopies: Number,
  availableCopies: Number,
  coverImage: String
}
```

### Borrow
```javascript
{
  user: ObjectId,
  book: ObjectId,
  borrowDate: Date,
  dueDate: Date,
  returnDate: Date,
  status: String (enum: 'borrowed', 'returned', 'overdue'),
  fine: Number,
  isPaid: Boolean
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MongoDB URI in `.env`
- Verify port 27017 is not in use

### Port Already in Use
- Frontend: Change port in `vite.config.js`
- Backend: Change `PORT` in `.env`

### Authentication Errors
- Clear localStorage
- Check JWT_SECRET in `.env`
- Verify token format: `Bearer <token>`

## Useful Commands

```bash
# Install dependencies
npm run install:all

# Development
npm run dev              # Frontend only
npm run dev:server       # Backend only
npm run dev:all          # Both

# Testing
npm test                 # Frontend tests
npm run test:coverage    # Frontend with coverage
npm run test:server      # Backend tests

# Linting
npm run lint             # Frontend
npm run lint:fix         # Fix frontend issues
cd server && npm run lint # Backend

# Building
npm run build            # Build frontend
```

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
