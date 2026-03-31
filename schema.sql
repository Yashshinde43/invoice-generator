-- ============================================================================
-- Invoice Builder & Inventory Management System
-- Complete Database Schema for Supabase (PostgreSQL)
-- ============================================================================
-- This schema creates all necessary tables, relationships, indexes,
-- Row Level Security policies, functions, and triggers for the application.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enable necessary extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------

-- Payment status enum
CREATE TYPE payment_status_enum AS ENUM ('pending', 'partial', 'paid', 'overdue');

-- Payment method enum
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'upi', 'cheque', 'other');

-- Invoice status enum
CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Stock transaction type enum
CREATE TYPE stock_transaction_type_enum AS ENUM ('purchase', 'sale', 'adjustment', 'return', 'damage');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES
-- Extends Supabase auth.users with additional user information
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'employee', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth';
COMMENT ON COLUMN profiles.role IS 'User role: owner, admin, employee, or viewer';

-- ----------------------------------------------------------------------------
-- 2. BUSINESSES
-- Each user can have multiple businesses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,

    -- Business contact information
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,

    phone TEXT,
    email TEXT,
    website TEXT,

    -- Tax information
    gst_number TEXT,
    tax_id TEXT,
    pan_number TEXT,

    -- Invoice settings
    invoice_prefix TEXT DEFAULT 'INV-',
    invoice_number_start INTEGER DEFAULT 1001,
    currency_symbol TEXT DEFAULT '₹',
    currency_code TEXT DEFAULT 'INR',
    tax_rate DECIMAL(5,2) DEFAULT 18.00, -- Default tax rate percentage

    -- Payment details
    payment_details TEXT, -- Bank info, UPI, etc.
    terms_conditions TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE businesses IS 'Business profiles for users';
COMMENT ON COLUMN businesses.gst_number IS 'Goods and Services Tax identification number';
COMMENT ON COLUMN businesses.invoice_prefix IS 'Prefix for auto-generated invoice numbers';

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES
-- Product categories for inventory organization
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    -- Category can have sub-categories
    level INTEGER DEFAULT 0, -- 0 for root, 1 for sub-category, etc.

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(business_id, name)
);

COMMENT ON TABLE categories IS 'Product categories for organizing inventory';

-- ----------------------------------------------------------------------------
-- 4. SUPPLIERS
-- Vendor/Supplier information for purchases
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    gst_number TEXT,
    tax_id TEXT,

    -- Payment terms
    payment_terms TEXT,
    credit_days INTEGER DEFAULT 0,

    notes TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(business_id, name)
);

COMMENT ON TABLE suppliers IS 'Vendor and supplier information for purchases';

-- ----------------------------------------------------------------------------
-- 5. PRODUCTS
-- Main inventory/product table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

    -- Product identification
    name TEXT NOT NULL,
    sku TEXT, -- Stock Keeping Unit / Barcode
    barcode TEXT,

    -- Pricing
    purchase_price DECIMAL(12,2) NOT NULL CHECK (purchase_price >= 0),
    selling_price DECIMAL(12,2) NOT NULL CHECK (selling_price >= 0),
    profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN purchase_price > 0
            THEN ROUND(((selling_price - purchase_price) / purchase_price * 100), 2)
            ELSE 0
        END
    ) STORED,

    -- Stock information
    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
    low_stock_threshold INTEGER DEFAULT 10 CHECK (low_stock_threshold >= 0),
    reorder_quantity INTEGER DEFAULT 50,

    -- Product details
    unit TEXT DEFAULT 'pcs', -- pcs, kg, liters, etc.
    description TEXT,
    specifications TEXT, -- JSON or text for product specifications
    image_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_track_stock BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(business_id, name)
);

COMMENT ON TABLE products IS 'Product and inventory management';
COMMENT ON COLUMN products.profit_margin IS 'Auto-calculated profit margin percentage';

-- ----------------------------------------------------------------------------
-- 6. CUSTOMERS
-- Customer database for invoicing
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Customer information
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,

    -- Address
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',

    -- Tax information
    gst_number TEXT,
    tax_id TEXT,
    pan_number TEXT,

    -- Credit terms
    credit_limit DECIMAL(12,2) DEFAULT 0,
    credit_days INTEGER DEFAULT 0,

    -- Customer type
    customer_type TEXT DEFAULT 'regular' CHECK (customer_type IN ('regular', 'wholesale', 'retail', 'vip')),

    notes TEXT,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(business_id, phone)
);

