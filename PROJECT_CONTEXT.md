# Project Context: Real Invoice Generator

This document provides a concise, complete briefing of this project for developers and AI chatbots to immediately understand the architecture, current state, and upgrade roadmap.

---

## 1. Project Overview
- **Name:** Real Invoice Generator
- **Description:** A modern, mobile-and-desktop responsive full-stack invoice generator application. Users can save multiple business profiles (freelance, agency, consulting), switch between active businesses seamlessly, auto-populate sender info on invoices, add line items with automated tax/discount calculations, upload company logos, export high-definition PDFs, and persist all documents to the cloud.
- **Repository:** https://github.com/santhoshjan2008-ai/Real-invoice-generator.git
- **Dev Server Port:** `http://localhost:3000`

---

## 2. Tech Stack
- **Frontend Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss"`)
- **Icons & Animations:** `lucide-react`, `framer-motion`
- **PDF Generation:** `html2canvas` + `jspdf`
- **Backend / BaaS:** Supabase
  - **Auth:** Email/Password authentication & Google OAuth (`@supabase/supabase-js`)
  - **Database:** PostgreSQL with Row-Level Security (RLS)
  - **Storage:** Supabase Storage (`company-logos`, `invoice-pdfs` buckets)

---

## 3. Directory Structure & Key Files
```
Real-invoice-generator/
├── database/
│   └── migrations/
│       ├── combined_full_setup.sql          # Complete SQL script for tables, triggers & storage
│       ├── 005_fix_storage_buckets.sql      # SQL for storage buckets & RLS policies
│       └── 006_create_business_profiles.sql # SQL for multi-business tables & policies
├── frontend/
│   ├── .env                                 # Contains VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY (Git ignored)
│   ├── .env.example                         # Public template for environment variables
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                        # LoginForm, SignUpForm, GoogleAuthButton, ForgotPassword
│   │   │   ├── business/                    # BusinessSwitcher, BusinessCard, BusinessFormModal
│   │   │   ├── common/                      # AppHeader, BottomNav (mobile dock)
│   │   │   └── invoice/                     # InvoiceForm, InvoicePreview, InvoiceCard, RevenueCard
│   │   ├── context/
│   │   │   ├── AuthContext.tsx              # User session & profile state
│   │   │   ├── BusinessContext.tsx          # Multi-business state, active selection & switching
│   │   │   └── InvoiceContext.tsx           # Async invoice state, metrics, CRUD scoped to active business
│   │   ├── pages/
│   │   │   ├── Home.tsx                     # Dashboard (revenue cards, activity feed scoped to business)
│   │   │   ├── CreateInvoice.tsx            # Interactive generator (auto-filled from active business)
│   │   │   ├── Invoices.tsx                 # All invoices table/cards with active/all filter
│   │   │   ├── BusinessManagement.tsx       # Manage, add, edit, delete & switch business profiles
│   │   │   ├── BusinessOnboarding.tsx       # First-time user onboarding setup
│   │   │   ├── Profile.tsx                  # Account settings & active business info
│   │   │   └── AuthPage.tsx                 # Login / Sign up portal
│   │   ├── services/
│   │   │   ├── supabaseClient.ts            # Supabase client singleton
│   │   │   ├── authService.ts               # Supabase auth methods & wrappers
│   │   │   ├── businessService.ts           # CRUD for public.business_profiles & active preference
│   │   │   ├── invoiceService.ts            # Cloud CRUD for public.invoices + localStorage fallback
│   │   │   └── storageService.ts            # Upload/delete in company-logos & invoice-pdfs buckets
│   │   ├── types/
│   │   │   ├── business.types.ts            # BusinessProfile, BusinessProfileFormData, BusinessType
│   │   │   ├── invoice.types.ts             # Invoice, LineItem, BusinessDetails, ClientDetails
│   │   │   └── user.types.ts                # UserProfile, AuthContext
│   │   └── utils/
│   │       ├── pdfExport.ts                 # PDF download + silent background cloud upload
│   │       └── formatters.ts                # Currency and date formatting
│   └── vite.config.ts                       # Port 3000 configuration
└── backend/                                 # Optional standalone API scaffolding (if needed)
```

---

## 4. Database & Storage Architecture
- **`public.profiles`**: Auto-populated on `auth.users` insert via PostgreSQL trigger. Stores `id`, `full_name`, `email`, `avatar_url`.
- **`public.business_profiles`**: Scoped by `user_id = auth.uid()` via RLS.
  - Fields: `id`, `user_id`, `business_name`, `business_type`, `business_description`, `logo_url`, `email`, `phone`, `website`, address fields (`street_address`, `city`, `state`, `country`, `postal_code`), tax fields (`tax_type`, `tax_number`, `default_tax_rate`), banking fields (`account_holder_name`, `bank_name`, `account_number`, `ifsc_code`, `swift_code`, `upi_id`, `payment_instructions`), invoice preference defaults (`default_currency`, `default_payment_terms`, `default_invoice_notes`, `default_invoice_footer`, `default_due_period`), `is_default`.
- **`public.user_business_preferences`**: Scoped by `user_id = auth.uid()` via RLS. Stores `active_business_id` to persist active business selection across sessions and browsers.
- **`public.invoices`**: Scoped by `user_id = auth.uid()` via RLS. Linked via `business_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL` while preserving the full snapshot in `business_details` JSONB.
- **Storage Buckets**:
  - `company-logos`: Stores company logos structured as `{userId}/{businessId}/logo_{timestamp}.{ext}`.
  - `invoice-pdfs`: Stores exported invoice PDF files with public URLs.

---

## 5. What Works Today
1. User registration, login, logout, password reset, and session persistence.
2. **First-time onboarding:** Directs users with 0 businesses to a setup page before creating invoices.
3. **Multi-business management:** Create, edit, delete, set default, and switch between multiple businesses.
4. **Global active switcher:** Header dropdown to switch active business anytime with multi-tab sync.
5. **Auto-populating generator:** Opening Create Invoice instantly pre-fills sender details, banking info, tax ID, currency, and payment terms from the active business.
6. **Business-scoped dashboard:** Dashboard revenue, outstanding metrics, and recent activity reflect the active business.
7. Automatic logo image and PDF upload to Supabase Storage.
8. Local cache fallback to ensure app usability even during offline states or before SQL migrations are applied.

---

## 6. Recommended Next Upgrades
- **Email Delivery:** Send invoices directly to client emails via Resend / SendGrid API.
- **Payment Integration:** Attach Stripe / PayPal payment links to invoices.
- **Invoice Themes:** Offer multiple visual templates (Minimal, Modern, Corporate).
- **Client Directory:** Auto-complete client details from a reusable clients database table.
- **Multi-currency Conversion:** Real-time exchange rate calculation.
- **Recurring Invoices:** Automated generation on weekly/monthly schedules.

---

## 7. Local Development Quickstart
```bash
cd frontend
npm install
npm run dev
# Server running at http://localhost:3000
```
