# Dairy Management System - Admin Panel

A comprehensive dairy management system built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

### Core Functionality
- **Dashboard**: Real-time statistics and KPIs
- **Milk Collections**: Track and manage daily milk collections with QC
- **Suppliers**: Manage farmer/supplier database with KYC
- **Batches**: Production batch management with traceability
- **Inventory**: Stock management and tracking
- **Routes & Deliveries**: Delivery route planning and tracking
- **Payments & Ledger**: Financial tracking and reconciliation
- **Reports**: Comprehensive reporting and analytics
- **Audit Logs**: System activity tracking
- **User Management**: Role-based access control

### Technical Features
- Real-time updates using Supabase Realtime
- Optimistic UI updates for instant feedback
- Server-side rendering (SSR) for fast initial loads
- SWR for efficient data fetching and caching
- Responsive design for mobile and desktop
- Type-safe with TypeScript

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Database Setup

1. Go to your Supabase project's SQL Editor
2. Run the database schema from `guide/Top-level features (complete list).txt`
3. The schema includes:
   - All tables with proper constraints
   - Indexes for performance
   - Row Level Security (RLS) policies
   - Triggers for audit logging
   - Stored procedures for batch creation

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── page.tsx       # Dashboard
│   │   ├── suppliers/     # Suppliers management
│   │   ├── collections/   # Milk collections
│   │   ├── batches/       # Production batches
│   │   ├── deliveries/    # Delivery management
│   │   ├── inventory/     # Stock management
│   │   ├── routes/        # Route planning
│   │   ├── payments/      # Payments & ledger
│   │   ├── users/         # User management
│   │   └── ...
│   ├── api/               # API routes
│   │   ├── dashboard/
│   │   ├── suppliers/
│   │   ├── milk-collections/
│   │   └── ...
│   └── globals.css
├── components/
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── hooks.ts           # Custom React hooks
│   └── utils.ts           # Utility functions
└── types/
    └── database.ts        # TypeScript types
```

## API Routes

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier

### Collections
- `GET /api/milk-collections` - List collections
- `POST /api/milk-collections` - Create collection

### Batches
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch (uses stored procedure)

### Deliveries
- `GET /api/deliveries` - List deliveries
- `POST /api/deliveries` - Create delivery

### Inventory
- `GET /api/inventory` - List inventory items

### Routes
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user

## Real-time Features

The application uses Supabase Realtime for live updates:

- **Dashboard**: Auto-updates for collections and deliveries
- **Collections**: Live updates when new collections are added
- **Deliveries**: Real-time delivery status changes
- **Batches**: Production batch updates

## Performance Optimization

- Server-side rendering for initial page loads
- SWR for client-side data fetching with caching
- Optimistic UI updates for instant feedback
- Real-time subscriptions instead of polling
- Efficient database queries with proper indexing

## Security

- Row Level Security (RLS) policies on all tables
- Role-based access control (RBAC)
- Secure API routes
- Type-safe database queries

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
