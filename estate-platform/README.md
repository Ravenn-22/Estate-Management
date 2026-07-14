# Estate Management Platform

A full-stack property management system for landlords/estate managers and tenants — handling rent collection, maintenance requests, document storage, and announcements in one platform.

Built as a real-world solution to a common problem: most Nigerian estates and rental properties still track rent, maintenance, and visitor logs manually.

## Live Demo
- API: _(add Render URL once deployed)_
- Frontend: _(add Vercel URL once deployed)_

## Tech Stack

**Backend**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT authentication with role-based access control
- Cloudinary (file uploads — maintenance photos, documents)
- Hosted on Render, DB on Neon

**Frontend** _(in progress)_
- React
- _(details to be added)_

## User Roles

| Role | Capabilities |
|---|---|
| **Manager** | Manage units, assign tenants via leases, generate invoices, record payments, review/update maintenance requests, upload documents, post announcements |
| **Tenant** | View lease & rent status, view invoices, submit maintenance requests with photos, view documents, view announcements |

## Core Features

- **Property Management** — units with status tracking (vacant/occupied/reserved/under maintenance)
- **Lease Management** — assign tenants to units, auto-updates unit status
- **Rent Management** — invoice generation, partial payment support, auto status updates (pending → partial → paid)
- **Maintenance Requests** — tenant submissions with photo uploads (Cloudinary), full status lifecycle
- **Document Center** — lease agreements, receipts, notices, stored per-tenant or per-unit
- **Announcements** — estate-wide notices from managers to all tenants

## API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |

### Units
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/units` | Manager |
| GET | `/api/units` | Authenticated |
| GET | `/api/units/:id` | Authenticated |
| PATCH | `/api/units/:id/status` | Manager |

### Leases
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/leases` | Manager |
| GET | `/api/leases` | Manager |
| GET | `/api/leases/my-lease` | Tenant |
| PATCH | `/api/leases/:id/end` | Manager |

### Invoices & Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/invoices` | Manager |
| GET | `/api/invoices` | Manager |
| GET | `/api/invoices/my-invoices` | Tenant |
| POST | `/api/payments` | Manager |
| GET | `/api/payments/invoice/:invoiceId` | Authenticated |

### Maintenance
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/maintenance` | Tenant |
| GET | `/api/maintenance` | Manager |
| GET | `/api/maintenance/my-requests` | Tenant |
| PATCH | `/api/maintenance/:id/status` | Manager |

### Documents
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/documents` | Manager |
| GET | `/api/documents` | Manager |
| GET | `/api/documents/my-documents` | Tenant |

### Announcements
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/announcements` | Manager |
| GET | `/api/announcements` | Authenticated |

## Data Model
User ──< Lease >── Unit
│
└──< Invoice ──< Payment
User ──< MaintenanceRequest >── Unit
User ──< Document >── Unit
Announcement (estate-wide)
## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (e.g. [Neon](https://neon.tech))
- Cloudinary account (free tier)

### Setup

```bash
git clone https://github.com/Ravenn-22/estate-management.git
cd estate-management/server
npm install
```

Create a `.env` file in `server/`:
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000

Run migrations and start the server:

```bash
npx prisma migrate dev
npm run dev
```

## Roadmap

- [x] Auth + role-based access control
- [x] Property/unit management
- [x] Lease management
- [x] Rent invoicing + payment tracking
- [x] Maintenance request system with photo upload
- [x] Document center
- [x] Announcements
- [ ] Frontend (React)
- [ ] Paystack payment integration
- [ ] Visitor management with QR check-in/out
- [ ] Multi-estate support (Super Admin role)
- [ ] Automated rent reminders (cron)

## Author

**Shonaike Temitayo (Raven)**
[GitHub](https://github.com/Ravenn-22) · [LinkedIn](https://linkedin.com/in/shonaiketemitayo) · [Twitter](https://twitter.com/Raheemii_)