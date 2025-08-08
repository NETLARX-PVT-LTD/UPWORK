# Office Registration System

A comprehensive document registration and management system built with Next.js frontend and Node.js backend.

## 🚀 Features

- **Document Management**: Register, track, and manage IN/OUT documents with 4-digit numbering
- **User Authentication**: Role-based access control (Admin/User)
- **Number Reservation**: Reserve document numbers in advance
- **Audit Logging**: Comprehensive audit trail for all actions
- **Real-time Updates**: Cross-tab synchronization and instant data refresh
- **Session Management**: Secure session isolation between different users
- **File Upload**: Document attachment support
- **Responsive Design**: Mobile-friendly interface

## 📁 Project Structure

```
office-app/
├── office-registration/     # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── package.json
├── office-reg-backend/      # Node.js Backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   └── package.json
└── modFIX.md               # Documentation of fixes
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React Query (TanStack Query)
- React Hook Form

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File uploads)

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Git

### Backend Setup
```bash
cd office-reg-backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=<time in days>d   e.g.30d
CLOUDINARY_URL=cloudinary://<your_api_key>:<your_api_secret>@dmqa0nnct
NEXT_PUBLIC_BACKEND_URL=http://localhost:<PORT>
PORT=5000
```

Start backend:
```bash
npm start
```

### Frontend Setup
```bash
cd office-registration
npm install
```

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## 🚀 Deployment

### Backend (Node.js)
- Deploy to Vercel, Railway, or any Node.js hosting service
- Configure environment variables
- Connect to MongoDB Atlas

### Frontend (Next.js)
- Deploy to Vercel (recommended)
- Configure environment variables
- Set `NEXT_PUBLIC_API_URL` to your backend URL

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Session isolation between users
- Input validation and sanitization
- Secure file upload handling

## 📊 Recent Fixes & Improvements

✅ **Session Management**: Fixed user session data bleeding between different users  
✅ **Real-time Updates**: Implemented cross-tab synchronization  
✅ **Audit Logging**: Comprehensive audit trail for all actions  
✅ **Document Numbering**: Enhanced to 4-digit format (YYYY-NNNN)  
✅ **Data Validation**: Added mandatory fields (description, sender, recipient)  
✅ **Performance**: Optimized query caching and refresh strategies  

See `modFIX.md` for detailed list of all fixes and improvements.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.

---

**Last Updated:** June 2025  
**Status:** ✅ Production Ready
"# office-backend" 
