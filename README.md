# Library Management System

A comprehensive full-stack web application for managing library operations including book cataloging, user management, and borrowing/returning functionality.

![CI/CD](https://github.com/bhanuteja449896/librarymang/workflows/CI/CD%20Pipeline/badge.svg)

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication system
- **Book Management**: Full CRUD operations for book catalog
- **Advanced Search**: Filter books by title, author, and genre
- **Borrow/Return System**: Track book borrowing with due dates
- **Fine Management**: Automatic fine calculation for overdue books
- **User Dashboard**: View borrowed books and history
- **Admin Panel**: Comprehensive management tools for admins
- **Real-time Updates**: Live availability tracking

## 🛠️ Tech Stack

### Frontend
- React.js with Hooks
- React Router for navigation
- Context API for state management
- Axios for API calls
- Vite for build tooling
- Vitest for testing

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Bcrypt for password hashing
- Jest for testing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/bhanuteja449896/librarymang.git
cd librarymang
```

### 2. Install dependencies

```bash
# Install all dependencies
npm run install:all
```

### 3. Environment Setup

Create `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/library_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
FINE_PER_DAY=5
MAX_BORROW_DAYS=14
```

Create `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the application

```bash
# Run both frontend and backend concurrently
npm run dev:all

# Or run separately:
# Backend: npm run dev:server
# Frontend: npm run dev
```

## 🧪 Testing

```bash
# Frontend tests with coverage
npm run test:coverage

# Backend tests
npm run test:server
```

**Test Coverage Goal: 70%+**

## 📚 API Endpoints

See [docs/API.md](docs/API.md) for complete API documentation.

## 📧 Contact

Project Link: [https://github.com/bhanuteja449896/librarymang](https://github.com/bhanuteja449896/librarymang)

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
