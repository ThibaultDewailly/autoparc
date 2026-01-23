# AutoParc Frontend

Modern, responsive web application for managing vehicle fleets, built with React, TypeScript, and NextUI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Application runs on http://localhost:5173

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **NextUI v2** - UI component library
- **Tailwind CSS** - Utility-first styling
- **TanStack Query** - Server state management
- **React Router v6** - Client-side routing
- **Framer Motion** - Animations (via NextUI)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── cars/           # Car management components
│   └── common/         # Shared components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component with routing
└── main.tsx            # Application entry point
```

## 🎨 Features

### Authentication
- Secure login with email/password
- Session-based authentication
- Protected routes
- Automatic redirect on unauthorized access

### Car Management
- **List View**: Paginated table with search and filters
- **Create**: Add new vehicles with validation
- **Read**: View detailed car information
- **Update**: Edit existing vehicles
- **Delete**: Remove vehicles with confirmation

### Search & Filter
- Real-time search across license plates, brands, and models
- Filter by status (active, maintenance, retired)
- Pagination with 20 items per page

### User Interface
- 🇫🇷 Complete French localization
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Modern design with NextUI components
- ♿ Accessible components
- 🌙 Professional color scheme

## 🔌 API Integration

### Endpoints
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/cars` - List cars
- `GET /api/v1/cars/:id` - Get car details
- `POST /api/v1/cars` - Create car
- `PUT /api/v1/cars/:id` - Update car
- `DELETE /api/v1/cars/:id` - Delete car
- `GET /api/v1/insurance-companies` - List insurance companies

### Configuration
API proxy is configured in `vite.config.ts` to forward `/api` requests to `http://localhost:8080`.

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:coverage
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |

## 🎯 Code Style

This project follows React best practices:
- Functional components with hooks
- TypeScript for type safety
- Declarative code style
- RORO pattern (Receive Object, Return Object)
- No classes, prefer pure functions
- Descriptive naming with auxiliary verbs

## 🔐 Authentication

The application uses cookie-based authentication:
- HTTP-only cookies prevent XSS attacks
- Credentials are sent with every request
- Session expires after inactivity
- Automatic logout on session expiration

## 🌍 Localization

All UI text is in French:
- Labels and placeholders
- Error messages
- Button text
- Date formatting (DD/MM/YYYY)
- Status labels

## 📦 Main Dependencies

```json
{
  "@nextui-org/react": "^2.2.9",
  "@tanstack/react-query": "^5.17.19",
  "framer-motion": "^11.5.6",
  "react": "^18.2.0",
  "react-router-dom": "^6.21.3"
}
```

## 🚧 Development Notes

### Path Aliases
The `@` alias points to the `src/` directory:
```typescript
import { Car } from '@/types'
import { useCars } from '@/hooks/useCars'
```

### State Management
- **Server State**: TanStack Query for API data
- **Global State**: React Context for authentication
- **Local State**: useState for component-specific state

### Form Validation
Forms use custom validation with French error messages:
- License plate: `AA-123-BB` format
- Email validation
- Required field checks
- Real-time feedback

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear Cache
```bash
rm -rf node_modules dist .vite
npm install
```

### Backend Not Responding
Ensure the backend is running on `http://localhost:8080`

## 📝 License

This project is part of the AutoParc MVP.

## 👥 Test Credentials

Use these credentials to login (from backend seed data):
- Email: `admin@autoparc.fr`
- Password: `admin123`

## 🔗 Related Documentation

- [Backend README](../backend/README.md)
- [Phase 4 Summary](../PHASE_4_FRONTEND_SUMMARY.md)
- [MVP Todo](../todo_MVP)
