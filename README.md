# Workflow Tracker

A modern React application built with Vite for managing projects and tasks using a Kanban board interface. This application demonstrates the use of React hooks (`useState`, `useReducer`), Context API for state management, and Tailwind CSS for styling.

## 🚀 Features

- **Authentication System**: Login/logout functionality with demo credentials
- **Project Management**: Create, view, and manage multiple projects
- **Kanban Board**: Drag-and-drop task management with four status columns:
  - TO DO
  - IN PROGRESS
  - REVIEW
  - DONE
- **Task Management**: Full CRUD operations for tasks including:
  - Priority levels (LOW, MEDIUM, HIGH)
  - Due dates
  - Assignees
  - Status tracking
- **Search & Filter**: Search tasks by title, description, or assignee
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## 🛠️ Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Date-fns** - Date manipulation utilities
- **Vitest** - Testing framework
- **React Testing Library** - Component testing utilities

## 📁 Project Structure

```
workflow-tracker/
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── TaskCard.jsx
│   │   ├── CreateProjectModal.jsx
│   │   ├── CreateTaskModal.jsx
│   │   └── TaskDetailsModal.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ProjectContext.jsx
│   ├── test/
│   │   └── setup.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.jsx
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎯 State Management

The application uses React's Context API with `useReducer` for state management:

### AuthContext

- Manages authentication state
- Handles login/logout operations
- Provides user information

### ProjectContext

- Manages projects and tasks data
- Handles CRUD operations for projects and tasks
- Provides selectors for filtering and querying data

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd workflow-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

- **Email**: demo@example.com
- **Password**: password

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🧪 Testing

The application includes comprehensive tests using Vitest and React Testing Library:

```bash
npm run test
```

Tests cover:

- Component rendering
- User interactions
- Form submissions
- Context providers

## 🎨 Customization

### Styling

The application uses Tailwind CSS with custom configuration in `tailwind.config.js`. You can customize:

- Color palette
- Typography
- Spacing
- Animations

### Adding New Features

1. Create new components in `src/components/`
2. Add new contexts in `src/contexts/` if needed
3. Update routing in `App.jsx`
4. Add tests for new functionality

## 🔧 Key Features Implementation

### Drag and Drop

Tasks can be dragged between status columns using HTML5 drag and drop API.

### Real-time Updates

State updates are handled through Context API with `useReducer` for predictable state changes.

### Responsive Design

The application is fully responsive with mobile-first design using Tailwind CSS utilities.

### Search and Filter

Tasks can be searched by title, description, or assignee, and filtered by status.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.
