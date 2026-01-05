# Quick Start Guide - Dairy Management System

Get your dairy management system up and running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic understanding of Next.js

## Step 1: Create Supabase Project (5 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Dairy Management
   - **Database Password**: (choose a strong password and save it)
   - **Region**: Select closest to you
5. Click "Create new project" and wait for setup to complete

## Step 2: Set Up Database (3 minutes)

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire content from `database-schema.sql` file
4. Paste into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. Wait for success message - you should see "Success. No rows returned"

**What this does:**
- Creates all 12 tables (suppliers, collections, batches, etc.)
- Sets up indexes for fast queries
- Creates triggers for automation
- Sets up audit logging
- Creates the batch creation stored procedure

## Step 3: Get Your Supabase Credentials (2 minutes)

1. In Supabase, go to **Settings** → **API**
2. You need two things:
   - **Project URL**: Copy from "Project URL" field
   - **Anon Key**: Copy from "Project API keys" → "anon public" key

## Step 4: Set Up the Application (3 minutes)

1. **Clone or navigate to the project**
   ```bash
   cd "c:/joyin projects/Dairy Project/my-app"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```
   
   Or on Windows PowerShell:
   ```powershell
   copy .env.example .env.local
   ```

4. **Edit `.env.local`**
   
   Open `.env.local` in your code editor and paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   Replace `your-project.supabase.co` and `your-anon-key-here` with the values you copied in Step 3.

## Step 5: Run the Application (1 minute)

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   
   Navigate to: [http://localhost:3000/admin](http://localhost:3000/admin)

🎉 **You should now see your admin dashboard!**

## Step 6: Add Sample Data (Optional - 2 minutes)

To test the system with sample data:

1. Go back to Supabase **SQL Editor**
2. Copy this sample data query and run it:

```sql
-- Sample products
INSERT INTO products (name, sku, uom, shelf_life_days) VALUES
  ('Full Cream Milk', 'FCM-001', 'liter', 3),
  ('Toned Milk', 'TM-001', 'liter', 3),
  ('Skimmed Milk', 'SM-001', 'liter', 3);

-- Sample suppliers
INSERT INTO suppliers (name, phone, email, address, kyc_status) VALUES
  ('Ramesh Kumar', '+91 98765 43210', 'ramesh@example.com', 'Village Rampur, District Meerut, UP', 'approved'),
  ('Suresh Patel', '+91 98765 43211', 'suresh@example.com', 'Village Patelnagar, District Meerut, UP', 'approved'),
  ('Mahesh Singh', '+91 98765 43212', 'mahesh@example.com', 'Village Singhpur, District Meerut, UP', 'pending');

-- Sample shops
INSERT INTO shops (name, contact, address) VALUES
  ('Sharma Dairy Shop', '+91 98765 54321', 'Main Market, Meerut'),
  ('Gupta Milk Center', '+91 98765 54322', 'Civil Lines, Meerut'),
  ('Singh Store', '+91 98765 54323', 'Sadar Bazaar, Meerut');

-- Sample milk collections (get supplier IDs first)
INSERT INTO milk_collections (supplier_id, qty_liters, fat, snf, qc_status, created_at)
SELECT 
  s.id,
  45.5 + (random() * 20),
  3.8 + (random() * 0.8),
  8.0 + (random() * 1.0),
  CASE WHEN random() > 0.3 THEN 'approved'::collection_qc ELSE 'pending'::collection_qc END,
  NOW() - (random() * interval '5 hours')
FROM suppliers s
LIMIT 10;
```

3. Refresh your admin dashboard - you should see data!

## Troubleshooting

### "Failed to fetch" errors
- Check that your Supabase URL and key are correct in `.env.local`
- Make sure you restarted the dev server after creating `.env.local`
- Verify your Supabase project is active

### Database errors
- Make sure you ran the complete `database-schema.sql` file
- Check the SQL Editor for any error messages
- Try running the schema again (it's safe to run multiple times)

### Port 3000 already in use
```bash
# Use a different port
npm run dev -- -p 3001
```
Then visit: http://localhost:3001/admin

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## What You Can Do Now

✅ **View Dashboard** - See real-time stats
✅ **Manage Suppliers** - View/search suppliers
✅ **Track Collections** - Monitor milk collections
✅ **Production Batches** - Track production
✅ **Real-time Updates** - Changes appear instantly

## Next Steps

1. **Add Authentication**
   - Implement Supabase Auth
   - Create login page
   - Set up user roles

2. **Complete Other Pages**
   - Deliveries tracking
   - Inventory management
   - Route planning
   - Financial reports

3. **Customize**
   - Update branding
   - Add your logo
   - Customize colors

## Learn More

- **Full Documentation**: See `SETUP.md`
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **Database Schema**: See `database-schema.sql`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Need Help?

1. Check `IMPLEMENTATION_STATUS.md` for feature coverage
2. Review `SETUP.md` for detailed information
3. Check Supabase logs in the Dashboard
4. Look at browser console for errors
5. Verify database schema was created correctly

## Tips for Success

💡 **Enable Realtime**
- In Supabase, go to Database → Replication
- Enable replication for tables you want real-time updates on

💡 **Check Database Status**
- Go to Supabase → Database → Tables
- Verify all 12 tables are created

💡 **Test API Routes**
- Visit: http://localhost:3000/api/dashboard/stats
- You should see JSON with statistics

💡 **Monitor Performance**
- Use browser DevTools → Network tab
- Check query response times
- Supabase Dashboard shows query performance

## You're All Set! 🚀

Your dairy management system is now running with:
- ✅ Complete database schema
- ✅ Real-time dashboard
- ✅ Supplier management
- ✅ Collection tracking
- ✅ Batch management
- ✅ API routes ready
- ✅ Real-time updates enabled

Happy coding! 🥛
