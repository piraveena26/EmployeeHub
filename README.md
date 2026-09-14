# EmployeeHub – Modern Enterprise Employee Management System

[![Angular](https://img.shields.io/badge/Angular-21.2-dd0031.svg?logo=angular)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-5.0-092e20.svg?logo=django)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.15-red.svg)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ed.svg?logo=docker)](https://www.docker.com/)

**EmployeeHub** is a modern, scalable, secure, and production-ready **Employee Management System (HRMS)** engineered with a modular three-tier architecture. It delivers comprehensive workforce operations—from employee directory and attendance tracking to leave approvals, timesheet management, payroll processing, and performance appraisals.

---

## 🏛️ System Architecture

EmployeeHub follows a strict three-tier separation of concerns:

```text
                         EMPLOYEEHUB
                              │
                              ▼
                    ┌──────────────────┐
                    │      USERS       │
                    │ Super Admin / HR │
                    │ Manager / Staff  │
                    └────────┬─────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    ANGULAR FRONTEND                         │
│                                                             │
│  Role-Specific Dashboards (HR, Manager, Employee)           │
│  Workforce Directory & Profile Management                   │
│  Punch Terminal & Attendance Logs                           │
│  Leave Management & Quota Tracking                          │
│  Weekly Timesheets & Task Allocation                        │
│  Payroll Processing & PDF Payslips                          │
│  Performance Goals & Appraisals                             │
│  Audit Reports & CSV/Excel Exports                          │
│                                                             │
│  Shared UI Component System (Table, Modal, Badges, Toasts)  │
│  Reactive State Management (Signals)                        │
│  JWT Interceptors & Role Guards                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ REST API / JSON
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  DJANGO BACKEND                             │
│                                                             │
│              Django REST Framework                          │
│                                                             │
│  Authentication & Role-Based Access (RBAC)                  │
│  Employees, Departments, Designations & Shifts              │
│  Attendance & Punch Tracking Logic                          │
│  Leave Allocations & Approval Workflows                     │
│  Timesheet Hours Validation                                 │
│  Payroll Engine & Salary Structures                         │
│  Performance Period Evaluators                              │
│  In-App Notifications                                       │
│  Modular Serializers & API ViewSets                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Django ORM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     POSTGRESQL                              │
│                                                             │
│  Normalized Schemas, Foreign Keys, Constraints & Indexes    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **Dashboard** | Executive KPI cards, 7-day attendance trend charts, workforce distribution by department, pending approval alerts, and personal employee self-service widgets. |
| **Employee Management** | Full workforce directory with dual Card Grid and Table views, instant debounced search, multi-facet filtering (Department, Status), onboarding modal, 3-tab detailed profile (Overview, Personal/Emergency, Compensation), and activation/deactivation workflows. |
| **Organization Management** | 4 sub-modules for corporate configuration: **Departments**, **Designations**, **Job Roles**, and operational **Shifts** with employee counts and status controls. |
| **Attendance Management** | Real-time Punch Terminal console with live clock, optional punch notes, daily check-in/out triggers, tardiness/half-day flag detection, and historical attendance logs. |
| **Leave Management** | Quota balance tracking (Annual, Casual, Medical, Unpaid), leave application modal with date range calculation, and a supervisor approval/rejection queue with confirmation dialogs. |
| **Timesheets** | Work allocation assignments, weekly hour entry grids, timesheet submission workflows, and manager review queues. |
| **Payroll & Payslips** | Automated compensation calculation (`Gross = Basic + Allowances`, `Net = Gross - Deductions`), monthly payroll processing cycles, and an official **Payslip Preview & Print Modal**. |
| **Performance & Goals** | Quarterly review cycles, OKR/KPI milestone progress bars, formal self & manager appraisals, rating scoring, and goal creation modals. |
| **Reports & Exports** | Audit report generators for Workforce Master, Attendance Logs, and Payroll Summary with live data streaming preview tables and CSV/Excel downloads. |
| **Notifications** | In-app notification center popover with unread badge counters and mark-as-read actions. |

---

## 🎨 Shared UI Design System

EmployeeHub uses **Angular Material** and **Tailwind CSS** without custom `.css` stylesheets, adhering to strict utility-first standards:

- **`DataTableComponent`** (`src/app/shared/tables/data-table.component.ts`): Generic typed columns, column sorting cycles, custom cell templates, empty/error/loading states, and action button slots.
- **`StatusBadgeComponent`** (`src/app/shared/components/status-badge.component.ts`): Standardized semantic status tokens (Emerald for Active/Approved/Paid, Amber for Pending/Late/On Leave, Rose for Inactive/Rejected/Absent, Indigo for Roles).
- **`SearchBarComponent`** (`src/app/shared/components/search-bar.component.ts`): Debounced query emissions, clear button, and accessible keyboard escape handling.
- **`FilterBarComponent`** (`src/app/shared/components/filter-bar.component.ts`): Dynamic dropdown filters with active filter counts and reset capability.
- **`PaginationComponent`** (`src/app/shared/components/pagination.component.ts`): Page size options (`10`, `25`, `50`, `100`), item counters, and visible page navigation.
- **`ModalComponent` & `ConfirmDialogComponent`** (`src/app/shared/dialogs/`): Accessible overlays with backdrop blur, Escape key dismissal, and danger/warning/info variants.
- **`ToastComponent` & `ToastService`** (`src/app/shared/components/toast.component.ts`): Signal-driven floating notification alerts across all user actions.
- **`ErrorStateComponent` & `EmptyStateComponent`**: Built-in resilience with actionable retry buttons and empty-state guidance.

---

## 📁 Repository Structure

```text
EmployeeHub/
├── docker-compose.yml              # Multi-container orchestration (DB + Backend + Frontend)
├── README.md                       # Master documentation
│
├── frontend/                       # Angular 21 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Guards, Interceptors, Models, Services
│   │   │   │   ├── guards/         # authGuard, roleGuard
│   │   │   │   ├── interceptors/   # jwtInterceptor
│   │   │   │   ├── models/         # TypeScript interfaces & types
│   │   │   │   └── services/       # AuthService, EmployeeService, ToastService, etc.
│   │   │   │
│   │   │   ├── shared/             # Reusable UI Component Library
│   │   │   │   ├── components/     # StatusBadge, SearchBar, FilterBar, Pagination, etc.
│   │   │   │   ├── dialogs/        # Modal, ConfirmDialog
│   │   │   │   └── tables/         # Generic DataTableComponent
│   │   │   │
│   │   │   ├── layouts/            # Master application shells
│   │   │   │   ├── auth-layout/    # Split-screen modern login layout
│   │   │   │   └── main-layout/    # Responsive sidebar, header, and mobile drawer
│   │   │   │
│   │   │   └── features/           # Feature-based domain views
│   │   │       ├── authentication/ # Login with 1-click demo autofill
│   │   │       ├── dashboard/      # Executive KPIs & personal metrics
│   │   │       ├── employees/      # Workforce directory & profile
│   │   │       ├── organization/   # Departments, Designations, Roles, Shifts
│   │   │       ├── attendance/     # Punch terminal & log tables
│   │   │       ├── leave/          # Leave balances & approval queue
│   │   │       ├── timesheets/     # Work allocation & hours entry
│   │   │       ├── payroll/        # Payroll run & printable payslips
│   │   │       ├── performance/    # Review cycles, goals & appraisals
│   │   │       └── reports/        # Data audit & exports
│   │   │
│   │   ├── index.html
│   │   ├── styles.scss             # Tailwind directives & Angular Material base
│   │   └── main.ts
│   │
│   ├── angular.json
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/                        # Django REST Framework Backend
    ├── config/                     # Django core settings, routing & ASGI/WSGI
    ├── authentication/             # Custom User model, JWT tokens & roles
    ├── employees/                  # Employee profile CRUD & state toggles
    ├── organization/               # Departments, Designations, Job Roles, Shifts
    ├── attendance/                 # Punch in/out timestamps & work hour calculators
    ├── leave_management/           # Quotas, balances & approval review
    ├── timesheets/                 # Task allocations & weekly logs
    ├── payroll/                    # Salary structures, payslips & periods
    ├── performance/                # Review periods, goals & evaluation ratings
    ├── notifications/              # Database-stored in-app alerts
    ├── reports/                    # Data aggregation & CSV/Excel exports
    ├── manage.py
    └── requirements.txt
```

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20+` or `v24+` with `npm 10+`
- **Python**: `3.11+` or `3.12+`
- **PostgreSQL**: `16+` (or via Docker)
- **Docker & Docker Compose** (optional for containerized deployment)

---

### 1. Running via Docker Compose (Recommended)

To spin up PostgreSQL, Django REST API, and Angular frontend in orchestrated containers:

```bash
# Clone the repository
git clone https://github.com/piraveena26/EmployeeHub.git
cd EmployeeHub

# Build and start all services
docker-compose up --build
```

- **Frontend**: Accessible at [http://localhost:4200](http://localhost:4200)
- **Backend API**: Accessible at [http://localhost:8000/api/](http://localhost:8000/api/)
- **PostgreSQL**: Running on port `5432`

---

### 2. Manual Frontend Setup

```bash
cd frontend

# Install dependencies (Angular 21, Tailwind, Material)
npm install --legacy-peer-deps

# Start the Angular development server
npm start
```
Open [http://localhost:4200](http://localhost:4200) in your browser.

#### Running Frontend Unit Tests
```bash
npm test
# Or directly via Angular CLI:
ng test --watch=false
```

#### Running TypeScript Compilation / Lint
```bash
./node_modules/.bin/tsc --noEmit
```

---

### 3. Manual Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Apply database migrations
python manage.py migrate

# Seed initial organization & employee data
python manage.py seed_data

# Run development server
python manage.py runserver
```
Backend API will be live at [http://localhost:8000](http://localhost:8000).

---

## 🧪 Testing & Verification

Every module undergoes rigorous testing before marking tasks as complete:
- **Unit Testing**: Tests components and services in isolation.
- **Edge Case Validation**: Handles `null`, empty arrays, and search misses with `EmptyStateComponent`.
- **Failure States**: Every screen implements an `ErrorStateComponent` with an actionable retry button (Rule 5).
- **Zero CSS Violation**: Strictly enforces Tailwind CSS utility classes and prevents rogue `.css` overrides.

---

## 🔐 Security & Roles

EmployeeHub features Role-Based Access Control (RBAC):
- **Super Admin**: Full administrative control across organization, payroll, and users.
- **HR Manager**: Manages workforce profiles, compensation, organization structures, and reports.
- **Manager**: Team-level visibility, timesheet review, leave approvals, and appraisals.
- **Employee**: Self-service portal (check-in/out, leave applications, timesheet entry, payslip download).

> [!CAUTION]
> Never commit secrets or API keys to version control. Maintain confidential keys (`SECRET_KEY`, `DB_PASSWORD`, `JWT_SECRET`) strictly inside `.env` files.

---

## 📄 License

This project is licensed under the MIT License. Developed as a production-grade enterprise HRMS.
