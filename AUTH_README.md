# Authentication System

This project now includes a complete authentication system with the following features:

## Features

### Backend
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT-based authentication
- **Password Security**: bcryptjs for password hashing
- **API Routes**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user profile

### Frontend
- **Authentication Context**: React context for state management
- **Protected Routes**: Components that require authentication
- **User Dashboard**: Personalized dashboard with stats
- **Login/Signup Forms**: Beautiful, animated forms
- **Navbar Integration**: Shows user state and logout functionality

## Database Schema

### User Model
- `id`: Unique identifier
- `email`: User's email (unique)
- `username`: Username (unique)
- `password`: Hashed password
- `firstName`, `lastName`: Optional names
- `createdAt`, `updatedAt`: Timestamps

### Related Models
- `SatScore`: Track user's SAT scores
- `PracticeTest`: Track practice test results
- `VocabProgress`: Track vocabulary learning progress

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env` file with:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

3. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Usage

### Authentication Flow
1. Users can register at `/signup`
2. Users can login at `/sign_in`
3. After login, users are redirected to `/dashboard`
4. All protected routes (questions, vocab, leaderboards) require authentication
5. Users can logout via the navbar dropdown

### Protected Routes
- `/dashboard` - User dashboard
- `/questions` - Practice questions
- `/vocab` - Vocabulary practice
- `/leaderboards` - Leaderboards

### API Usage

#### Register a new user:
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'username',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  })
});
```

#### Login:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
```

#### Get current user:
```javascript
const response = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- Protected routes automatically redirect to login
- User sessions persist across browser refreshes
- Input validation on both client and server

## Next Steps

The authentication system is now complete and ready for use. You can:

1. Add more user profile fields
2. Implement password reset functionality
3. Add email verification
4. Implement role-based access control
5. Add social login (Google, Facebook, etc.)
6. Add more detailed analytics and tracking
