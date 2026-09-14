# EmployeeHub – Modern Enterprise Employee Management System

[![Angular](https://img.shields.io/badge/Angular-21.2-dd0031.svg?logo=angular)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-5.2-092e20.svg?logo=django)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.18-red.svg)](https://www.django-rest-framework.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57.svg?logo=sqlite)](https://www.sqlite.org/)

**EmployeeHub** is a modern, scalable, secure, and production-ready **Employee Management System (HRMS)** engineered with a modular three-tier architecture. It delivers comprehensive workforce operations — from employee directory and attendance tracking to leave approvals, timesheet management, and payroll processing.

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
│  In-App Notifications                                       │
│  Modular Serializers & API ViewSets                         │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ Django ORM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  SQLite (Development)                       │
│                                                             │
│  Normalized Schemas, Foreign Keys, Constraints & Indexes    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Functional Modules

| Module | Features & Capabilities |
| :--- | :--- |
| **Dashboard** | Executive KPI cards, 7-day attendance trend charts, workforce distribution by department, pending approval alerts, and personal employee self-service widgets. |
| **Employee Management** | Full workforce directory with dual Card Grid and Table views, instant debounced search, multi-facet filtering (Department, Status), onboarding modal with **exclusive HR photo upload privilege** & live portrait preview, 3-tab detailed profile (Overview, Personal/Emergency, Compensation), and activation/deactivation workflows. |
| **Organization Management** | 4 sub-modules for corporate configuration: **Departments**, **Designations**, **Job Roles**, and operational **Shifts** with employee counts and status controls. |
| **Attendance Management** | Real-time Punch Terminal console with live clock, optional punch notes, daily check-in/out triggers, tardiness/half-day flag detection, and historical attendance logs. |
| **Leave Management** | Quota balance tracking (Annual, Casual, Medical, Unpaid), leave application modal with date range calculation, and a supervisor approval/rejection queue with confirmation dialogs. |
| **Timesheets** | Work allocation assignments, weekly hour entry grids, timesheet submission workflows, and manager review queues. |
| **Payroll & Payslips** | HR-triggered monthly payroll runs, automated compensation calculation (`Gross = Basic + Allowances`, `Net = Gross − Deductions`), per-employee payslip generation with in-app notification, and official **PDF Payslip download** via ReportLab. |
| **Reports & Exports** | Audit report generators for Workforce Master, Attendance Logs, and Payroll Summary with live data streaming preview tables and CSV/Excel downloads. |
| **Notifications** | In-app notification center popover with unread badge counters and mark-as-read actions. |

> [!NOTE]
> The **Performance & Goals** module has been intentionally removed from this project as it is not required for the current scope of EmployeeHub.

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
    ├── notifications/              # Database-stored in-app alerts
    ├── reports/                    # Data aggregation & CSV/Excel exports
    ├── manage.py
    └── requirements.txt
```

---

## 📈 Implementation Roadmap & Status

| Phase | Module / Layer | Status | Highlights |
| :--- | :--- | :---: | :--- |
| **Stage 1** | **UI & Shared Design System** | ✅ **Completed** | Shared component library (`DataTable`, `Modal`, `StatusBadge`, `FilterBar`, `SearchBar`, `Pagination`, `Toasts`), zero `.css` Tailwind standard, all feature views built, HR photo upload, 29/29 Vitest tests passing. |
| **Stage 2** | **Frontend Auth & Integration** | ✅ **Completed** | JWT auth with offline demo fallback, role-based guards, Angular proxy to backend, HR employee photo upload with live preview. |
| **Stage 3** | **Backend (Django REST Framework)** | ✅ **Completed** | Python 3.12 venv, all dependencies installed, SQLite database, 9 Django app migrations applied, seed data loaded (4 users, 8 employees, payroll periods, leave balances, notifications). |
| **Stage 4** | **Database & Seeding** | ✅ **Completed** | SQLite schema in place, `seed_data` management command populates all tables with realistic demo data. Production upgrade path to PostgreSQL available via environment variables. |

---

## 🛠️ Getting Started & Local Development

### Prerequisites
- **Node.js**: `v20+` or `v24+` with `npm 10+`
- **Python**: `3.12+`

> [!NOTE]
> This project uses **SQLite** for local development — no PostgreSQL or Docker required.

---

### 🔑 Demo Accounts

These credentials work for both the Angular app (`localhost:4200`) and Django Admin (`localhost:8000/admin/`):

| Role | Email | Username | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@employeehub.com` | `admin` | `admin123` |
| **HR Manager** | `hr@employeehub.com` | `hr` | `hr123` |
| **Team Manager** | `manager@employeehub.com` | `manager` | `manager123` |
| **Employee** | `employee@employeehub.com` | `employee` | `employee123` |

---

### 🌐 Important URLs

| URL | Purpose |
| :--- | :--- |
| `http://localhost:4200` | ✅ **Main Application (Angular frontend)** |
| `http://localhost:8000/api/` | REST API root |
| `http://localhost:8000/api/schema/swagger-ui/` | Interactive API docs (Swagger UI) |
| `http://localhost:8000/admin/` | Django Admin panel |

> [!IMPORTANT]
> `http://localhost:8000/` alone will show a Django 404 debug page — this is **expected**. The backend has no root view; always open the app at `http://localhost:4200`.

---

### 1. Frontend Setup

```bash
cd frontend

# Install dependencies (Angular 21, Tailwind)
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

#### TypeScript Compilation Check
```bash
./node_modules/.bin/tsc --noEmit
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate Python 3.12 virtual environment
python3.12 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install all dependencies
pip install -r requirements.txt

# Apply database migrations (creates db.sqlite3 automatically)
python manage.py migrate

# Seed demo data (employees, payroll, leave, notifications)
python manage.py seed_data

# Start the Django development server
python manage.py runserver
```

Backend API will be live at [http://localhost:8000/api/](http://localhost:8000/api/).

---

## 💰 How to Run Payroll

Payroll is **HR-triggered** — not automatic. Here is the monthly workflow:

### Step 1 — Configure Salary Structures (one-time per employee)
Via Django Admin → **Payroll → Salary Structures → Add**:
- **Earnings:** Basic Salary, Housing, Transport, Medical, Other Allowances
- **Deductions:** Tax, Provident Fund, Other Deductions
- Backend computes: `Gross = Basic + All Allowances` and `Net = Gross − All Deductions`

### Step 2 — Create a Payroll Period
Django Admin → **Payroll → Payroll Periods → Add**
- Set `month`, `year`, `start_date`, `end_date`

### Step 3 — Trigger Payroll Run (HR only)
```bash
POST http://localhost:8000/api/payroll/periods/{period_id}/process-payroll/
Authorization: Bearer <hr_jwt_token>
```

What this does automatically:
1. ✅ Finds all active employees
2. ✅ Reads each employee's `SalaryStructure`
3. ✅ Creates a `Payslip` for each employee with computed amounts
4. ✅ Sends each employee an **in-app notification** with their net salary
5. ✅ Marks the period as `is_processed = True`

### Step 4 — Employees View & Download
Employees visit `/payroll` in the app to view payslips and download an official **PDF** (generated server-side via ReportLab).

### Formula
```
Gross Salary  = Basic + Housing + Transport + Medical + Other Allowances
Net Salary    = Gross Salary − (Tax + Provident Fund + Other Deductions)
```

---

## 🧪 Testing & Verification

Every module undergoes rigorous testing before marking tasks as complete:
- **Unit Testing**: Tests components and services in isolation via Vitest.
- **Edge Case Validation**: Handles `null`, empty arrays, and search misses gracefully.
- **Failure States**: Every screen implements an `ErrorStateComponent` with an actionable retry button.
- **Zero CSS Violation**: Strictly enforces Tailwind CSS utility classes — no custom `.css` files.

---

## 🔐 Security & Roles

EmployeeHub features Role-Based Access Control (RBAC):
- **Super Admin**: Full administrative control across organization, payroll, and users.
- **HR Manager**: Manages workforce profiles, compensation, organization structures, reports, and payroll runs.
- **Manager**: Team-level visibility, timesheet review, and leave approvals.
- **Employee**: Self-service portal (check-in/out, leave applications, timesheet entry, payslip download).

> [!CAUTION]
> Never commit secrets or API keys to version control. Maintain confidential keys (`SECRET_KEY`, `DB_PASSWORD`, `JWT_SECRET`) strictly inside `.env` files.

---

## 📄 License

This project is licensed under the MIT License. Developed as a production-grade enterprise HRMS.