COMMENT ON TABLE customers IS 'Customer database for sales and invoicing';

-- ----------------------------------------------------------------------------
-- 7. PURCHASES
-- Purchase orders from suppliers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,

    -- Purchase details
    purchase_number TEXT NOT NULL UNIQUE,
    supplier_invoice_number TEXT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    shipping_amount DECIMAL(12,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    other_charges DECIMAL(12,2) DEFAULT 0 CHECK (other_charges >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),

    -- Payment
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method payment_method_enum,
    paid_amount DECIMAL(12,2) DEFAULT 0 CHECK (paid_amount >= 0),

    -- Status
    status TEXT DEFAULT 'received' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),

    notes TEXT,
    attachment_url TEXT, -- Receipt/bill image or PDF

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE purchases IS 'Purchase orders from suppliers';

-- ----------------------------------------------------------------------------
-- 8. PURCHASE ITEMS
-- Line items for purchases
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Item details
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT DEFAULT 'pcs',
    cost_per_unit DECIMAL(12,2) NOT NULL CHECK (cost_per_unit >= 0),

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE purchase_items IS 'Line items for purchase orders';

-- ----------------------------------------------------------------------------
-- 9. INVOICES
-- Sales invoices for customers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

    -- Invoice details
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 18.00 CHECK (tax_rate >= 0),
    shipping_amount DECIMAL(12,2) DEFAULT 0 CHECK (shipping_amount >= 0),
    other_charges DECIMAL(12,2) DEFAULT 0 CHECK (other_charges >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    discount_type TEXT DEFAULT 'amount' CHECK (discount_type IN ('amount', 'percentage')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),

    -- Cost calculation for profit tracking
    cost_of_goods_sold DECIMAL(12,2) DEFAULT 0 CHECK (cost_of_goods_sold >= 0),
    profit_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - cost_of_goods_sold) STORED,

    -- Payment
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method payment_method_enum,
    paid_amount DECIMAL(12,2) DEFAULT 0 CHECK (paid_amount >= 0),

    -- Invoice status
    status invoice_status_enum DEFAULT 'draft',

    -- Customer details snapshot (in case customer is deleted)
    customer_name TEXT,
    customer_address TEXT,
    customer_phone TEXT,
    customer_gst TEXT,

    notes TEXT,
    terms_conditions TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE invoices IS 'Sales invoices for customers';
COMMENT ON COLUMN invoices.profit_amount IS 'Auto-calculated profit on this invoice';

-- ----------------------------------------------------------------------------
-- 10. INVOICE ITEMS
-- Line items for invoices
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Item details
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT DEFAULT 'pcs',
    price_per_unit DECIMAL(12,2) NOT NULL CHECK (price_per_unit >= 0),

    -- Cost tracking for profit calculation
    cost_per_unit DECIMAL(12,2) NOT NULL CHECK (cost_per_unit >= 0),

    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount DECIMAL(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE invoice_items IS 'Line items for sales invoices';

-- ----------------------------------------------------------------------------
-- 11. STOCK HISTORY
-- Inventory transaction log
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- Transaction details
    transaction_type stock_transaction_type_enum NOT NULL,
    quantity INTEGER NOT NULL, -- Positive for in, negative for out

    -- Stock before and after
    stock_before INTEGER NOT NULL,
    stock_after INTEGER NOT NULL,

    -- Reference to related documents
    reference_type TEXT, -- 'purchase', 'invoice', 'adjustment', etc.
    reference_id UUID, -- ID of the related document

    -- Additional details
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE stock_history IS 'Complete audit log of all inventory changes';

-- ----------------------------------------------------------------------------
-- 12. PAYMENTS
-- Payment records tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Payment details
    payment_type TEXT NOT NULL CHECK (payment_type IN ('invoice', 'purchase', 'expense')),
    reference_id UUID NOT NULL, -- Invoice ID, Purchase ID, or Expense ID

    -- Amount
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),

    -- Payment method
    payment_method payment_method_enum NOT NULL,

    -- Transaction details
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_id TEXT, -- Bank transaction ID, UPI ref, etc.
    notes TEXT,

    -- Attachment
    attachment_url TEXT, -- Receipt screenshot, etc.

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payments IS 'Payment records for invoices, purchases, and expenses';

