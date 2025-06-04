# Authentication System

This directory contains the authentication-related components and logic for the Eventfyre application.

## Components

### 1. Login (`Login.jsx`)
A form component that allows users to log in with their email and password. It includes:
- Email and password validation
- Loading states
- Error handling
- Social login options (UI only)
- Link to registration and password reset

### 2. Register (`Register.jsx`)
A multi-step registration form that collects user information based on their role (Attendee, Vendor, or Organizer). Features include:
- Role-based form fields
- Password strength validation
- Terms and conditions acceptance
- Error handling and success messages

### 3. Forgot Password (`ForgotPassword.jsx`)
A form for users to request a password reset link. It includes:
- Email validation
- Success/error feedback
- Link back to login

### 4. Reset Password (`ResetPassword.jsx`)
A form for users to set a new password after clicking a reset link. Features:
- Token validation
- Password strength requirements
- Confirmation field matching
- Success/error states

### 5. Unauthorized (`Unauthorized.jsx`)
A component displayed when a user tries to access a page they don't have permission to view.

### 6. ProtectedRoute (`ProtectedRoute.jsx`)
A higher-order component that protects routes based on authentication status and user roles.

### 7. PrivateRoute (`PrivateRoute.jsx`)
An alternative route protection component (similar to ProtectedRoute) that can be used for different routing patterns.

## Context

### AuthContext (`../../contexts/AuthContext.jsx`)
A React context that provides authentication state and methods throughout the application:
- Current user information
- Login/register/logout functions
- Role-based access control helpers
- Token management

## Usage

### Protecting Routes
```jsx
import { ProtectedRoute } from './components/auth';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={
        <ProtectedRoute allowedRoles={['organizer', 'admin']} />
      }>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
      
      {/* Admin-only route */}
      <Route element={
        <ProtectedRoute allowedRoles={['admin']} redirectTo="/unauthorized" />
      }>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### Using Auth Context
```jsx
import { useAuth } from '../contexts/AuthContext';

function UserProfile() {
  const { currentUser, logout, hasRole } = useAuth();
  
  if (!currentUser) {
    return <div>Please log in to view your profile.</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Email: {currentUser.email}</p>
      <p>Role: {currentUser.role}</p>
      
      {hasRole('admin') && (
        <button>Admin Dashboard</button>
      )}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## API Integration

The authentication components are designed to work with the following API endpoints:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user data
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password with token
- `GET /api/v1/auth/validate-reset-token/:token` - Validate reset token

## Environment Variables

The following environment variables should be set in your `.env` file:

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

## Styling

Components are styled using Tailwind CSS classes. Custom styles can be added to `index.css` if needed.

## Testing

To test the authentication flow:

1. Register a new user
2. Verify the registration email (if email verification is enabled)
3. Log in with the new credentials
4. Test password reset flow
5. Verify protected routes require authentication
6. Verify role-based access control

## Future Enhancements

- Add two-factor authentication
- Implement social login (Google, Facebook)
- Add email verification
- Add password strength meter
- Add CAPTCHA to prevent bot signups
- Add session management and "remember me" functionality
