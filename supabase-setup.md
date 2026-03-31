# Supabase Setup Guide
## Invoice Builder & Inventory Management System

This guide will walk you through setting up Supabase for the Invoice Builder project.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create a Supabase Project](#create-a-supabase-project)
3. [Run the Database Schema](#run-the-database-schema)
4. [Set Up Storage Buckets](#set-up-storage-buckets)
5. [Configure Authentication](#configure-authentication)
6. [Get Your Credentials](#get-your-credentials)
7. [Set Environment Variables](#set-environment-variables)
8. [Verify Setup](#verify-setup)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- A Supabase account (free tier is sufficient for development)
- The `schema.sql` file from the project root directory

---

## Create a Supabase Project

### Step 1: Sign Up/Login to Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a new account or log in if you already have one

### Step 2: Create a New Project

1. Click on **"New Project"**
2. Choose your organization (or create one)
3. Fill in the project details:
   - **Name**: `invoice-builder` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (usually takes 2-3 minutes)

---

## Run the Database Schema

### Step 1: Open SQL Editor

1. In your Supabase project dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to open a new SQL editor window

### Step 2: Copy and Run the Schema

1. Open the `schema.sql` file from `E:\Invoice Builder\schema.sql`
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click the **"Run"** button (or press `Ctrl+Enter`)

### Step 3: Verify Schema Creation

After running the schema, you should see a success message. To verify:

1. Click on **"Database"** in the left sidebar
2. Under **"Tables"**, you should see all 13 tables:
   - profiles
   - businesses
   - categories
   - suppliers
   - products
   - customers
   - purchases
   - purchase_items
   - invoices
   - invoice_items
   - stock_history
   - payments
   - expenses

3. Under **"Views"**, you should see the report views:
   - sales_summary
   - profit_loss_summary
   - stock_valuation
   - low_stock_alerts
   - top_selling_products
   - customer_sales_report
   - supplier_purchase_report

4. Under **"Functions"**, you should see the custom functions

---

## Set Up Storage Buckets

The application uses Supabase Storage for uploading files like logos, product images, and receipts.

### Step 1: Go to Storage

1. Click on **"Storage"** in the left sidebar
2. Click **"Create a new bucket"**

### Step 2: Create Buckets

Create the following buckets:

#### 1. business-logos (Public)

- **Name**: `business-logos`
- **Public bucket**: Toggle ON (checked)
- **File size limit**: 2MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

#### 2. product-images (Public)

- **Name**: `product-images`
- **Public bucket**: Toggle ON (checked)
- **File size limit**: 2MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `image/webp`

#### 3. receipts (Private)

- **Name**: `receipts`
- **Public bucket**: Toggle OFF (unchecked)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `application/pdf`

#### 4. attachments (Private)

- **Name**: `attachments`
- **Public bucket**: Toggle OFF (unchecked)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/png`, `image/jpeg`, `image/jpg`, `application/pdf`

### Step 3: Set Up Storage Policies

For each bucket, you need to set up Row Level Security (RLS) policies. Click on each bucket and add the following policies:

#### For public buckets (business-logos, product-images):

**Insert Policy:**
```sql
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = '<bucket-name>' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Select Policy:**
```sql
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
USING (bucket_id = '<bucket-name>');
```

**Update Policy:**
```sql
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = '<bucket-name>' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Delete Policy:**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = '<bucket-name>' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For private buckets (receipts, attachments):

Replace `<bucket-name>` with the actual bucket name in the policies above, but remove the "Public can view" policy.

---

## Configure Authentication

### Step 1: Enable Email/Password Authentication

1. Click on **"Authentication"** in the left sidebar
2. Click on **"Providers"**
3. Ensure **"Email"** provider is enabled (it should be by default)

### Step 2: Configure Email Templates (Optional)

1. Click on **"Auth"** > **"Email Templates"**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Email change

### Step 3: Additional Authentication Settings

1. Go to **"Auth"** > **"URL Configuration"**
2. Set **"Site URL"** to your development URL (e.g., `http://localhost:3000`)
3. Set **"Redirect URLs"** to allow redirects from your app

---

## Get Your Credentials

### Step 1: Get Project URL

1. Click on **"Settings"** (gear icon) in the left sidebar
2. Click on **"API"**
3. Copy the **Project URL** - it looks like:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

### Step 2: Get Anon Key

1. On the same **API** page
2. Copy the **anon/public** key - it looks like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Get Service Role Key (Optional - for admin operations)

1. On the same **API** page
2. Copy the **service_role** key (keep this secret!)
   - **WARNING**: Never expose this key in client-side code!

---

## Set Environment Variables

Create a `.env.local` file in your Next.js project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For server-side admin operations
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholder values with your actual credentials from the previous step.

---

## Verify Setup

### Step 1: Test Database Connection

Create a simple test script or query to verify the connection:

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see all 13 tables listed.

### Step 2: Test RLS Policies

Run this query to verify RLS is enabled:

```sql
-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should have `rowsecurity = true`.

### Step 3: Test a Sample Insert (Optional)

You can test the setup by creating a test user and business:

```sql
-- Note: This is just for testing - normally users are created via auth

-- Create a test profile (after creating auth user first)
INSERT INTO profiles (id, email, full_name)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test User');

-- Create a test business
INSERT INTO businesses (user_id, name, slug, invoice_prefix)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'Test Business', 'test-business', 'INV-');

-- Verify the data
SELECT * FROM businesses WHERE slug = 'test-business';
```

---

## Troubleshooting

### Issue: "Relation does not exist" error

**Solution**: Make sure you ran the entire schema.sql file in the correct order. Drop all tables and re-run the schema.

### Issue: RLS policy errors

**Solution**: Verify that RLS policies are created correctly. Check the Database > RLS Policies section in Supabase dashboard.

### Issue: Storage upload fails

**Solution**:
- Check that storage buckets are created
- Verify storage policies are set up correctly
- Ensure the bucket names match exactly in your code

### Issue: Auth user created but profile not created

**Solution**: The `handle_new_user` trigger should automatically create profiles. If it's not working:
1. Check that the trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
2. Re-run the trigger creation function from the schema

### Issue: Stock not updating automatically

**Solution**:
1. Verify triggers are created: `SELECT * FROM pg_trigger WHERE tgname LIKE '%stock%';`
2. Check the trigger functions exist in Database > Functions
3. Ensure the triggers are active

---

## Next Steps

After completing this setup:

1. **Install Supabase Client** in your Next.js project:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client Utility**:
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

3. **Proceed with Frontend Development** using this backend setup

---

## Database Schema Reference

### Tables Summary

| Table | Purpose | Key Features |
|-------|---------|--------------|
| profiles | User profiles | Extends auth.users, role-based access |
| businesses | Business entities | Multi-business per user, invoice settings |
| categories | Product categories | Hierarchical structure |
| suppliers | Vendor information | Contact details, payment terms |
| products | Inventory items | Auto-calculated profit margin, stock tracking |
| customers | Customer database | Purchase history, credit terms |
| purchases | Purchase orders | Auto-numbered, stock updates |
| purchase_items | Purchase line items | Linked to products |
| invoices | Sales invoices | Auto-numbered, profit calculation |
| invoice_items | Invoice line items | Cost tracking for profit |
| stock_history | Audit log | Complete stock transaction history |
| payments | Payment records | Multi-purpose payment tracking |
| expenses | Business expenses | Profit/loss calculation |

### Automated Features

- **Auto-generated invoice numbers** with business-specific prefix
- **Auto-generated purchase numbers**
- **Auto-updated stock** on purchase and invoice creation
- **Auto-calculated profit margins** on products
- **Auto-calculated invoice totals**
- **Auto-updated timestamps**
- **Stock history logging** for all transactions

### Report Views

- `sales_summary` - Daily sales by business
- `profit_loss_summary` - Monthly P&L statements
- `stock_valuation` - Current inventory value
- `low_stock_alerts` - Products needing reorder
- `top_selling_products` - Best-selling items
- `customer_sales_report` - Customer analytics
- `supplier_purchase_report` - Supplier analytics

---

## Support

If you encounter issues not covered in this guide:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [schema.sql](./schema.sql) file for details
3. Check the project [idea.md](./idea.md) for specifications
4. Update [progress.md](./progress.md) with your findings

---

**Last Updated**: December 23, 2025
**Schema Version**: 1.0