-- ----------------------------------------------------------------------------
-- 13. EXPENSES
-- Business expenses tracking
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

    -- Expense details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- rent, utilities, salary, marketing, etc.

    -- Amount
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    tax_amount DECIMAL(12,2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),

    -- Date
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Payment
    payment_status payment_status_enum DEFAULT 'pending',
    payment_method payment_method_enum,

    -- Recurring
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT, -- monthly, quarterly, yearly

    notes TEXT,
    attachment_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Business expenses for profit/loss calculation';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_user_id ON profiles(id);

-- Businesses indexes
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);

-- Categories indexes
CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Suppliers indexes
CREATE INDEX idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- Products indexes
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_current_stock ON products(current_stock);
CREATE INDEX idx_products_low_stock ON products(business_id)
    WHERE current_stock <= low_stock_threshold;

-- Customers indexes
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Purchases indexes
CREATE INDEX idx_purchases_business_id ON purchases(business_id);
CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_purchase_number ON purchases(purchase_number);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX idx_purchases_status ON purchases(status);

-- Purchase items indexes
CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product_id ON purchase_items(product_id);

-- Invoices indexes
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Invoice items indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- Stock history indexes
CREATE INDEX idx_stock_history_business_id ON stock_history(business_id);
CREATE INDEX idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX idx_stock_history_transaction_type ON stock_history(transaction_type);
CREATE INDEX idx_stock_history_created_at ON stock_history(created_at);
CREATE INDEX idx_stock_history_reference ON stock_history(reference_type, reference_id);

-- Payments indexes
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_reference_id ON payments(reference_id);
CREATE INDEX idx_payments_transaction_date ON payments(transaction_date);

