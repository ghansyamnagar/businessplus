# PrimaPlus — Frontend Documentation

> **Template**: Materialize MUI Next.js Admin Template v5.0  
> **Framework**: Next.js 15 (App Router + Turbopack)  
> **Language**: TypeScript  
> **Last Updated**: March 2026

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Folder Structure](#2-folder-structure)
3. [Getting Started](#3-getting-started)
4. [Environment Variables](#4-environment-variables)
5. [Routing & Page Structure](#5-routing--page-structure)
6. [Authentication Flow](#6-authentication-flow)
7. [State Management (Redux + Saga)](#7-state-management-redux--saga)
8. [API Layer](#8-api-layer)
9. [Module-Wise Breakdown](#9-module-wise-breakdown)
10. [Layout System](#10-layout-system)
11. [Theming & Customization](#11-theming--customization)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Reusable Components](#13-reusable-components)
14. [Type Definitions](#14-type-definitions)
15. [Key Files Reference](#15-key-files-reference)
16. [Conventions & Patterns](#16-conventions--patterns)

---

## 1. Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router) | 15.1.2 |
| **Language** | TypeScript | 5.5.4 |
| **UI Library** | MUI (Material UI) | 6.2.1 |
| **CSS** | TailwindCSS + Emotion (CSS-in-JS) | 3.4.17 |
| **State Management** | Redux Toolkit | 2.5.0 |
| **Side Effects** | Redux Saga | 1.4.2 |
| **Authentication** | NextAuth.js | 4.24.11 |
| **Forms** | React Hook Form + Valibot | 7.54.1 / 0.42.1 |
| **Data Tables** | TanStack React Table | 8.20.6 |
| **Charts** | ApexCharts + Recharts | 3.49.0 / 2.15.0 |
| **Rich Text Editor** | TipTap | 2.10.4 |
| **Icons** | Iconify + Bootstrap Icons | — |
| **HTTP Client** | Axios (via `src/utils/api.ts`) | — |
| **Notifications** | React Toastify | 10.0.6 |
| **Date Handling** | date-fns | 4.1.0 |
| **Router (client)** | React Router DOM (used in some views) | 7.8.1 |
| **ORM** | Prisma Client (for NextAuth adapter) | 5.22.0 |

---

## 2. Folder Structure

```
frontend/
├── public/                          # Static assets (images, favicon)
├── src/
│   ├── @core/                       # Core UI engine (DO NOT MODIFY unless theming)
│   │   ├── components/              # Customizer, ScrollToTop, etc.
│   │   ├── contexts/                # Settings context
│   │   ├── hooks/                   # useSettings, useImageVariant, useObjectCookie
│   │   ├── styles/                  # Core CSS styles
│   │   ├── svg/                     # SVG icon components
│   │   ├── tailwind/                # Tailwind plugin
│   │   ├── theme/                   # MUI theme overrides (43 files)
│   │   │   ├── overrides/           # Component-level MUI overrides
│   │   │   └── index.ts             # Theme entry point
│   │   ├── types.ts                 # Core type definitions
│   │   └── utils/                   # Server helpers
│   │
│   ├── @layouts/                    # Layout system
│   │   ├── BlankLayout.tsx          # Empty layout (auth pages)
│   │   ├── VerticalLayout.tsx       # Sidebar + Content layout
│   │   ├── HorizontalLayout.tsx     # Top nav + Content layout
│   │   ├── LayoutWrapper.tsx        # Picks layout based on settings
│   │   ├── components/              # Layout sub-components
│   │   └── styles/                  # Layout-specific styles
│   │
│   ├── @menu/                       # Navigation menu engine
│   │   ├── components/              # Menu item components (MenuItem, SubMenu, etc.)
│   │   ├── contexts/                # Menu state contexts
│   │   ├── hooks/                   # Menu hooks
│   │   ├── horizontal-menu/         # Horizontal menu variant
│   │   ├── vertical-menu/           # Vertical (sidebar) menu variant
│   │   ├── styles/                  # Menu CSS (23 files)
│   │   ├── types.ts                 # Menu type definitions
│   │   └── defaultConfigs.ts        # Default menu configuration
│   │
│   ├── app/                         # ✅ Next.js App Router (PAGES)
│   │   ├── [lang]/                  # Language dynamic segment (en/fr/ar)
│   │   │   ├── layout.tsx           # Root layout with i18n
│   │   │   ├── (dashboard)/         # Dashboard route group
│   │   │   │   └── (private)/       # ⛔ Auth-protected routes
│   │   │   │       ├── layout.tsx   # Dashboard layout (AuthGuard + sidebar)
│   │   │   │       ├── apps/        # All application pages
│   │   │   │       ├── dashboards/  # Dashboard pages
│   │   │   │       ├── pages/       # Utility pages
│   │   │   │       ├── charts/      # Chart pages
│   │   │   │       ├── forms/       # Form pages
│   │   │   │       └── react-table/ # Table demo page
│   │   │   └── (blank-layout-pages)/ # 🔓 Public pages (login, register, etc.)
│   │   ├── api/                     # Next.js API routes
│   │   │   ├── auth/[...nextauth]/  # NextAuth handler
│   │   │   └── login/               # Legacy login route
│   │   ├── front-pages/             # Public-facing landing pages
│   │   └── globals.css              # Global CSS
│   │
│   ├── components/                  # ✅ Shared reusable components
│   │   ├── AuthRedirect.tsx         # Redirects unauthenticated users
│   │   ├── GenerateMenu.tsx         # Dynamic menu renderer
│   │   ├── Providers.tsx            # App-wide providers (Theme, Redux, etc.)
│   │   ├── Link.tsx                 # Localized Link component
│   │   ├── common/                  # Common components
│   │   │   ├── DepartmentWiseData.tsx   # Department filter component
│   │   │   ├── RichTextEditor.tsx       # TipTap rich text editor
│   │   │   └── chart/                   # Chart components
│   │   ├── card-statistics/         # Statistics card variants
│   │   ├── dialogs/                 # Modal dialogs (16 types)
│   │   │   ├── confirmation-dialog/
│   │   │   ├── confirmation-popup/
│   │   │   ├── role-dialog/
│   │   │   ├── permission-dialog/
│   │   │   └── ...more
│   │   ├── layout/                  # Layout-specific components
│   │   │   ├── shared/              # Navbar components
│   │   │   │   ├── Logo.tsx
│   │   │   │   ├── UserDropdown.tsx
│   │   │   │   ├── NotificationsDropdown.tsx
│   │   │   │   ├── ModeDropdown.tsx (dark/light toggle)
│   │   │   │   ├── LanguageDropdown.tsx
│   │   │   │   ├── BusinessYearSelector.tsx
│   │   │   │   ├── SelectedUnitData.tsx
│   │   │   │   └── search/
│   │   │   ├── vertical/            # Sidebar navigation components
│   │   │   └── horizontal/          # Top navigation components
│   │   ├── pricing/                 # Pricing components
│   │   ├── stepper-dot/             # Stepper components
│   │   └── theme/                   # Theme provider components
│   │
│   ├── configs/                     # ✅ App configuration
│   │   ├── themeConfig.ts           # App name, home URL, layout settings
│   │   ├── primaryColorConfig.ts    # Color palette
│   │   └── i18n.ts                  # i18n config (en, fr, ar)
│   │
│   ├── contexts/                    # React contexts
│   │   ├── nextAuthProvider.tsx      # NextAuth SessionProvider
│   │   └── intersectionContext.tsx   # Intersection Observer context
│   │
│   ├── data/                        # Static data
│   │   ├── navigation/
│   │   │   ├── verticalMenuData.tsx  # Sidebar menu items definition
│   │   │   └── horizontalMenuData.tsx # Top menu items definition
│   │   ├── dictionaries/            # Translation files (en, fr, ar)
│   │   └── searchData.ts            # Global search data
│   │
│   ├── fake-db/                     # Mock data for demo features
│   │   ├── apps/                    # Mock data for inbox, calendar, etc.
│   │   └── pages/                   # Mock data for FAQ, pricing, etc.
│   │
│   ├── hocs/                        # ✅ Higher-Order Components
│   │   ├── AuthGuard.tsx            # Protects routes — redirects if no session
│   │   ├── GuestOnlyRoute.tsx       # Redirects logged-in users away from auth pages
│   │   └── TranslationWrapper.tsx   # Wraps components with i18n dictionary
│   │
│   ├── hooks/                       # Custom React hooks
│   │
│   ├── libs/                        # ✅ Library configurations
│   │   ├── auth.ts                  # NextAuth configuration (credentials provider)
│   │   ├── ApexCharts.tsx           # Lazy-loaded ApexCharts
│   │   ├── ReactPlayer.tsx          # Lazy-loaded ReactPlayer
│   │   ├── Recharts.tsx             # Lazy-loaded Recharts
│   │   └── styles/                  # Third-party CSS overrides
│   │
│   ├── prisma/                      # Prisma ORM
│   │   └── schema.prisma            # DB schema (for NextAuth adapter)
│   │
│   ├── redux-store/                 # ✅ Redux state management
│   │   ├── index.ts                 # Store setup (RTK + Saga middleware)
│   │   ├── rootSaga.ts              # Root saga (combines all module sagas)
│   │   ├── ReduxProvider.tsx         # Redux Provider wrapper
│   │   └── slices/                  # Feature slices (see Section 7)
│   │
│   ├── types/                       # ✅ TypeScript type definitions
│   │   ├── next-auth.d.ts           # NextAuth session/user type extensions
│   │   ├── menuTypes.ts             # Menu item types
│   │   └── apps/                    # Per-module type definitions (20 files)
│   │
│   ├── utils/                       # ✅ Utility functions
│   │   ├── api.ts                   # Axios instance with interceptors
│   │   ├── i18n.ts                  # URL localization helper
│   │   ├── getDictionary.ts         # Load translation dictionary
│   │   ├── getInitials.ts           # Get name initials
│   │   └── string.ts               # String utilities
│   │
│   └── views/                       # ✅ Page-level view components (500+ files)
│       ├── apps/                    # Business module views (see Section 9)
│       ├── dashboards/              # Dashboard views (CRM, Analytics, E-Commerce)
│       ├── pages/                   # Utility page views
│       ├── charts/                  # Chart demo views
│       ├── forms/                   # Form demo views
│       ├── front-pages/             # Landing page views
│       └── react-table/             # Table demo views
│
├── .env                             # Environment variables
├── .env.example                     # Env template
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

---

## 3. Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and configure
cp .env.example .env
# Edit .env with your API URL, NextAuth secret, etc.

# 3. Generate Prisma client & build icons
npm run postinstall

# 4. Run development server (with Turbopack)
npm run dev

# 5. Open in browser
# → http://localhost:3000
# → Redirects to /en/dashboards/crm
```

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev --turbopack` | Start dev server with Turbopack |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `lint` | `next lint` | ESLint check |
| `lint:fix` | `next lint --fix` | Auto-fix lint issues |
| `format` | `prettier --write "src/**/*.{js,jsx,ts,tsx}"` | Format code |
| `build:icons` | `tsx src/assets/iconify-icons/bundle-icons-css.ts` | Bundle icon CSS |
| `migrate` | `dotenv -e .env -- npx prisma migrate dev` | Run Prisma migrations |

---

## 4. Environment Variables

File: `.env`

```env
# ─── App ──────────────────────────────────
BASEPATH=                                    # Base path prefix (leave empty for root)
NEXT_PUBLIC_APP_URL=http://localhost:3000     # Frontend app URL

# ─── Authentication ──────────────────────
NEXTAUTH_BASEPATH=${BASEPATH}/api/auth        # NextAuth route prefix
NEXTAUTH_URL=http://localhost:3000            # ⚠️ Must point to YOUR Next.js app, NOT backend
NEXTAUTH_SECRET=your-secret-key               # JWT encryption secret

# ─── Google OAuth (optional) ─────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ─── Backend API ─────────────────────────
API_URL=http://192.168.1.39/businessplus/public/index.php/api  # Backend base URL
NEXT_PUBLIC_API_URL=${API_URL}               # Exposed to client-side code

# ─── Database (Prisma / NextAuth) ────────
DATABASE_URL=                                # DB connection string

# ─── Mapbox (optional) ──────────────────
MAPBOX_ACCESS_TOKEN=
```

> **Important**: `NEXTAUTH_URL` should always point to where your Next.js app runs (e.g., `http://localhost:3000`), **not** the backend API.

---

## 5. Routing & Page Structure

### How Next.js App Router Works Here

The app uses **dynamic language segments** (`[lang]`) and **route groups** to organize pages:

```
/en/dashboards/crm          → CRM Dashboard
/en/apps/kpiTracker          → KPI Tracker
/en/apps/strategicObjective  → Strategic Objectives
/en/login                    → Login page
```

### Route Groups Explained

| Route Group | Path | Auth Required | Layout |
|---|---|---|---|
| `(dashboard)/(private)` | `/[lang]/dashboards/*`, `/[lang]/apps/*` | ✅ Yes (AuthGuard) | Dashboard (sidebar + navbar) |
| `(blank-layout-pages)` | `/[lang]/login`, `/[lang]/register` | ❌ No (GuestOnly) | Blank (no sidebar) |
| `front-pages` | `/front-pages/*` | ❌ No | Landing page |

### Page → View Mapping

Next.js `app/` pages are thin wrappers that render corresponding **view components** from `src/views/`:

```
app/[lang]/(dashboard)/(private)/apps/kpiTracker/page.tsx
    └── renders → views/apps/kpiTracker/kpidata/KpiDataPage.tsx
```

This separation keeps routing logic clean and view logic reusable.

### Default Redirects (next.config.ts)

| From | To |
|---|---|
| `/` | `/en/dashboards/crm` |
| `/en` | `/en/dashboards/crm` |
| Any non-locale path | Prefixed with `/en/` |

---

## 6. Authentication Flow

### Overview

Authentication is handled by **NextAuth.js v4** with a **Credentials Provider** (email + password).

### Files Involved

| File | Role |
|---|---|
| `src/libs/auth.ts` | NextAuth configuration (providers, callbacks, session strategy) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API handler |
| `src/hocs/AuthGuard.tsx` | Server-side auth check — redirects if no session |
| `src/hocs/GuestOnlyRoute.tsx` | Redirects logged-in users away from login page |
| `src/contexts/nextAuthProvider.tsx` | Client-side `SessionProvider` |
| `src/redux-store/slices/auth/auth.saga.ts` | Login/Register saga (calls `signIn()`) |
| `src/redux-store/slices/auth/auth.slice.ts` | Auth actions (`loginRequest`, `registerRequest`) |
| `src/types/next-auth.d.ts` | Extended session/user types |

### Login Flow (Step-by-Step)

```
1. User submits login form (Login.tsx)
        ↓
2. Dispatches loginRequest action (Redux)
        ↓
3. auth.saga.ts → calls signIn('credentials', { email, password, redirect: false })
        ↓
4. NextAuth handler → /api/auth/callback/credentials
        ↓
5. authorize() in libs/auth.ts → calls backend API: POST /api-user-login
        ↓
6. Backend returns user data + access token
        ↓
7. NextAuth creates JWT session (encrypted with NEXTAUTH_SECRET)
        ↓
8. jwt() callback → stores user data in JWT token
        ↓
9. session() callback → exposes user data in session
        ↓
10. Saga callback → redirects to dashboard or company-setup
```

### Session Data Available (via `useSession()`)

```typescript
session.user = {
    id: string,
    name: string,
    email: string,
    role: any,                  // role ID
    role_name: string,          // role name
    accessToken: string,        // API access token
    designation: string,
    profile_picture: string,
    company_id: number,
    company_details: boolean,   // true = company setup done
    step_no: number,
    company_step_id: number,
    step_name: string,
    unit_id: number,
    dept_id: number,
    unit_selected: any,         // currently selected unit
    userSelectedYear: number    // selected business year
}
```

### Post-Login Routing Logic

```typescript
if (company_details === 'true') {
    // Company setup is complete → go to unit selection
    redirect → /pages/unit-home
    // Also fetches module permissions via getMenuRequest saga
} else {
    // Company not set up → go to company setup wizard
    redirect → /company-setup
}
```

---

## 7. State Management (Redux + Saga)

### Architecture

```
┌───────────────┐     dispatch      ┌──────────────┐
│  Component     │ ───────────────► │  Redux Slice  │
│  (useDispatch) │                  │  (actions)    │
└───────────────┘                  └──────┬───────┘
                                          │  watched by
                                          ▼
                                   ┌──────────────┐     API call     ┌──────────┐
                                   │  Redux Saga  │ ──────────────► │  Backend │
                                   │  (worker)    │                  │  API     │
                                   └──────┬───────┘                  └──────────┘
                                          │  callback
                                          ▼
                                   ┌───────────────┐
                                   │  Component     │
                                   │  (updates UI)  │
                                   └───────────────┘
```

### Store Configuration (`redux-store/index.ts`)

```typescript
// Reducers registered in the store:
{
    chatReducer,                    // Chat messages
    calendarReducer,                // Calendar events
    kanbanReducer,                  // Kanban boards
    emailReducer,                   // Email client
    userReducer,                    // User management
    kpiTrackerReducer,              // KPI tracking
    strategicObjectivesReducer,     // Strategic objectives
    initiativesReducer,             // Initiatives
    actionPlansReducer,             // Action plans
    taskTrackersReducer,            // Task tracker
    projectReducer,                 // Projects
    permissionReducer,              // Module-level permissions
    companyReducer                  // Company details cache
}
```

### Slice + Saga Pattern

Every business module follows this 3-file pattern:

```
slices/
└── moduleName/
    ├── moduleName.slice.ts     # Actions & reducers (trigger-only, no state stored)
    ├── moduleName.saga.ts      # API calls using redux-saga
    └── moduleName.types.ts     # TypeScript types for payloads
```

#### Example: KPI Tracker Slice

```typescript
// kpiTracker.slice.ts — Actions (dispatched from components)
{
    getKpiDashboardRequest,           // Fetch KPI dashboard data
    getLeadKpiDashboardRequest,       // Fetch lead KPI dashboard
    getKpiTrackerRequest,             // Fetch KPI list
    addKpiTrackerRequest,             // Create new KPI
    editKpiTrackerRequest,            // Update existing KPI
    deleteKpiTrackerRequest,          // Delete KPI
    getKpiByDepartmentRequest,        // Fetch KPIs by department
    getKpiTrackersTrackRequest,       // Fetch KPI tracking data
    getNewKpiTrackersTrackRequest,    // Fetch new KPI tracking
    updateTargetActualRequest,        // Update KPI target/actual values
    reminderReviewKPIRequest          // Send KPI review reminders
}
```

#### How Components Use It (Callback Pattern)

```typescript
// In a component:
dispatch(
    getKpiTrackerRequest({
        payload: { department_id: 1 },
        callback: (response, error) => {
            if (error) {
                toast.error(error.message)
                return
            }
            setKpiData(response.data)  // Update local state
        }
    })
)
```

> **Note**: Most slices don't store data in Redux state. Instead, they use a **callback pattern** — the saga calls the API and passes the result back to the component via a callback function. Components store data in local `useState`.

### All Sagas (rootSaga.ts)

| Saga | Module | Key API Endpoints |
|---|---|---|
| `authSaga` | Authentication | `/api-user-login`, `/api-user-signup` |
| `userSaga` | User Management | User CRUD operations |
| `masterSaga` | Master Data | Menu permissions, lookup data |
| `kpiTrackerSaga` | KPI Tracker | KPI CRUD, tracking, reminders |
| `strategicObjectivesSaga` | Strategic Objectives | Objective CRUD |
| `initiativesSaga` | Initiatives | Initiative CRUD |
| `actionPlansSaga` | Action Plans | Action plan CRUD |
| `taskTrackersSaga` | Task Tracker | Task CRUD, events |
| `projectSaga` | Projects | `/api-projects`, `/api-view-projects`, `/api-view-single-project`, `/api-delete-projects`, `/api-delete-single-project`, `/api-view-poject-dashboard`, `/api-remark-projects`, `/api-view-projects-remark`, `/api-edit-projects-remark`, `/api-delete-projects-remark`, `/api-poject-view-graph` |

### Permission Management

```typescript
// permissionSlice.ts — Stores module-level permissions
{
    setPermissions(permissions[])    // Set from API response (la_menu)
    clearPermissions()               // Clear on logout
}
// Permissions are also cached in localStorage as 'userModulePermission'
```

---

## 8. API Layer

### Axios Instance (`src/utils/api.ts`)

```typescript
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,  // Backend API URL
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000  // 30 seconds
})
```

- **Request Interceptor**: Available for adding auth tokens (currently commented out)
- **Response Interceptor**: Available for global error handling

### How Sagas Call APIs

```typescript
// In a saga worker:
const response = yield call(api.get, '/api-endpoint', { params })
const response = yield call(api.post, '/api-endpoint', payload)
const response = yield call(api.put, '/api-endpoint', payload)
const response = yield call(api.delete, '/api-endpoint')
```

---

## 9. Module-Wise Breakdown

### 📊 Dashboards (`views/dashboards/`)

| Dashboard | Path | Components |
|---|---|---|
| **CRM** | `/dashboards/crm` | 13 widget components |
| **Analytics** | `/dashboards/analytics` | 12 chart/widget components |
| **E-Commerce** | `/dashboards/ecommerce` | 11 sales/product widgets |

### 🎯 Strategic Planning Modules (`views/apps/`)

| Module | Path | Views | Key Features |
|---|---|---|---|
| **Strategic Objectives** | `/apps/strategicObjective` | 3 files | Create, list, manage organizational objectives |
| **Initiatives** | `/apps/initiatives` | 3 files | Link initiatives to strategic objectives |
| **Action Plans** | `/apps/actionPlans` | 3 files | Create actionable plans with timelines |
| **KPI Tracker** | `/apps/kpiTracker` | 4 sub-dirs | Dashboard, KPI data entry, performance tracking, KPI Data Graph |
| **SWOT Analysis** | `/apps/swot` | 1 file | Tabbed view for Strengths, Weaknesses, Opportunities, Threats (CRUD) |

#### KPI Tracker Sub-Views (`views/apps/kpiTracker/`)

| Sub-View | Path | Description |
|---|---|---|
| **Dashboard** | `kpiTracker/dashboard/` | KPI overview dashboard |
| **KPI Data** | `kpiTracker/kpidata/` | KPI data entry page |
| **Key Performance** | `kpiTracker/keyperformance/` | Key performance indicators view |
| **KPI Data Graph** | `kpiTracker/kpiDataGraph/` | Graphical KPI data visualization |

### ✅ Task & Project Management

| Module | Path | Views | Key Features |
|---|---|---|---|
| **Task Tracker** | `/apps/taskTracker` | 5 files | Dashboard, task list, events |
| **Projects** | `/apps/project` | 5 sub-dirs | Full project lifecycle management (see below) |
| **Kanban Board** | `/apps/kanban` | 7 files | Drag-and-drop task board |

#### Project Module Deep Dive (`views/apps/project/`)

| Sub-Module | Path | Files | Description |
|---|---|---|---|
| **Dashboard** | `project/dashboard/` | `ProjectDashboard.tsx` | Project overview dashboard with graphs |
| **New Project** | `project/newProject/` | `NewProject.tsx` + 5 step components | 5-step project creation/edit wizard |
| **Project Tracker** | `project/projectTracker/` | `ProjectTrackerListTable.tsx`, `ChangeStatusModal.tsx` | List all projects, change status |
| **Single Project Details** | `project/singleProjectDetials/` | `SingleProjectDetials.tsx` + 7 tab files | Detailed project view with tabbed sections |
| **Project Remarks** | `project/projectRemark/` | `ProjectRemarkListTable.tsx`, `AddEditProjectRemark.tsx` | Project remark CRUD |

#### New Project Wizard — 5-Step Form (`project/newProject/`)

The `NewProject.tsx` component is a multi-step wizard supporting both **create** and **edit** modes. Each step is a separate component:

| Step | Component | Form Fields | Description |
|---|---|---|---|
| **1. Add New Project** | `StepProjectDetails.tsx` | `project_name`, `department_id`, `project_mission`, `key_objective`, `start_date`, `end_date`, project logo | Basic project info with date picker and logo upload |
| **2. Project Team** | `StepProjectTeam.tsx` | Leader (`user_id`, `department_id`), Co-Leader (`co_leader_user_id`, `co_leader_dept_id`), Company Users (dynamic array), External Users (dynamic array) | Team member selection with duplicate prevention and multi-dept handling |
| **3. Project Milestones** | `StepMilestones.tsx` | Dynamic array of `milestone_name`, `mile_stone_date`, `symbol`, `description` | Key dates and milestone tracking |
| **4. Project Governance** | `StepGovernance.tsx` | Dynamic array of meetings with `meeting_name`, `chair_person`, `co_chair_person`, `gov_member[]`, `gov_frequency`, `meeting_day`, `gov_venue`, `gov_duration`, `agenda` | Governance meeting configuration |
| **5. Project Budget** | `StepBudget.tsx` | `total_pro_cost`, `currency`, dynamic array of `allocation_dept` with `dept_id` + `allocation_dstrbt_vl` | Budget allocation with remaining balance tracking |

**Key implementation details:**
- Uses `react-hook-form` with `useFieldArray` for dynamic team members, milestones, governance meetings, and budget allocations
- Edit mode fetches project data via `viewSingleProjectRequest` and populates all form fields
- Step navigation is validated per-step before allowing progression
- Selected team members are filtered across dropdowns to prevent duplicate assignment
- Users with multiple department IDs (`multi_dept_id`) show "Senior Executive" as their department
- Budget allocation is validated to not exceed total project cost

#### Single Project Details — Tabbed View (`project/singleProjectDetials/tabs/`)

| Tab | File | Description |
|---|---|---|
| **Project Dashboard** | `ProjectDashboard.tsx` | Project-specific dashboard with charts |
| **Milestone** | `ProjectMilestone.tsx` | Milestone timeline view |
| **Major Activity Plan** | `MajorActivityPlan.tsx` | High-level activity planning |
| **Sub Major Activity Plan** | `SubMajorActivityPlan.tsx` | Detailed sub-activity breakdown |
| **Resource Planning** | `ResourcePlanning.tsx` | Team resource allocation |
| **Activity** | `Activity/` | Activity tracking sub-directory |
| **Milestone (detail)** | `Milestone/` | Milestone detail sub-directory |

### 🏢 Administration (`views/apps/administration/`)

| Sub-Module | Views | Description |
|---|---|---|
| **Users** | 3 files | User CRUD, list, profiles |
| **Departments** | 3 files | Department management |
| **Units** | 3 files | Organizational units |
| **Sections** | 3 files | Sections within units |
| **Priorities** | 3 files | Priority levels (High, Medium, Low) |
| **Unit of Measure** | 3 files | UoM configuration |
| **Vision & Mission** | 2 files | Company vision/mission statements |
| **Company FAQ** | 3 files | Internal FAQ management |
| **Facility Details** | 3 files + 4 sub-dirs | Location, Layout, Machine & Equipment, Infrastructure |
| **Photograph** | 3 files + 3 sub-dirs | Media, Events, Celebration |
| **Product & Services** | 3 files + 3 sub-dirs | Software Development, Product Development, Big Data Services |
| **Product Services** | 3 files + 3 sub-dirs | Alternate product/services views |
| **Procedure & Templates** | 3 sub-dirs | HR, Operations, R&D procedure templates |
| **Procedure Templates** | 3 sub-dirs | HR, Operations, R&D (alternate path) |
| **Governance** | 3 files | Governance management |
| **Presentation** | 3 files | Presentation management |
| **Permissions** | — | Permission management sub-module |

### 🛒 E-Commerce (`views/apps/ecommerce/`)

| Sub-Module | Views | Description |
|---|---|---|
| **Products** | 12 files | Product catalog, add/edit product |
| **Orders** | 10 files | Order list, order details |
| **Customers** | 19 files | Customer profiles, list |
| **Manage Reviews** | 3 files | Product review moderation |
| **Referrals** | 4 files | Referral tracking |
| **Settings** | 19 files | Store settings, checkout, payments |

### 📦 Logistics (`views/apps/logistics/`)

| Sub-Module | Views | Description |
|---|---|---|
| **Dashboard** | 9 files | Overview, statistics, tables |
| **Fleet** | 4 files | Vehicle tracking |

### 📧 Communication

| Module | Path | Views |
|---|---|---|
| **Email** | `/apps/email` | 10 files |
| **Chat** | `/apps/chat` | 9 files |
| **Calendar** | `/apps/calendar` | 4 files |

### 📄 Other Modules

| Module | Path | Description |
|---|---|---|
| **Invoice** | `/apps/invoice` | Invoice CRUD (14 files) |
| **Academy** | `/apps/academy` | Learning management (14 files) |
| **Roles** | `/apps/roles` | Role management (3 files) |
| **Permissions** | `/apps/permissions` | Permission assignment |
| **Dashboard** (Business) | `/apps/dashboard` | Business plan, KPI overview (15 files) |
| **FAQ** | `/apps/faq` | FAQ management (5 files) |
| **Function Report** | `/apps/functionReport` | Function report with add/edit form, list table, and quarterly summary view |
| **Management Dashboard** | `/apps/managementDashboard` | Management-level dashboard overview |
| **Main Home** | `/apps/mainHome` | Main home/landing page for authenticated users |
| **Prima Plus Navigation** | `/apps/primaPlusNavigation` | Prima process navigation page |
| **User** | `/apps/user` | User profile and management views |

### 📃 Utility Pages (`views/pages/`)

| Page | Description |
|---|---|
| **Auth** | Login, Register, Forgot Password, Reset Password, Two-Step, Verify Email (19 files, multiple variants V1/V2) |
| **Company Setup** | Multi-step company onboarding wizard |
| **Unit Home** | Unit selection page (post-login) |
| **Account Settings** | Profile, security, notifications (17 files) |
| **User Profile** | Public profile view (10 files) |
| **Widget Examples** | 82 widget demo components |
| **Wizard Examples** | Multi-step form examples (11 files) |
| **Dialog Examples** | Modal dialog demos (10 files) |
| **Pricing** | Pricing page |
| **FAQ** | FAQ page |
| **Misc** | 404, 500 error pages |

---

## 10. Layout System

### Layout Types

| Layout | File | Description |
|---|---|---|
| **Vertical** | `@layouts/VerticalLayout.tsx` | Left sidebar + main content (default) |
| **Horizontal** | `@layouts/HorizontalLayout.tsx` | Top nav bar + main content |
| **Blank** | `@layouts/BlankLayout.tsx` | No chrome — used for auth pages |

### Layout Wrapper (`@layouts/LayoutWrapper.tsx`)

Automatically selects vertical or horizontal layout based on `themeConfig.layout` setting.

### Dashboard Layout Hierarchy

```
Providers (Theme, Redux, Direction)
  └── AuthGuard (session check)
        └── LayoutWrapper
              ├── VerticalLayout
              │     ├── Navigation (sidebar)
              │     ├── Navbar (top bar)
              │     ├── {children} (page content)
              │     └── Footer
              └── OR HorizontalLayout
                    ├── Header (top nav)
                    ├── {children} (page content)
                    └── Footer
```

### Navbar Components (shared)

| Component | Description |
|---|---|
| `Logo.tsx` | App logo |
| `UserDropdown.tsx` | User avatar + dropdown menu (profile, logout) |
| `NotificationsDropdown.tsx` | Bell icon with notification list |
| `ModeDropdown.tsx` | Light/Dark mode toggle |
| `LanguageDropdown.tsx` | Language switcher (EN/FR/AR) |
| `BusinessYearSelector.tsx` | Business year picker |
| `SelectedUnitData.tsx` | Shows currently selected unit |
| `search/` | Global search with command palette (cmdk) |

---

## 11. Theming & Customization

### Theme Config (`src/configs/themeConfig.ts`)

```typescript
const themeConfig = {
    templateName: 'PrimaPlus',              // App name
    homePageUrl: '/dashboards/crm',          // Default home page
    mode: 'system',                          // 'system' | 'light' | 'dark'
    skin: 'default',                         // 'default' | 'bordered'
    semiDark: false,                         // Semi-dark mode
    layout: 'vertical',                      // 'vertical' | 'collapsed' | 'horizontal'
    layoutPadding: 24,                       // Content padding (px)
    compactContentWidth: 1600,               // Max content width (px)
    navbar: {
        type: 'fixed',                       // 'fixed' | 'static'
        contentWidth: 'compact',
        floating: false,
        detached: true,
        blur: true                           // Blur effect
    },
    contentWidth: 'compact',
    footer: {
        type: 'static',
        contentWidth: 'compact',
        detached: true
    },
    disableRipple: false,
    toastPosition: 'top-right'
}
```

### MUI Theme Overrides (`@core/theme/`)

Contains 43+ files with custom MUI component overrides for consistent styling:
- Button, TextField, Card, Dialog, Table, Chip, etc.
- Each component has its own override file

### Customizer

The app includes a **live theme customizer** panel (accessible from dashboard) that lets users change:
- Color mode (light/dark/system)
- Skin (default/bordered)
- Layout direction (LTR/RTL)
- Layout type (vertical/horizontal)
- Navbar/Footer settings

Settings are persisted in **cookies**.

---

## 12. Internationalization (i18n)

### Supported Languages

| Language | Code | Direction |
|---|---|---|
| English | `en` | LTR |
| French | `fr` | LTR |
| Arabic | `ar` | RTL |

### How It Works

1. **URL prefix**: Every route has a `[lang]` segment → `/en/dashboards/crm`
2. **Dictionary files**: `src/data/dictionaries/en.ts`, `fr.ts`, `ar.ts`
3. **RTL support**: Arabic uses RTL via `stylis-plugin-rtl` + direction-aware CSS
4. **Middleware**: Non-locale URLs are redirected to `/en/` prefix
5. **Helper**: `getLocalizedUrl(path, locale)` generates locale-prefixed URLs

---

## 13. Reusable Components

### Key Shared Components

| Component | Path | Usage |
|---|---|---|
| `RichTextEditor` | `components/common/RichTextEditor.tsx` | TipTap-based WYSIWYG editor |
| `DepartmentWiseData` | `components/common/DepartmentWiseData.tsx` | Department filter with data display |
| `ConfirmationDialog` | `components/dialogs/confirmation-dialog/` | Delete/action confirmation modal |
| `ConfirmationPopup` | `components/dialogs/confirmation-popup/` | Simple confirm/cancel popup |
| `RoleDialog` | `components/dialogs/role-dialog/` | Role create/edit dialog |
| `PermissionDialog` | `components/dialogs/permission-dialog/` | Permission assignment dialog |
| `OpenDialogOnElementClick` | `components/dialogs/` | HOC: opens dialog when element clicked |
| `GenerateMenu` | `components/GenerateMenu.tsx` | Dynamic menu renderer from data |
| `AuthRedirect` | `components/AuthRedirect.tsx` | Redirect to login with locale |

---

## 14. Type Definitions

### NextAuth Type Extensions (`types/next-auth.d.ts`)

Extends the default NextAuth types with custom fields:

```typescript
// Available on session.user:
{
    id, name, email,
    role, role_name, accessToken,
    designation, profile_picture,
    company_id, company_details,
    step_no, company_step_id, step_name,
    unit_id, dept_id,
    unit_selected, userSelectedYear
}
```

### Per-Module Types (`types/apps/`)

| Type File | Types Defined |
|---|---|
| `userTypes.ts` | User, UserProfile |
| `departmentTypes.ts` | Department |
| `unitTypes.ts` | Unit |
| `sectionTypes.ts` | Section |
| `priorityTypes.ts` | Priority |
| `uomTypes.ts` | UnitOfMeasure |
| `actionPlanTypes.ts` | ActionPlan |
| `initiativeTypes.ts` | Initiative |
| `strategicObjectiveTypes.ts` | StrategicObjective |
| `calendarTypes.ts` | CalendarEvent, CalendarFilter |
| `chatTypes.ts` | Chat, Message |
| `emailTypes.ts` | Email, EmailFolder |
| `kanbanTypes.ts` | KanbanBoard, KanbanTask |
| `ecommerceTypes.ts` | Product, Order, Customer |
| `invoiceTypes.ts` | Invoice |
| `logisticsTypes.ts` | Vehicle |
| `permissionTypes.ts` | Permission |
| `academyTypes.ts` | Course |
| `visionMissionTypes.ts` | VisionMission |
| `companyFaqTypes.ts` | CompanyFaq |

---

## 15. Key Files Reference

| What You Need | File |
|---|---|
| **Add a new page** | `src/app/[lang]/(dashboard)/(private)/apps/yourModule/page.tsx` |
| **Add page view/UI** | `src/views/apps/yourModule/YourComponent.tsx` |
| **Add sidebar menu item** | `src/data/navigation/verticalMenuData.tsx` |
| **Add new Redux slice** | `src/redux-store/slices/yourModule/yourModule.slice.ts` |
| **Add new saga** | `src/redux-store/slices/yourModule/yourModule.saga.ts` |
| **Register saga** | `src/redux-store/rootSaga.ts` |
| **Register reducer** | `src/redux-store/index.ts` |
| **Add new type** | `src/types/apps/yourModuleTypes.ts` |
| **Change app name/home** | `src/configs/themeConfig.ts` |
| **Change API URL** | `.env` → `API_URL` |
| **Modify auth logic** | `src/libs/auth.ts` |
| **Add translations** | `src/data/dictionaries/en.ts` (and fr.ts, ar.ts) |
| **Add dialog/modal** | `src/components/dialogs/your-dialog/` |
| **Modify theme colors** | `src/configs/primaryColorConfig.ts` |
| **MUI component overrides** | `src/@core/theme/overrides/` |

---

## 16. Conventions & Patterns

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| **Slice files** | `camelCase.slice.ts` | `kpiTracker.slice.ts` |
| **Saga files** | `camelCase.saga.ts` | `kpiTracker.saga.ts` |
| **Type files** | `camelCaseTypes.ts` | `kpiTrackerTypes.ts` |
| **View folders** | `camelCase` | `views/apps/kpiTracker/` |
| **Route folders** | `camelCase` | `app/.../apps/kpiTracker/` |
| **Components** | `PascalCase.tsx` | `KpiDataPage.tsx` |
| **Actions** | `camelCaseRequest` | `getKpiTrackerRequest` |

### Redux-Saga Pattern (Callback Style)

This project uses a **callback-based pattern** instead of storing API data in Redux:

```typescript
// 1. SLICE — Define trigger-only action
getDataRequest(state, action: PayloadAction<{ payload: any; callback: Function }>) { }

// 2. SAGA — Call API, invoke callback
function* getDataWorker(action) {
    const { payload, callback } = action.payload
    try {
        const response = yield call(api.get, '/endpoint', { params: payload })
        callback?.(response.data, null)     // success: (data, null)
    } catch (error) {
        callback?.(null, error.response?.data)  // error: (null, error)
    }
}

// 3. COMPONENT — Dispatch and handle response
dispatch(getDataRequest({
    payload: { id: 1 },
    callback: (data, error) => {
        if (error) return toast.error(error.message)
        setLocalState(data)
    }
}))
```

### Adding a New Business Module (Step-by-Step)

```
1. Create types:        src/types/apps/yourModuleTypes.ts
2. Create slice:        src/redux-store/slices/yourModule/yourModule.slice.ts
3. Create types:        src/redux-store/slices/yourModule/yourModule.types.ts
4. Create saga:         src/redux-store/slices/yourModule/yourModule.saga.ts
5. Register saga:       src/redux-store/rootSaga.ts (add to all([...]))
6. Register reducer:    src/redux-store/index.ts (add to reducer object)
7. Create views:        src/views/apps/yourModule/YourComponent.tsx
8. Create page:         src/app/[lang]/(dashboard)/(private)/apps/yourModule/page.tsx
9. Add menu item:       src/data/navigation/verticalMenuData.tsx
```

---

> **Note**: The `@core`, `@layouts`, and `@menu` directories are part of the Materialize template engine. Modifications to these should be minimal and carefully considered. Business logic should live in `views/`, `redux-store/slices/`, and `components/`.
