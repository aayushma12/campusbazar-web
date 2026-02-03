# CampusBazar - Next.js Frontend

A modern, production-ready Next.js web application for CampusBazar marketplace platform with full backend integration.

## 🚀 Features

### Authentication & Authorization
- ✅ Unified login page for both users and admin
- ✅ User registration with validation
- ✅ Admin login with environment-based credentials
- ✅ JWT token management with automatic refresh
- ✅ Role-based access control (User, Admin, Tutor)
- ✅ Protected routes with middleware
- ✅ Persistent authentication state with Zustand

### User Dashboard
- ✅ Personalized welcome screen
- ✅ Statistics cards (Listings, Requests, Favorites, Messages)
- ✅ Quick action buttons
- ✅ Recent activity feed
- ✅ Responsive sidebar navigation

### Profile Management
- ✅ View and edit profile information
- ✅ Profile picture upload with preview
- ✅ Delete profile picture
- ✅ Update personal details (name, phone, student ID, batch, college ID)
- ✅ Change password functionality
- ✅ Real-time form validation
- ✅ Loading and error states

### Admin Panel
- ✅ Admin-only dashboard overview
- ✅ System statistics and metrics
- ✅ Admin panel with system settings
- ✅ User management (read-only view)
- ✅ Search and filter users
- ✅ User statistics
- ✅ Route protection for admin routes

### Technical Features
- ✅ Next.js 16 with App Router
- ✅ TypeScript for type safety
- ✅ React Query for data fetching and caching
- ✅ Zustand for state management
- ✅ Axios with interceptors for API calls
- ✅ Tailwind CSS for styling
- ✅ React Hook Form for form handling
- ✅ Lucide React for icons
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states and error handling
- ✅ Toast notifications

## 📁 Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard overview
│   │   │   ├── panel/
│   │   │   │   └── page.tsx      # Admin panel settings
│   │   │   └── users/
│   │   │       └── page.tsx      # User management
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile/Settings page
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   └── page.tsx              # User dashboard home
│   ├── login/
│   │   └── page.tsx              # Login page (User + Admin)
│   ├── register/
│   │   └── page.tsx              # Registration page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── auth/
│   ├── axios.tsx                 # Axios instance with interceptors
│   ├── endpoints.tsx             # API endpoints
│   ├── queries.tsx               # Auth mutations (login, register, admin)
│   └── profileQueries.tsx        # Profile queries and mutations
├── store/
│   └── authStore.tsx             # Zustand auth store
├── middleware.ts                 # Route protection middleware
├── .env.local                    # Environment variables
└── package.json
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:4000`

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_ADMIN_EMAIL=admin@campusbazar.com
   NEXT_PUBLIC_ADMIN_PASSWORD=Admin@123
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## 🔐 Authentication Flow

### User Login
1. Navigate to `/login`
2. Select "User Login" tab
3. Enter email and password
4. On success, redirected to `/dashboard`

### Admin Login
1. Navigate to `/login`
2. Select "Admin Login" tab
3. Enter admin credentials (from .env.local)
4. On success, redirected to `/dashboard/admin`

### Registration
1. Navigate to `/register`
2. Fill in name, email, password, and confirm password
3. On success, automatically logged in and redirected to `/dashboard`

## 📡 API Integration

### Backend Endpoints Used

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

#### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile (with multipart/form-data for image)
- `DELETE /api/profile/picture` - Delete profile picture

### Request/Response Flow

1. **Login Request:**
   ```typescript
   POST /api/auth/login
   Body: { email: string, password: string }
   Response: {
     success: boolean,
     message: string,
     data: {
       user: { id, email, name, role, ... },
       accessToken: string,
       refreshToken: string
     }
   }
   ```

2. **Profile Update:**
   ```typescript
   PATCH /api/profile
   Headers: { Authorization: "Bearer <token>" }
   Body: FormData {
     name?: string,
     phoneNumber?: string,
     studentId?: string,
     batch?: string,
     collegeId?: string,
     profilePicture?: File,
     oldPassword?: string,
     newPassword?: string
   }
   ```

## 🎨 UI/UX Features

### Design System
- **Colors:** Indigo, Purple, Pink gradients
- **Typography:** System fonts with proper hierarchy
- **Spacing:** Consistent 4px grid system
- **Shadows:** Multi-level shadow system
- **Animations:** Smooth transitions and hover effects

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Components
- Gradient backgrounds
- Glassmorphism effects
- Card-based layouts
- Icon integration (Lucide React)
- Loading spinners
- Toast notifications
- Form validation feedback

## 🔒 Security Features

- JWT token storage in localStorage
- Automatic token refresh on 401 errors
- Protected routes with middleware
- Role-based access control
- CSRF protection via withCredentials
- Password visibility toggle
- Secure admin credentials in environment variables

## 🚦 Route Protection

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (User)
- `/dashboard` - User dashboard
- `/dashboard/profile` - Profile settings

### Protected Routes (Admin Only)
- `/dashboard/admin` - Admin dashboard
- `/dashboard/admin/panel` - Admin panel
- `/dashboard/admin/users` - User management

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### State Management
- `zustand` - Global state management

### Data Fetching
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client

### Forms
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation
- `zod` - Schema validation

### UI
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library

## 🧪 Testing

To test the application:

1. **Start Backend:**
   ```bash
   cd campus-bazar
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test User Flow:**
   - Register a new user
   - Login with user credentials
   - Update profile information
   - Upload profile picture
   - Change password

4. **Test Admin Flow:**
   - Login with admin credentials
   - Access admin dashboard
   - View user management
   - Access admin panel

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend CORS is configured to allow `http://localhost:3000`
   - Check backend is running on port 4000

2. **401 Unauthorized:**
   - Check if access token is valid
   - Verify backend JWT secret matches
   - Check token expiry settings

3. **Profile Picture Upload Fails:**
   - Ensure Cloudinary credentials are set in backend
   - Check file size limits
   - Verify multipart/form-data headers

4. **Middleware Redirect Loop:**
   - Clear localStorage
   - Check auth-storage format
   - Verify middleware matcher patterns

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_ADMIN_PASSWORD=SecureAdminPassword123!
```

## 📝 Future Enhancements

- [ ] Implement actual user management actions (ban, delete, edit)
- [ ] Add real-time notifications
- [ ] Implement chat functionality
- [ ] Add marketplace listings management
- [ ] Implement tutor request system
- [ ] Add analytics dashboard
- [ ] Implement email verification
- [ ] Add two-factor authentication
- [ ] Implement password reset flow
- [ ] Add dark mode support

## 👥 User Roles

### User
- Access to personal dashboard
- Create/manage listings
- Request tutors
- Update profile
- View favorites

### Admin
- All user permissions
- Access admin dashboard
- View all users
- System settings
- Platform analytics
- User management (view only for now)

### Tutor
- All user permissions
- Enhanced profile features
- Tutor-specific dashboard (coming soon)

## 📄 License

This project is part of the CampusBazar platform.

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript for all new files
3. Follow the component naming conventions
4. Add proper error handling
5. Test on multiple screen sizes
6. Update this README for new features

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
