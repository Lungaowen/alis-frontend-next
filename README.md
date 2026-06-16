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

## � Architecture & Data Flow

### Overview

The application follows a layered architecture where pages interact with a centralized API client (`alis.ts`), which then routes requests to the appropriate backend service through specialized API clients.

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Pages                              │
│  (AdminDashboard, LegalDashboard, DealerDashboard, UserDashboard) │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      alis.ts (Central API)                       │
│  - Typed interfaces (DocumentItem, ReportInfo, Rule, etc.)      │
│  - High-level functions (uploadDocument, getMyDocuments, etc.)   │
│  - Routes to appropriate API layer based on operation           │
└────────┬──────────────────────┬──────────────────┬──────────────┘
         │                      │                  │
         ▼                      ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   http.ts        │  │   javaApi.ts     │  │  pythonApi.ts    │
│  (General HTTP)  │  │  (Java Spring    │  │  (Python FastAPI)│
│                  │  │   Boot API)      │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Java API        │  │  Java API        │  │  Python API      │
│  (Auth, Admin,   │  │  (Documents,     │  │  (Analysis,      │
│   Rules, etc.)   │  │   Profile)       │  │   Reports, PDF)  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Component Flow Examples

#### 1. Admin Dashboard Data Flow

```
AdminDashboard.tsx
  ↓ (useEffect)
adminDashboard() from alis.ts
  ↓
httpGet("/api/admin/dashboard") from http.ts
  ↓
http axios instance (with auth interceptor)
  ↓
Java Spring Boot API: GET /api/admin/dashboard
  ↓
Returns: AdminDashboardData (stats, clients, reports, etc.)
  ↓
AdminDashboard renders charts and tables
```

**Code Flow:**
- `AdminDashboard.tsx` → `adminDashboard()` → `httpGet()` → `http` → Java API

#### 2. Legal Dashboard Document Flow

```
LegalDashboard.tsx
  ↓ (useEffect)
getMyDocuments() from alis.ts
  ↓
jGet("/api/client/documents") from javaApi.ts
  ↓
javaApi axios instance (with auth interceptor)
  ↓
Java Spring Boot API: GET /api/client/documents
  ↓
Returns: DocumentItem[]
  ↓
LegalDashboard renders document list with status badges
```

**Code Flow:**
- `LegalDashboard.tsx` → `getMyDocuments()` → `jGet()` → `javaApi` → Java API

#### 3. Document Upload Flow

```
UploadAndPoll component
  ↓
uploadDocument(file, options) from alis.ts
  ↓
1. axios.post() to external processing API
  ↓
2. insertFileMetadataDirect() → Supabase direct connection
  ↓
3. extractTextFromPDF() → client-side PDF.js
  ↓
4. insertDocumentContentDirect() → Supabase direct connection
  ↓
5. insertAuditLogDirect() → Supabase direct connection
  ↓
Returns: UploadResponse
  ↓
Component polls for analysis status
```

**Code Flow:**
- `UploadAndPoll` → `uploadDocument()` → Multiple API calls (external API + Supabase)

#### 4. Analysis Report Flow

```
LegalReportDetail.tsx / DealerReportDetail.tsx
  ↓
getDetailedReport(documentId) from alis.ts
  ↓
axios.get() to external API
  ↓
Python FastAPI: GET /api/analysis/report/{documentId}
  ↓
Returns: DetailedReport (clauses, analysis, entities, keywords, etc.)
  ↓
insertDocumentContentDirect() → Supabase (for extracted text)
  ↓
Component renders detailed report with risk assessments
```

**Code Flow:**
- `ReportDetail` → `getDetailedReport()` → `axios` → Python API → Supabase

#### 5. Authentication Flow

```
LoginPage.tsx / RegisterPage.tsx
  ↓
login() / register() from AuthContext
  ↓
apiLogin() / apiRegister() from auth.ts
  ↓
httpPost("/api/auth/login") or httpPost("/api/auth/register")
  ↓
http axios instance
  ↓
Java Spring Boot API: POST /api/auth/login or /api/auth/register
  ↓
Returns: AuthSession (token, clientId, role, etc.)
  ↓
storeSession() → localStorage
  ↓
AuthContext updates state
  ↓
ProtectedRoute checks role and redirects appropriately
```

**Code Flow:**
- `LoginPage` → `AuthContext.login()` → `auth.ts` → `httpPost()` → `http` → Java API

### API Layer Responsibilities

#### alis.ts (Central API Client)
- **Purpose**: Single entry point for all API operations
- **Responsibilities**:
  - Defines TypeScript interfaces for all data models
  - Provides high-level functions for common operations
  - Routes requests to appropriate API layer
  - Handles complex multi-step operations (upload with metadata)
  - Manages direct Supabase connections for specific operations

#### http.ts (General HTTP Client)
- **Purpose**: Centralized axios instance for Java API
- **Responsibilities**:
  - Dynamic base URL configuration (runtime override support)
  - JWT token attachment from localStorage
  - 401/403 error handling with session cleanup
  - Custom error classes (AlisForbiddenError, AlisApiError)
  - Typed convenience methods (httpGet, httpPost, etc.)

#### javaApi.ts (Java API Client)
- **Purpose**: Specialized client for Java Spring Boot API
- **Responsibilities**:
  - Document operations (getMyDocuments, getDocument, deleteDocument)
  - Admin operations (getDashboard)
  - JWT token management
  - 401 error handling with redirect to login
  - Typed convenience methods (jGet, jPost, etc.)

#### pythonApi.ts (Python API Client)
- **Purpose**: Specialized client for Python FastAPI
- **Responsibilities**:
  - Analysis operations (triggerAnalysis, getStatus, getResult)
  - Report operations (getAnalysisReport, download PDF)
  - Search operations
  - JWT token attachment
  - Binary file download support (pDownload)

#### api.ts (Base URL Configuration)
- **Purpose**: Runtime API base URL management
- **Responsibilities**:
  - Resolution order: localStorage override → env variable → fallback
  - Runtime base URL changes without reload
  - URL construction helper (apiUrl)

### Context Providers

#### AuthContext
- **Purpose**: Global authentication state management
- **Responsibilities**:
  - Store and retrieve session from localStorage
  - Provide login/logout functions
  - Expose authentication state (session, isAuthenticated, role)
  - Session persistence across page refreshes

#### ThemeContext
- **Purpose**: Global theme state management
- **Responsibilities**:
  - Manage light/darkblue theme state
  - Persist theme preference to localStorage
  - Apply theme classes to document element
  - Provide theme toggle functionality

### State Management Flow

```
Component Mount
  ↓
useAuth() hook
  ↓
AuthContext reads localStorage
  ↓
Session restored (if exists)
  ↓
Component makes API call
  ↓
http/javaApi/pythonApi interceptors attach token
  ↓
API request sent with Bearer token
  ↓
Response received
  ↓
Component updates local state (useState)
  ↓
UI re-renders with new data
```

### Error Handling Flow

```
API Request Fails (401/403)
  ↓
http/javaApi/pythonApi interceptor catches error
  ↓
Session cleared from localStorage
  ↓
User redirected to /login
  ↓
Error message displayed (if applicable)
  ↓
User can re-authenticate
```

## �📄 License

This project is private and confidential.

## 🤝 Support

For support and questions, please contact the development team.
