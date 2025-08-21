# Workflow Tracker Frontend

A React-based frontend for the Workflow Tracker application with support for both traditional email/password authentication and Google OAuth.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Google OAuth Setup

To enable Google OAuth, you need to:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable Google+ API** and **Google OAuth2 API**
4. **Create OAuth 2.0 credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/auth/google/callback`
   - Copy the Client ID to your `.env` file

### 4. Update Google Client ID

In `src/components/GoogleLogin.jsx`, replace the placeholder:

```javascript
// Replace this line:
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "REPLACE_WITH_YOUR_ACTUAL_GOOGLE_CLIENT_ID";

// With your actual Google Client ID:
const GOOGLE_CLIENT_ID =
  "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

- **Traditional Login**: Email/password authentication
- **Google OAuth**: Single Sign-On with Google accounts
- **Project Management**: Create, view, edit, and delete projects
- **Task Management**: Full CRUD operations for tasks
- **Kanban Board**: Drag-and-drop task management
- **Responsive Design**: Works on desktop and mobile

## Authentication

The application supports two authentication methods:

1. **Traditional Login**: Users register with email/password
2. **Google OAuth**: Users sign in with their Google account

Both methods provide the same user experience once authenticated.

## Troubleshooting

### Google OAuth Not Working

1. **Check Client ID**: Make sure you've replaced the placeholder with your actual Google Client ID
2. **Verify API Setup**: Ensure Google OAuth2 API is enabled in Google Cloud Console
3. **Check Redirect URI**: Verify the redirect URI matches exactly
4. **Browser Console**: Check for any JavaScript errors

### Backend Connection Issues

1. **Verify Backend**: Make sure the FastAPI backend is running on port 8000
2. **Check CORS**: Ensure the backend allows requests from `http://localhost:5173`
3. **Network Tab**: Check browser DevTools for failed API requests

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Login.jsx       # Login page with Google OAuth
│   ├── Dashboard.jsx   # Main dashboard
│   ├── KanbanBoard.jsx # Task management board
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ProjectContext.jsx # Project and task state
├── services/           # API services
│   └── api.js         # API calls
└── ...
```

### Key Components

- **GoogleLogin**: Handles Google OAuth integration
- **UserProfile**: Displays user information in dashboard header
- **AuthContext**: Manages authentication state
- **ProjectContext**: Manages projects and tasks

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

This project is part of the Workflow Tracker application.
