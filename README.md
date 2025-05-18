# DocChat: Next.js Document Management System

## 🌐 Live Demo

**Live Demo:** [https://doc-chat-1.onrender.com/](https://doc-chat-1.onrender.com/)

> **Note:** As this is deployed on Render's free tier, Sometime initial load may take up to 50 seconds.

## 📋 Overview

DocChat is a modern document management system built with Next.js and React. It provides a comprehensive solution for document uploading, versioning, permissions management, and AI-powered document querying. The application follows best practices for code organization, state management, and component reusability.

## ✨ Key Features

- **Authentication & Authorization**

  - Secure user authentication with JWT
  - Role-based access control (Admin, Editor, Viewer)
  - Protected routes and API endpoints

- **Document Management**

  - Document uploading with drag-and-drop support
  - Document versioning system
  - Granular permission controls
  - Document preview and download

- **Admin Dashboard**

  - User management (create, edit, delete)
  - Document oversight and management
  - Ingestion monitoring and control

- **AI-Powered Q&A Interface**

  - Ask questions about your documents
  - Receive AI-generated answers with source citations
  - View conversation history

- **Responsive UI**
  - Mobile-first design approach
  - Consistent UI/UX across devices
  - Accessibility compliant

## 🛠️ Technology Stack

- **Frontend**

  - Next.js 14 (App Router)
  - React 18 with TypeScript
  - Tailwind CSS for styling
  - Shadcn/UI component library
  - React Context API for state management

- **Authentication**

  - JWT-based authentication
  - Secure HTTP-only cookies
  - Role-based access control

- **UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Loading states and error handling
  - Toast notifications

## 🏗️ Architecture & Design Decisions

### Component Structure

The application follows a modular component architecture:

```
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Authentication pages
│   ├── documents/        # Document management pages
│   ├── profile/          # User profile pages
│   └── qa/               # Q&A interface
├── components/           # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── documents/        # Document-related components
│   ├── qa/               # Q&A interface components
│   └── ui/               # UI components (shadcn)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # Context providers
└── services/             # API service layer
```

### Design Patterns

- **Service Layer Pattern**: API calls are abstracted into service modules
- **Provider Pattern**: Context providers for global state management
- **Compound Components**: For complex UI elements
- **Custom Hooks**: For reusable logic

### Performance Optimizations

- Server components for improved initial load time
- Client components only where interactivity is needed
- Image optimization with Next.js Image component
- Code splitting and lazy loading

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/Nilesh1409/documant-chat.git
cd doc-chat
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```
# Create a .env.local file with the following variables
NEXT_PUBLIC_API_URL=https://document-management-system-latest.onrender.com/api/health
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Testing

The application includes comprehensive unit and integration tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:

- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Security Features

- JWT authentication with secure HTTP-only cookies
- CSRF protection
- Input validation and sanitization
- Role-based access control
- Secure file handling

## 🌟 Code Quality & Best Practices

- **TypeScript**: Strong typing throughout the application
- **ESLint & Prettier**: Consistent code style
- **Modular Architecture**: Separation of concerns
- **Error Handling**: Comprehensive error handling
- **Accessibility**: WCAG compliance
- **Testing**: Unit and integration tests

## 🚢 Deployment

The application is deployed on Render's free tier:

- [https://doc-chat-1.onrender.com/](https://doc-chat-1.onrender.com/)

## 🧠 Challenges & Solutions

### Challenge: Document Versioning

**Solution**: Implemented a robust versioning system that tracks document changes while maintaining previous versions for reference and rollback capabilities.

### Challenge: Permission Management

**Solution**: Created a granular permission system that allows document owners to control who can view, edit, or manage their documents.

### Challenge: Responsive File Preview

**Solution**: Developed a responsive file preview system that works across devices and supports multiple file formats.

## 📊 Scalability Considerations

- **Database Indexing**: Optimized queries for large document collections
- **Pagination**: Implemented for large data sets
- **Lazy Loading**: For improved performance with large document libraries
- **Caching**: Strategic caching for frequently accessed data

This project was developed as part of a coding exercise with the following requirements:

- Build a document management application with Next.js/React frontend
- Implement user authentication and role-based access control
- Create document upload, versioning, and permission management
- Develop an admin dashboard for user and document management
- Build a Q&A interface for document querying
- Ensure code modularity, testability, and maintainability
- Focus on performance and scalability for large datasets
