# Invoice Builder & Inventory Management System - Detailed Specification

## Project Overview
A complete digital solution for business owners and shop owners to manage their invoices, track inventory, monitor sales/purchases, and analyze profits - replacing manual pen-and-paper record keeping.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or similar component library
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation
- **SEO**: Next.js built-in SEO, meta tags, sitemap, robots.txt
- **PDF Generation**: jsPDF or react-pdf for invoice PDF export

### Backend
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for logos, receipts, etc.)
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js API Routes / Server Actions

---

## Core Features

### 1. Authentication & User Management
- User registration and login
- Multi-business support per user
- Role-based access (Owner, Employee, Viewer)
- Business profile settings (name, address, logo, GST/Tax ID)

### 2. Dashboard (Home Page)
- Key metrics overview:
  - Today's sales total
  - Today's profit
  - Low stock alerts
  - Recent invoices (last 5)
- Charts/Graphs:
  - Sales trend (weekly/monthly)
  - Profit trend
  - Top selling products
- Quick actions: Create Invoice, Add Product, Add Purchase

### 3. Product/Inventory Management

#### Product Fields:
- Product ID (auto-generated)
- Product Name
- Category
- SKU/Barcode (optional)
- Purchase Price (cost price per unit)
- Selling Price (per unit)
- Profit Margin (auto-calculated %)
- Current Stock Quantity
- Low Stock Threshold (alert level)
- Supplier/Vendor Name
- Description/Notes
- Product Image (optional)

#### Product Actions:
- Add new product
- Edit product
- Delete product (with confirmation)
- Bulk import via CSV/Excel
- Stock adjustment (add/remove)
- Product search & filter

#### Inventory Tracking:
- Real-time stock updates on sales
- Stock history log (all stock changes with timestamps)
- Low stock notifications
- Expiry tracking (if applicable)
- Multiple units of measure support

### 4. Purchase Management (Buying from Wholesalers)

#### Purchase Fields:
- Purchase ID (auto-generated unique)
- Supplier/Vendor Name
- Supplier Contact Info
- Invoice/Bill Number (from supplier)
- Purchase Date
- Products List:
  - Product Name
  - Quantity Purchased
  - Cost Per Unit
  - Total Cost
- Subtotal, Tax, Shipping, Grand Total
- Payment Status (Paid/Unpaid/Partial)
- Payment Method
- Notes
- Attach bills/receipts (images/PDFs)

#### Purchase Actions:
- Create new purchase entry
- View all purchases (list view with filters)
- Update stock automatically on purchase
- Track purchases by supplier
- Export purchase report

### 5. Invoice/Sales Management

#### Invoice Fields:
- Invoice Number (auto-generated sequential)
- Customer Name & Contact
- Customer Address
- Invoice Date
- Due Date (optional)
- Products/Items List:
  - Product Name (auto-select from inventory)
  - Quantity
  - Price Per Unit (selling price)
  - Discount (optional, % or fixed)
  - Line Total
- Subtotal
- Tax/Tax Rate (configurable per business)
- Additional Charges/Shipping
- Discount (invoice level)
- Grand Total
- Payment Status
- Payment Method
- Notes/Terms & Conditions
- Business Logo (from business profile)

#### Invoice Actions:
- Create new invoice
- Edit draft invoices
- Delete invoices
- Mark as sent/paid
- Duplicate invoice
- Convert invoice to PDF
- Send invoice via email (integration)
- Print invoice
- Invoice templates (choose from designs)
- Recurring invoices (optional)

#### Invoice Views:
- All invoices list with filters:
  - Date range
  - Customer name
  - Status (Draft, Sent, Paid, Overdue)
  - Amount range
- Invoice detail view
- Search invoices by number/customer

### 6. Customer Management
- Customer database:
  - Name
  - Contact Number
  - Email
  - Address
  - GST/Tax Number
  - Notes
- Customer purchase history
- Outstanding payments tracking
- Customer-wise sales report

### 7. Reporting & Analytics

#### Reports Available:
- **Sales Report**:
  - Daily, Weekly, Monthly, Custom range
  - Total sales, Average order value
  - Sales by product
  - Sales by customer
- **Purchase Report**:
  - Total purchases by period
  - Purchases by supplier
  - Cost analysis
- **Profit/Loss Report**:
  - Gross profit (Sales - Cost of Goods Sold)
  - Net profit (after expenses)
  - Profit margin by product
  - Profit trend over time
