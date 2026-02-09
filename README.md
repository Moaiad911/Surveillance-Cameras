# Surveillance Cameras Management System

A modern, full-stack application for managing surveillance cameras, built with React (frontend) and Node.js/Express (backend).

## Features

- 🔐 **Authentication System** - Login and registration with role-based access
- 📹 **Camera Management** - View, manage, and monitor surveillance cameras
- 📊 **Dashboard** - Real-time statistics and overview
- 🔔 **Event Management** - Monitor and acknowledge system events
- 👥 **User Management** - Manage users and permissions (Admin only)
- ⚙️ **Settings** - Configure system preferences
- 🎨 **Modern UI** - Beautiful, responsive design with dark theme

## Technologies and Frameworks

### Frontend
- **React 18** - Frontend library for building the user interface
- **TypeScript** - Primary language for application logic
- **Vite** - Build tool and development server for fast development and bundling
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Zustand** - State management library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Recharts** - Library for charts and data visualizations
- **Lucide React** - Icon library for React components
- **date-fns** - Utility library for date manipulation
- **ESLint** - Linting tool for code quality
- **PostCSS** - CSS processing tool

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling for Node.js
- **JWT (jsonwebtoken)** - Authentication token management
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **nodemon** - Development server with auto-reload

## Prerequisites

Before you start, make sure you have these installed:

1. **Node.js**: [Download Here](https://nodejs.org/) (LTS Version 18+)
2. **Git**: [Download Here](https://git-scm.com/downloads) (For Windows)
3. **MongoDB Community Server**: [Download Here](https://www.mongodb.com/try/download/community)
   - **IMPORTANT**: During installation, check the box **"Install MongoDB as a Service"**.

## Installation

### First Time Setup

Open your terminal (VS Code or PowerShell) in the project folder.

#### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

## Running the Project

You need **TWO** terminal windows to run both frontend and backend.

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Wait until you see: **"Connected to MongoDB"**

The backend server will typically run on `http://localhost:5000` (or the port specified in your backend configuration).

### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

Open the link shown in the terminal (e.g., `http://localhost:3000`) in your browser.

## Build for Production

### Frontend

```bash
cd frontend
npm run build
```

The production build will be created in the `frontend/dist` directory.

### Preview Production Build

```bash
cd frontend
npm run preview
```

### Backend

```bash
cd backend
npm start
```

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/          # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Cameras.tsx
│   │   │   ├── CameraDetail.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Users.tsx
│   │   │   └── Settings.tsx
│   │   ├── store/          # State management
│   │   │   └── authStore.ts
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── controllers/        # Request handlers
│   │   └── authController.js
│   ├── models/            # Database models
│   │   └── User.js
│   ├── routes/            # API routes
│   │   └── authRoutes.js
│   ├── server.js          # Server entry point
│   └── package.json
└── README.md
```

## Demo Credentials

- **Admin**: username: `admin`, password: (any)
- **Operator**: username: `operator`, password: (any)

## Features Overview

### Dashboard
- Overview statistics (total cameras, active cameras, events)
- Recent events list
- Quick actions

### Cameras
- Grid view of all cameras
- Search and filter functionality
- Camera status indicators
- Individual camera detail pages with live feed

### Events
- List of all system events
- Filter by severity (high, medium, low)
- Acknowledge events
- Search functionality

### Users (Admin Only)
- User management table
- Role-based access control
- User status tracking

### Settings
- Notification preferences
- Recording settings
- Security settings
- System configuration

## Troubleshooting

### Database Connection Error
- Make sure MongoDB is running. 
- On Windows, run `sc query MongoDB` in PowerShell to check the service status.
- Ensure MongoDB is installed as a service (check during installation).

### Port Already in Use
- If port 3000 (frontend) or 5000 (backend) is taken, kill the old terminals or restart your PC.
- You can also change the port in the configuration files.

### Installation Issues
- Make sure you have Node.js 18+ installed.
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.
- Ensure you're in the correct directory when running commands.

## Development Notes

- The application uses MongoDB for data persistence
- Authentication uses JWT tokens for secure session management
- In production, ensure proper environment variables are set (`.env` file in backend)
- Camera feeds are placeholders - integrate with actual video streaming service
- Implement proper error handling and validation in production

## License

This project is part of a graduation project.