-- Expenses indexes
CREATE INDEX idx_expenses_business_id ON expenses(business_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_payment_status ON expenses(payment_status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES RLS
-- ----------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile (triggered by signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- BUSINESSES RLS
-- ----------------------------------------------------------------------------

-- Users can view their own businesses
CREATE POLICY "Users can view own businesses"
ON businesses FOR SELECT
USING (user_id = auth.uid());

-- Users can insert businesses for themselves
CREATE POLICY "Users can insert businesses"
ON businesses FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses"
ON businesses FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses"
ON businesses FOR DELETE
USING (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- CATEGORIES RLS
-- ----------------------------------------------------------------------------

-- Users can view categories for their businesses
CREATE POLICY "Users can view categories"
ON categories FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- Users can insert categories for their businesses
CREATE POLICY "Users can insert categories"
ON categories FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- Users can update categories for their businesses
CREATE POLICY "Users can update categories"
ON categories FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- Users can delete categories for their businesses
CREATE POLICY "Users can delete categories"
ON categories FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- SUPPLIERS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view suppliers"
ON suppliers FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert suppliers"
ON suppliers FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update suppliers"
ON suppliers FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete suppliers"
ON suppliers FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- PRODUCTS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view products"
ON products FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert products"
ON products FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update products"
ON products FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete products"
ON products FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- CUSTOMERS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view customers"
ON customers FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert customers"
ON customers FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update customers"
ON customers FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete customers"
ON customers FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- PURCHASES RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view purchases"
ON purchases FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert purchases"
ON purchases FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update purchases"
ON purchases FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete purchases"
ON purchases FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- PURCHASE ITEMS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view purchase_items"
ON purchase_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.id = purchase_items.purchase_id
        AND purchases.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can insert purchase_items"
ON purchase_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.id = purchase_items.purchase_id
        AND purchases.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update purchase_items"
ON purchase_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.id = purchase_items.purchase_id
        AND purchases.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete purchase_items"
ON purchase_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.id = purchase_items.purchase_id
        AND purchases.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

-- ----------------------------------------------------------------------------
-- INVOICES RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view invoices"
ON invoices FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert invoices"
ON invoices FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update invoices"
ON invoices FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete invoices"
ON invoices FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- INVOICE ITEMS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view invoice_items"
ON invoice_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can insert invoice_items"
ON invoice_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can update invoice_items"
ON invoice_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete invoice_items"
ON invoice_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.business_id IN (
            SELECT id FROM businesses WHERE user_id = auth.uid()
        )
    )
);

-- ----------------------------------------------------------------------------
-- STOCK HISTORY RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view stock_history"
ON stock_history FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert stock_history"
ON stock_history FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- PAYMENTS RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view payments"
ON payments FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert payments"
ON payments FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- EXPENSES RLS
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view expenses"
ON expenses FOR SELECT
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert expenses"
ON expenses FOR INSERT
WITH CHECK (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update expenses"
ON expenses FOR UPDATE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete expenses"
ON expenses FOR DELETE
USING (
    business_id IN (
        SELECT id FROM businesses WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- AUTO-UPDATE TIMESTAMP FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- GENERATE INVOICE NUMBER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_invoice_number(business_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get the invoice prefix and last number for this business
    SELECT invoice_prefix, COALESCE(MAX(CAST(regexp_replace(invoice_number, '[^\d]', '', 'g') AS INTEGER)), 0)
    INTO prefix, next_number
    FROM businesses b
    LEFT JOIN invoices i ON i.business_id = b.id
    WHERE b.id = business_id_param
    GROUP BY b.invoice_prefix;

    -- If no prefix found, use default
    IF prefix IS NULL THEN
        prefix := 'INV-';
    END IF;

    -- Increment the number
    next_number := next_number + 1;

    -- Generate the invoice number
    invoice_number := prefix || next_number::TEXT;

    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- GENERATE PURCHASE NUMBER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_purchase_number(business_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    purchase_number TEXT;
BEGIN
    -- Get the last purchase number for this business
    SELECT COALESCE(MAX(CAST(regexp_replace(purchase_number, '[^\d]', '', 'g') AS INTEGER)), 0)
    INTO next_number
    FROM purchases
    WHERE business_id = business_id_param;

    -- Increment the number
    next_number := next_number + 1;

    -- Generate the purchase number
    purchase_number := 'PO-' || next_number::TEXT;

    RETURN purchase_number;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- AUTO-GENERATE INVOICE NUMBER TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number(NEW.business_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_number_trigger
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
EXECUTE FUNCTION set_invoice_number();

-- ----------------------------------------------------------------------------
-- AUTO-GENERATE PURCHASE NUMBER TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_purchase_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.purchase_number IS NULL OR NEW.purchase_number = '' THEN
        NEW.purchase_number := generate_purchase_number(NEW.business_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_number_trigger
BEFORE INSERT ON purchases
FOR EACH ROW
WHEN (NEW.purchase_number IS NULL OR NEW.purchase_number = '')
EXECUTE FUNCTION set_purchase_number();

-- ----------------------------------------------------------------------------
-- UPDATE STOCK ON PURCHASE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product stock
    UPDATE products
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;

    -- Log in stock history
    INSERT INTO stock_history (
        business_id,
        product_id,
        transaction_type,
        quantity,
        stock_before,
        stock_after,
        reference_type,
        reference_id,
        notes
    )
    SELECT
        p.business_id,
        NEW.product_id,
        'purchase',
        NEW.quantity,
        p.current_stock,
        p.current_stock + NEW.quantity,
        'purchase',
        NEW.purchase_id,
        'Purchase: ' || pur.purchase_number
    FROM products p
    CROSS JOIN purchases pur
    WHERE p.id = NEW.product_id
    AND pur.id = NEW.purchase_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_stock_update_trigger
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_purchase();

-- ----------------------------------------------------------------------------
-- REDUCE STOCK ON INVOICE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_stock_on_invoice()
RETURNS TRIGGER AS $$
DECLARE
    product_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT current_stock INTO product_stock
    FROM products
    WHERE id = NEW.product_id;

    -- Check if sufficient stock
    IF product_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product. Available: %, Required: %',
            product_stock, NEW.quantity;
    END IF;

    -- Update product stock
    UPDATE products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;

    -- Log in stock history
    INSERT INTO stock_history (
        business_id,
        product_id,
        transaction_type,
        quantity,
        stock_before,
        stock_after,
        reference_type,
        reference_id,
        notes
    )
    SELECT
        p.business_id,
        NEW.product_id,
        'sale',
        -NEW.quantity,
        product_stock,
        product_stock - NEW.quantity,
        'invoice',
        NEW.invoice_id,
        'Sale: ' || inv.invoice_number
    FROM products p
    CROSS JOIN invoices inv
    WHERE p.id = NEW.product_id
    AND inv.id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_stock_update_trigger
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_invoice();

-- ----------------------------------------------------------------------------
-- UPDATE INVOICE TOTALS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update invoice totals
    UPDATE invoices
    SET
        subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
        tax_amount = (SELECT COALESCE(SUM(tax_amount), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
        discount_amount = (SELECT COALESCE(SUM(discount_amount), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id),
        total_amount = (
            (SELECT COALESCE(SUM(subtotal), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id) +
            (SELECT COALESCE(SUM(tax_amount), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id) -
            (SELECT COALESCE(SUM(discount_amount), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id)
        ) + COALESCE(NEW.shipping_amount, 0) + COALESCE(NEW.other_charges, 0) - COALESCE(NEW.discount_amount, 0),
        cost_of_goods_sold = (
            SELECT COALESCE(SUM(cost_per_unit * quantity), 0) FROM invoice_items WHERE invoice_id = NEW.invoice_id
        )
    WHERE id = NEW.invoice_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

-- ----------------------------------------------------------------------------
-- UPDATE PURCHASE TOTALS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_purchase_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update purchase totals
    UPDATE purchases
    SET
        subtotal = (SELECT COALESCE(SUM(subtotal), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id),
        tax_amount = (SELECT COALESCE(SUM(tax_amount), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id),
        discount_amount = (SELECT COALESCE(SUM(discount_amount), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id),
        total_amount = (
            (SELECT COALESCE(SUM(subtotal), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id) +
            (SELECT COALESCE(SUM(tax_amount), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id) -
            (SELECT COALESCE(SUM(discount_amount), 0) FROM purchase_items WHERE purchase_id = NEW.purchase_id)
        ) + COALESCE(NEW.shipping_amount, 0) + COALESCE(NEW.other_charges, 0)
    WHERE id = NEW.purchase_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_items_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_purchase_totals();

-- ----------------------------------------------------------------------------
-- CREATE PROFILE ON USER SIGNUP
-- ----------------------------------------------------------------------------
-- This trigger automatically creates a profile entry when a new user signs up
-- It uses SECURITY DEFINER and handles errors gracefully to avoid blocking signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert with exception handling for duplicate key or other errors
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- VIEWS FOR REPORTS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SALES SUMMARY VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW sales_summary AS
SELECT
    b.id AS business_id,
    b.name AS business_name,
    DATE_TRUNC('day', i.invoice_date) AS sale_date,
    COUNT(i.id) AS total_invoices,
    SUM(i.total_amount) AS total_sales,
    SUM(i.cost_of_goods_sold) AS total_cost,
    SUM(i.profit_amount) AS total_profit,
    AVG(i.total_amount) AS avg_order_value,
    COUNT(DISTINCT i.customer_id) AS unique_customers
FROM invoices i
JOIN businesses b ON i.business_id = b.id
WHERE i.status NOT IN ('draft', 'cancelled')
GROUP BY b.id, b.name, DATE_TRUNC('day', i.invoice_date);

COMMENT ON VIEW sales_summary IS 'Daily sales summary grouped by business and date';

-- ----------------------------------------------------------------------------
-- PROFIT/LOSS VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW profit_loss_summary AS
SELECT
    b.id AS business_id,
    b.name AS business_name,
    invoice_month AS month,
    SUM(i.total_amount) AS revenue,
    SUM(i.cost_of_goods_sold) AS cost_of_goods_sold,
    COALESCE((SELECT SUM(total_amount) FROM expenses WHERE business_id = b.id AND DATE_TRUNC('month', expense_date) = invoice_month), 0) AS expenses,
    SUM(i.profit_amount) - COALESCE((SELECT SUM(total_amount) FROM expenses WHERE business_id = b.id AND DATE_TRUNC('month', expense_date) = invoice_month), 0) AS net_profit
FROM (
    SELECT
        business_id,
        DATE_TRUNC('month', invoice_date) AS invoice_month,
        total_amount,
        cost_of_goods_sold,
        profit_amount
    FROM invoices
    WHERE status NOT IN ('draft', 'cancelled')
) i
JOIN businesses b ON i.business_id = b.id
GROUP BY b.id, b.name, invoice_month;

COMMENT ON VIEW profit_loss_summary IS 'Monthly profit and loss statement by business';

-- ----------------------------------------------------------------------------
-- STOCK VALUATION VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW stock_valuation AS
SELECT
    b.id AS business_id,
    b.name AS business_name,
    c.name AS category_name,
    COUNT(p.id) AS total_products,
    SUM(p.current_stock) AS total_units,
    SUM(p.current_stock * p.purchase_price) AS total_cost_value,
    SUM(p.current_stock * p.selling_price) AS total_retail_value,
    SUM(p.current_stock * (p.selling_price - p.purchase_price)) AS potential_profit
FROM products p
JOIN businesses b ON p.business_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
GROUP BY b.id, b.name, c.name;

COMMENT ON VIEW stock_valuation IS 'Current stock valuation by business and category';

-- ----------------------------------------------------------------------------
-- LOW STOCK ALERT VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT
    b.id AS business_id,
    b.name AS business_name,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    p.current_stock,
    p.low_stock_threshold,
    p.reorder_quantity,
    p.supplier_id,
    s.name AS supplier_name,
    s.phone AS supplier_phone,
    (p.low_stock_threshold - p.current_stock) AS shortage_quantity
FROM products p
JOIN businesses b ON p.business_id = b.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.current_stock <= p.low_stock_threshold
AND p.is_active = true
AND p.is_track_stock = true;

COMMENT ON VIEW low_stock_alerts IS 'Products that need to be reordered';

-- ----------------------------------------------------------------------------
-- TOP SELLING PRODUCTS VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW top_selling_products AS
SELECT
    b.id AS business_id,
    b.name AS business_name,
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    SUM(ii.quantity) AS total_quantity_sold,
    SUM(ii.total_amount) AS total_revenue,
    SUM(ii.quantity * ii.cost_per_unit) AS total_cost,
    SUM(ii.total_amount - (ii.quantity * ii.cost_per_unit)) AS total_profit,
    COUNT(DISTINCT ii.invoice_id) AS total_invoices
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.id
JOIN products p ON ii.product_id = p.id
JOIN businesses b ON p.business_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE i.status NOT IN ('draft', 'cancelled')
GROUP BY b.id, b.name, p.id, p.name, c.name
ORDER BY total_revenue DESC;

COMMENT ON VIEW top_selling_products IS 'Top selling products by revenue';

-- ----------------------------------------------------------------------------
-- CUSTOMER SALES REPORT VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW customer_sales_report AS
SELECT
    b.id AS business_id,
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone,
    c.email,
    COUNT(DISTINCT i.id) AS total_invoices,
    SUM(i.total_amount) AS total_purchases,
    MIN(i.invoice_date) AS first_purchase_date,
    MAX(i.invoice_date) AS last_purchase_date,
    AVG(i.total_amount) AS avg_order_value
FROM customers c
JOIN businesses b ON c.business_id = b.id
LEFT JOIN invoices i ON c.id = i.customer_id AND i.status NOT IN ('draft', 'cancelled')
GROUP BY b.id, c.id, c.name, c.phone, c.email
ORDER BY total_purchases DESC;

COMMENT ON VIEW customer_sales_report IS 'Customer purchase history and statistics';

-- ----------------------------------------------------------------------------
-- SUPPLIER PURCHASE REPORT VIEW
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW supplier_purchase_report AS
SELECT
    b.id AS business_id,
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.phone,
    s.email,
    COUNT(DISTINCT p.id) AS total_purchases,
    SUM(p.total_amount) AS total_purchase_amount,
    MIN(p.purchase_date) AS first_purchase_date,
    MAX(p.purchase_date) AS last_purchase_date,
    AVG(p.total_amount) AS avg_purchase_value
FROM suppliers s
JOIN businesses b ON s.business_id = b.id
LEFT JOIN purchases p ON s.id = p.supplier_id AND p.status != 'cancelled'
GROUP BY b.id, s.id, s.name, s.phone, s.email
ORDER BY total_purchase_amount DESC;

COMMENT ON VIEW supplier_purchase_report IS 'Supplier purchase history and statistics';

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: These need to be created manually in Supabase Dashboard or via API
-- SQL for reference:

-- INSERT INTO storage.buckets (id, name, public) VALUES
-- ('business-logos', 'business-logos', true),
-- ('product-images', 'product-images', true),
-- ('receipts', 'receipts', false),
-- ('attachments', 'attachments', false);

-- Policies for storage buckets would be added separately

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant select on all tables for authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant necessary permissions for authenticated users
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant select on views
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
