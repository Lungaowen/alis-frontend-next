# ALIS - Automated Legal Intelligence System

A modern web application for South African legal compliance analysis. ALIS helps users review contracts, policies, and filings against South African statutes, providing compliance verdicts, risk grading, and regulatory citations.

## 🚀 Features

- **Multi-Role Authentication**: Support for Admin, Legal Practitioner, Deal Maker, and User roles
- **Document Upload & Analysis**: Upload legal documents for automated compliance checking
- **Compliance Reports**: Detailed reports with risk assessments and regulatory citations
- **Global Search**: Search across documents and reports
- **Role-Based Dashboards**: Customized dashboards for each user type
- **Dark/Light Theme**: Modern theming with smooth transitions
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components built on Radix UI

### Backend Integration
- **Java Spring Boot API** - Authentication, admin, rules, and compliance
- **Python FastAPI** - Documents, reports, PDF downloads, and search
- **Supabase** - Real-time subscriptions and database

### Key Libraries
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── landing/        # Landing page components
│   ├── app/            # App-specific components
│   └── auth/           # Authentication components
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   ├── legal/          # Legal practitioner pages
│   ├── dealer/         # Deal maker pages
│   └── user/           # User pages
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API clients
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd happy-server-swap-main
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:
```env

```

4. Start the development server:
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:3000`

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 👥 User Roles

### Admin
- Full system administration
- Client management
- Audit logs
- System reports

### Legal Practitioner
- Document review
- Compliance rule management
- Legal reports
- Risk assessment

### Deal Maker
- Document upload
- Deal management
- Risk analysis
- Compliance reports

### User
- Personal dashboard
- Document upload
- Document management
- Personal reports

## 🔐 Authentication

The application uses JWT-based authentication with role-based access control (RBAC). Protected routes are guarded based on user roles.

## 🎨 UI Components

The project uses shadcn/ui components built on Radix UI primitives, including:
- Buttons, Inputs, Forms
- Dialogs, Alerts, Toasts
- Tables, Cards, Accordions
- Navigation menus
- And many more...

## 📄 License

This project is private and confidential.

## 🤝 Support

For support and questions, please contact the development team.