- **Inventory Report**:
  - Current stock valuation
  - Low stock items
  - Fast-moving items
  - Slow-moving/dead stock
- **Tax Report**:
  - Tax collected (on sales)
  - Tax paid (on purchases)
  - Net tax liability

#### Report Features:
- Export to PDF, Excel, CSV
- Print reports
- Filter by date range, category, product
- Visual charts and graphs

### 8. Settings & Configuration

#### Business Settings:
- Business Name, Logo
- Business Address
- Contact Information
- GST/Tax ID
- Currency Symbol
- Tax Rate (default)

#### Invoice Settings:
- Invoice Prefix (e.g., INV-, #)
- Starting Invoice Number
- Invoice Terms & Conditions (default)
- Payment Details (bank info, UPI, etc.)
- Signature/Stamp upload

#### System Settings:
- Currency format
- Date format
- Timezone
- Low stock threshold (global)
- Backup data
- Export all data

---

## Database Schema (Supabase Tables)

### Tables to Create:

1. **profiles** (user profiles from Supabase Auth)
2. **businesses** (user can have multiple businesses)
3. **products** (inventory items)
4. **categories** (product categories)
5. **suppliers** (vendor/supplier information)
6. **purchases** (purchase entries)
7. **purchase_items** (purchase line items)
8. **customers** (customer database)
9. **invoices** (sales invoices)
10. **invoice_items** (invoice line items)
11. **stock_history** (inventory transaction log)
12. **payments** (payment records)
13. **expenses** (business expenses - optional)

---

## User Flow Examples

### Flow 1: Purchasing Stock
1. User goes to "Purchases" → "New Purchase"
2. Selects/Adds supplier
3. Adds products with quantities and cost
4. Saves purchase
5. System automatically:
   - Creates purchase record
   - Updates product stock
   - Updates average cost price
   - Logs in stock history

### Flow 2: Creating Invoice
1. User goes to "Invoices" → "New Invoice"
2. Selects existing customer or adds new
3. Adds products (auto-selects from inventory)
4. System auto-calculates totals
5. User reviews and saves as draft/sends
6. On final save, system:
   - Decreases stock
   - Creates invoice record
   - Updates sales data
   - Logs transaction

### Flow 3: Checking Profit
1. User goes to Dashboard
2. Views today's profit
3. Or goes to Reports → Profit/Loss
4. Selects date range
5. Views detailed profit breakdown

---

## UI/UX Guidelines

### Design Principles:
- Clean, minimalist interface
- Mobile-responsive (important for shop owners)
- High contrast for readability
- Large touch targets for mobile
- Fast page loads
- Clear call-to-action buttons

### Color Scheme:
- Primary: Blue/Indigo (professional, trustworthy)
- Success: Green (for completed, paid, profit)
- Warning: Yellow/Orange (low stock, pending)
- Danger: Red (overdue, delete, loss)
- Neutral: Gray scales

### Key Pages Structure:
1. **Sidebar Navigation** (collapsible on mobile)
   - Dashboard
   - Products
   - Purchases
   - Invoices
   - Customers
   - Reports
   - Settings

2. **Top Bar**
   - Business selector (if multiple)
   - Search
   - Notifications
   - User profile

---

## Additional Features to Consider (Future/Optional)

- Multi-currency support
- Multi-language support
- Barcode scanner integration
- POS (Point of Sale) mode for counter sales
- SMS/WhatsApp notifications for invoices
- Integration with payment gateways
- Mobile app (React Native)
- Offline mode support
- Recurring expenses tracking
- Employee management & payroll
- Accounting integration (Tally, QuickBooks)

---

## MVP (Minimum Viable Product) Feature Priority

### Phase 1 (Core MVP):
1. Authentication
2. Business profile setup
3. Product management (add, edit, list)
4. Purchase entry with stock update
5. Invoice creation with PDF
6. Basic dashboard

### Phase 2:
1. Customer management
2. Reports (Sales, Purchase, Profit)
3. Stock history
4. Low stock alerts

### Phase 3:
1. Advanced reporting
2. Multi-business support
3. Data export/import
4. Payment tracking

---

## AI Agent Team Structure

This project will be built using multiple specialized AI agents working together. Each agent has a specific role and responsibilities.

### Agent 1: Frontend Developer Agent
**Role**: Build the complete Next.js frontend application

**Responsibilities**:
- Set up Next.js 14+ project with App Router
- Configure Tailwind CSS and shadcn/ui components
- Build all UI pages (Dashboard, Products, Purchases, Invoices, Customers, Reports, Settings)
- Implement responsive design for mobile and desktop
- Create reusable UI components
- Implement client-side state management (Zustand/Context)
- Form handling with React Hook Form + Zod validation
- Implement PDF generation for invoices using jsPDF/react-pdf
- SEO optimization (meta tags, sitemap, robots.txt)
- Loading states, error handling, and toast notifications

**Deliverables**:
- Complete working frontend with all pages
- Responsive design that works on mobile
- All forms with validation
- PDF export functionality
- Charts and graphs for dashboard

---

### Agent 2: Backend Developer Agent
**Role**: Set up Supabase backend, database, and API

**Responsibilities**:
- Set up Supabase project and configure environment
- Design and create all database tables with proper relationships:
  - profiles, businesses, products, categories, suppliers
  - purchases, purchase_items, customers, invoices, invoice_items
  - stock_history, payments, expenses
- Implement Row Level Security (RLS) policies for all tables
- Set up Supabase Authentication (email/password, social login)
- Create database functions and triggers:
  - Auto-update stock on invoice creation
  - Auto-update stock on purchase entry
  - Auto-generate invoice numbers
  - Calculate and store profit margins
- Set up Supabase Storage for images (logos, product images, receipts)
- Create database views for complex queries (reports, analytics)
- Implement real-time subscriptions for live updates
- Create Supabase MCP connection settings

**Deliverables**:
- Complete Supabase database schema
- All tables with proper relationships and constraints
- RLS policies for security
- Database functions and triggers
- Storage buckets configured
- API documentation
- Environment variables setup guide

---

### Agent 3: Integration Agent
**Role**: Connect frontend with backend and implement business logic

**Responsibilities**:
- Connect Next.js frontend with Supabase client
- Implement authentication flow (signup, login, logout, session management)
- Create Server Actions for all CRUD operations:
  - Products (create, read, update, delete, search, filter)
  - Purchases (create, read, update, delete, list)
  - Invoices (create, read, update, delete, mark paid, generate PDF)
  - Customers (create, read, update, delete)
  - Suppliers (create, read, update, delete)
  - Reports (generate sales, purchase, profit, inventory reports)
- Implement real-time updates using Supabase Realtime
- Handle file uploads to Supabase Storage
- Implement search and filtering functionality
- Create data export functions (CSV, Excel, PDF)
- Handle pagination for large datasets
- Implement optimistic UI updates

**Deliverables**:
- Working frontend-backend integration
- All CRUD operations functional
- Real-time updates working
- File uploads working
- Search and filter functionality
- Data export functionality

---

### Agent 4: Testing Agent
**Role**: Test the application and ensure quality

**Responsibilities**:
- Set up testing framework (Jest, React Testing Library, Playwright)
- Write unit tests for:
  - All utility functions
  - Form validations
  - Business logic calculations (profit, tax, totals)
- Write integration tests for:
  - Authentication flow
  - CRUD operations
  - Invoice creation and PDF generation
- Write E2E (end-to-end) tests for:
  - User signup and login
  - Complete purchase flow
  - Complete invoice creation flow
  - Stock updates after transactions
  - Report generation
- Test responsive design on different screen sizes
- Cross-browser testing
- Performance testing
- Accessibility testing
- Create test data fixtures
- Document test coverage

**Deliverables**:
- Test suite with unit, integration, and E2E tests
- Test coverage report (aim for 80%+ coverage)
- Bug report with any issues found
- Performance benchmarks
- Browser compatibility report

---

### Agent 5: Error Solving Agent
**Role**: Debug and fix issues that arise during development

**Responsibilities**:
- Monitor for errors during development
- Debug and fix:
  - TypeScript/type errors
  - Runtime errors
  - Build errors
  - Supabase query errors
  - Authentication issues
  - State management bugs
  - UI bugs and inconsistencies
- Handle edge cases:
  - Network failures
  - Empty states
  - Concurrent modifications
  - Large dataset performance
- Fix accessibility issues
- Resolve merge conflicts
- Optimize database queries
- Fix memory leaks and performance issues
- Handle browser compatibility issues

**Deliverables**:
- Fixed bugs and issues
- Error handling improvements
- Performance optimizations
- Edge case handling
- Browser compatibility fixes

---

### Agent 6: Project Manager Agent
**Role**: Track progress, coordinate agents, and maintain project status

**Responsibilities**:
- Create and maintain project timeline
- Track completion of each agent's tasks
- Maintain a task checklist (TODO list) for the entire project
- Create progress reports:
  - What has been completed
  - What is currently in progress
  - What is pending/blocking
- Coordinate between agents:
  - Ensure frontend agent waits for backend schema
  - Ensure integration agent starts after frontend and backend are ready
  - Ensure testing agent has working features to test
- Maintain documentation:
  - Setup instructions
  - API documentation
  - Deployment guide
  - Known issues and workarounds
- Create milestone checkpoints:
  - Phase 1 MVP completion
  - Phase 2 features completion
  - Phase 3 features completion
- Generate daily/weekly progress summaries
- Update feature prioritization based on progress

**Deliverables**:
- Project timeline with milestones
- Live task checklist with status
- Progress dashboard showing:
  - Completed features
  - In-progress features
  - Pending features
  - Blocked items
- Documentation website or README
- Setup and deployment guides
- Daily/weekly progress reports
- Final project completion report

---

## Agent Coordination Workflow

### Step 1: Backend Agent Starts First
1. Backend Agent sets up Supabase project
2. Creates database schema
3. Provides schema details to other agents
4. Marks database setup as complete

### Step 2: Frontend Agent Starts (in parallel with Backend)
1. Frontend Agent sets up Next.js project
2. Builds UI components and pages
3. Creates forms and layouts
4. Marks frontend setup as complete

### Step 3: Integration Agent Starts
1. Receives database schema from Backend Agent
2. Receives frontend structure from Frontend Agent
3. Connects frontend to Supabase
4. Implements all CRUD operations
5. Marks integration as complete

### Step 4: Testing Agent Starts
1. Receives working application from Integration Agent
2. Writes and runs tests
3. Reports bugs to Error Solving Agent
4. Marks testing phases as complete

### Step 5: Error Solving Agent (runs throughout)
1. Monitors all agents for errors
2. Fixes issues as they arise
3. Reports fixes to Project Manager Agent

### Step 6: Project Manager Agent (runs throughout)
1. Tracks all agent progress
2. Updates task checklist
3. Coordinates dependencies between agents
4. Generates progress reports
5. Manages final deployment

---

## Task Checklist Structure (Maintained by Project Manager Agent)

### Phase 1: Core MVP
- [ ] Backend: Set up Supabase project
- [ ] Backend: Create database tables
- [ ] Backend: Set up authentication
- [ ] Backend: Create RLS policies
- [ ] Frontend: Initialize Next.js project
- [ ] Frontend: Create authentication pages (login, signup)
- [ ] Frontend: Create business setup page
- [ ] Frontend: Create product management pages
- [ ] Frontend: Create purchase entry pages
- [ ] Frontend: Create invoice creation pages
- [ ] Frontend: Create dashboard with basic metrics
- [ ] Integration: Connect auth to Supabase
- [ ] Integration: Implement product CRUD
- [ ] Integration: Implement purchase CRUD with stock update
- [ ] Integration: Implement invoice CRUD with stock update
- [ ] Testing: Test authentication flow
- [ ] Testing: Test product management
- [ ] Testing: Test purchase flow
- [ ] Testing: Test invoice flow
- [ ] Testing: Test dashboard metrics

### Phase 2: Additional Features
- [ ] Frontend: Create customer management pages
- [ ] Frontend: Create reports pages
- [ ] Frontend: Create stock history view
- [ ] Frontend: Implement low stock notifications
- [ ] Integration: Implement customer CRUD
- [ ] Integration: Implement report generation
- [ ] Integration: Implement stock history logging
- [ ] Integration: Implement notifications
- [ ] Testing: Test customer features
- [ ] Testing: Test reports accuracy
- [ ] Testing: Test stock tracking

### Phase 3: Advanced Features
- [ ] Frontend: Advanced filtering and search
- [ ] Frontend: Multi-business switching
- [ ] Frontend: Data export/import UI
- [ ] Backend: Multi-business data isolation
- [ ] Backend: Backup and restore functions
- [ ] Integration: Implement data export (CSV, PDF, Excel)
- [ ] Integration: Implement data import
- [ ] Testing: Test multi-business features
- [ ] Testing: Test data export/import
- [ ] Testing: Performance testing

### Final Steps
- [ ] Error Solving: Fix all known bugs
- [ ] Error Solving: Optimize performance
- [ ] Testing: Complete full E2E test suite
- [ ] Project Manager: Final documentation
- [ ] Project Manager: Deployment guide
- [ ] Project Manager: Project completion report