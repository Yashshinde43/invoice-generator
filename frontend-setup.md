# Invoice Builder - Frontend Setup Guide

This guide will help you set up and run the Next.js 14+ frontend application for the Invoice Builder & Inventory Management System.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn** / **pnpm**
- **Git** (optional, for version control)
- **Supabase Account** (free tier works) - [Sign up](https://supabase.com/)
- **Code Editor** - VS Code recommended

---

## Quick Start

### 1. Navigate to Frontend Directory

```bash
cd "E:\Invoice Builder\frontend"
```

### 2. Install Dependencies

```bash
npm install
```

Or if using yarn:
```bash
yarn install
```

This will install all required packages including:
- Next.js 15+ with App Router
- React 19
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui components
- React Hook Form + Zod
- Zustand
- jsPDF
- Recharts
- Lucide React icons

### 3. Set Up Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Server-side only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Getting Your Supabase Credentials**:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will be available at: **http://localhost:3000**

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   └── layout.tsx            # Auth layout wrapper
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── products/
│   │   │   └── page.tsx          # Products list
│   │   ├── purchases/
│   │   │   └── page.tsx          # Purchases list
│   │   ├── invoices/
│   │   │   └── page.tsx          # Invoices list
│   │   ├── customers/
│   │   │   └── page.tsx          # Customers list
│   │   ├── reports/
│   │   │   └── page.tsx          # Reports & analytics
│   │   ├── settings/
│   │   │   └── page.tsx          # Settings
│   │   └── layout.tsx            # Dashboard layout with sidebar
│   ├── globals.css               # Global styles & Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx            # Button component
│   │   ├── input.tsx             # Input component
│   │   ├── label.tsx             # Label component
│   │   ├── card.tsx              # Card container
│   │   ├── table.tsx             # Data table
│   │   ├── dialog.tsx            # Modal dialog
│   │   ├── dropdown-menu.tsx     # Dropdown menu
│   │   ├── select.tsx            # Select dropdown
│   │   ├── textarea.tsx          # Textarea input
│   │   ├── toast.tsx             # Toast notifications
│   │   ├── use-toast.ts          # Toast hook
│   │   ├── toaster.tsx           # Toast container
│   │   ├── badge.tsx             # Status badges
│   │   ├── tabs.tsx              # Tab navigation
│   │   ├── separator.tsx         # Visual separator
│   │   ├── form.tsx              # React Hook Form integration
│   │   └── avatar.tsx            # User avatar
│   └── layout/                   # Layout components
│       ├── sidebar.tsx           # App sidebar navigation
│       └── header.tsx            # App header
│
├── lib/
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod validation schemas
│
├── types/
│   └── index.ts                  # TypeScript type definitions
│
├── public/                       # Static assets
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config
├── components.json               # shadcn/ui config
└── .gitignore                    # Git ignore rules
```

---

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Welcome page with login/signup buttons |
| `/login` | Login | User authentication |
| `/signup` | Signup | New user registration |
| `/dashboard` | Dashboard | Main dashboard with stats and quick actions |
| `/dashboard/products` | Products | Product inventory management |
| `/dashboard/purchases` | Purchases | Purchase order management |
| `/dashboard/invoices` | Invoices | Invoice management |
| `/dashboard/customers` | Customers | Customer database |
| `/dashboard/reports` | Reports | Analytics and reporting |
| `/dashboard/settings` | Settings | Business and app settings |

---

## Component Usage Guide

### shadcn/ui Components

All shadcn/ui components are located in `components/ui/` and can be imported like this:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
```

#### Button Variants

```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="success">Success</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

#### Badge Variants

```tsx
<Badge>Default</Badge>
<Badge variant="success">Paid</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="outline">Draft</Badge>
```

#### Form Components

```tsx
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input placeholder="you@example.com" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Layout Components

#### Sidebar

The sidebar is automatically included in the dashboard layout. It provides:
- Navigation links with active state highlighting
- Collapsible on mobile with hamburger menu
- Logo and branding
- Footer with app version

#### Header

The header includes:
- Business selector dropdown (for multi-business)
- Search bar
- Notifications bell with badge count
- User profile dropdown with avatar

---

## Utility Functions

Located in `lib/utils.ts`:

```tsx
import { cn, formatCurrency, formatDate, calculateProfitMargin } from "@/lib/utils";

// Merge className with Tailwind
const className = cn("base-class", conditional && "conditional-class");

// Format currency
const price = formatCurrency(1234.56, "₹"); // "₹1234.56"

// Format date
const date = formatDate(new Date()); // "23-Dec-2025"

// Calculate profit margin
const margin = calculateProfitMargin(100, 75); // 33.33
```

---

## Validation Schemas

Located in `lib/validations.ts`:

```tsx
import { loginSchema, productSchema, invoiceSchema } from "@/lib/validations";

// Use with React Hook Form
const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

---

## TypeScript Types

All types are defined in `types/index.ts`:

```tsx
import type { User, Product, Invoice, Customer } from "@/types";

function processProduct(product: Product) {
  console.log(product.name, product.sellingPrice);
}
```

---

## Styling & Design System

### Color Palette

The application uses a custom color scheme defined in `tailwind.config.ts`:

- **Primary** (Indigo/Blue): Primary actions, links
- **Success** (Green): Completed, paid, profit
- **Warning** (Yellow/Orange): Low stock, pending
- **Danger** (Red): Overdue, delete, loss

### Usage

```tsx
<div className="bg-primary-600 text-primary-50">
  <button className="bg-success-500 hover:bg-success-600">
    Success Button
  </button>
</div>
```

### Responsive Design

The app is mobile-first with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## State Management

The app uses **Zustand** for client-side state management. Stores will be added by the Integration Agent.

---

## Future Integrations (To be done by Integration Agent)

### Supabase Client

Will be configured in `lib/supabase/client.ts` and `lib/supabase/server.ts`.

### Authentication

Login/signup forms will connect to Supabase Auth.

### Server Actions

CRUD operations will use Next.js Server Actions with Supabase.

### Real-time Updates

Supabase Realtime subscriptions will be added for live data.

---

## Building for Production

```bash
# Create optimized production build
npm run build

# Test production build locally
npm run start
```

The production build will:
- Optimize all assets
- Minify JavaScript and CSS
- Generate static pages where possible
- Create server-side bundles

---

## Deployment

The frontend can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

## Troubleshooting

### Port Already in Use

If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

### Module Not Found

Clear cache and reinstall:
```bash
rm -rf .next node_modules
npm install
```

### TypeScript Errors

Check `tsconfig.json` paths are correct.

### Tailwind Not Working

Ensure `tailwind.config.ts` content paths include all files.

---

## Development Tips

1. **Use TypeScript Strict Mode** - Already enabled
2. **Component Organization** - Keep components small and focused
3. **Use Shadcn Components** - Don't reinvent the wheel
4. **Follow the Folder Structure** - Maintain consistency
5. **Test Responsiveness** - Use browser dev tools device emulation

---

## Next Steps

After the frontend is set up:

1. **Backend Setup** - Follow `supabase-setup.md` to configure Supabase
2. **Integration** - The Integration Agent will connect frontend to backend
3. **Testing** - The Testing Agent will verify all functionality

---

## Support

For issues or questions:
- Check `progress.md` for current status
- See `known-issues.md` for known bugs
- Refer to `idea.md` for full project specification

---

## File Locations

- **Frontend Code**: `E:\Invoice Builder\frontend\`
- **Setup Guide**: `E:\Invoice Builder\frontend-setup.md`
- **Progress Tracker**: `E:\Invoice Builder\progress.md`
- **Project Specification**: `E:\Invoice Builder\idea.md`
- **Database Schema**: `E:\Invoice Builder\schema.sql`
