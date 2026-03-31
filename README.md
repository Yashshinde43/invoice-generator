# Invoice Builder & Inventory Management System

A complete digital solution for business owners and shop owners to manage invoices, track inventory, monitor sales/purchases, and analyze profits.

---

## Status

**Current Status: Functional - Authentication Fixed**

Authentication is working. The application is ready for use and further development.

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

### Setup Instructions

1. **Navigate to the project**
   ```bash
   cd "E:\Invoice Builder"
   ```

2. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up Environment Variables**

   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

---

## Project Structure

```
invoice-builder/
├── frontend/                    # Next.js application
│   ├── app/                    # App Router pages & actions
│   │   ├── (auth)/            # Authentication pages (login, signup)
│   │   ├── (dashboard)/       # Dashboard and main app pages
│   │   └── actions/           # Server-side action handlers
│   ├── components/            # Reusable UI components (shadcn/ui)
│   ├── lib/                   # Utilities and configuration
│   └── types/                 # TypeScript type definitions
├── schema.sql                 # Complete database schema
├── README.md                  # This file
├── idea.md                    # Detailed project specification
├── supabase-setup.md          # Supabase setup guide
└── frontend-setup.md          # Frontend setup guide
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | Zustand |
| Forms | React Hook Form + Zod |
| PDF | jsPDF |

---

## Features

### Implemented
- User Authentication (login/signup)
- Multi-business support
- Product & Inventory Management
- Customer Management
- Invoice Management
- Purchase Management
- Dashboard with metrics
- Basic reporting views

### Partially Implemented
- PDF generation (jsPDF added, needs integration)
- Real-time updates (infrastructure ready)

### Not Yet Implemented
- Advanced analytics and charts
- Data import/export
- POS mode interface
- Payment gateway integration
- Multi-currency support

---

## Database Schema

The application uses 13 main tables:

| Table | Purpose |
|-------|---------|
| profiles | User profiles extending auth |
| businesses | Multi-business support |
| categories | Product categorization |
| suppliers | Vendor management |
| products | Inventory items |
| customers | Customer database |
| purchases | Purchase orders |
| purchase_items | Purchase line items |
| invoices | Sales invoices |
| invoice_items | Invoice line items |
| stock_history | Audit log for inventory |
| payments | Payment records |
| expenses | Business expenses |

---

## Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Development

### Available Scripts

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

### Key Pages

| Route | Page |
|-------|------|
| `/login` | Login |
| `/signup` | Signup |
| `/dashboard` | Dashboard |
| `/dashboard/products` | Products |
| `/dashboard/purchases` | Purchases |
| `/dashboard/invoices` | Invoices |
| `/dashboard/customers` | Customers |
| `/dashboard/reports` | Reports |
| `/dashboard/settings` | Settings |

---

## Documentation

- **Full Specification**: See `idea.md`
- **Supabase Setup**: See `supabase-setup.md`
- **Frontend Setup**: See `frontend-setup.md`

---

## Recent Fixes (Dec 2025)

### Authentication Issue - RESOLVED

Fixed database schema corruption in Supabase auth tables:
- NULL values in `auth.users.confirmation_token`
- NULL values in `auth.identities.created_at` and `updated_at`

The authentication system is now fully functional.

---

## License

MIT
