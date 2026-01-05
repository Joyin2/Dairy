# AWS RDS Migration Checklist

Use this checklist to track your migration progress.

## ☑️ Pre-Migration

- [ ] Review current Supabase usage
- [ ] Backup existing data (if any)
- [ ] Review AWS account access and permissions
- [ ] Decide on RDS instance size and configuration

## ☑️ AWS RDS Setup

- [ ] Create AWS RDS PostgreSQL instance
  - [ ] Engine: PostgreSQL 15+
  - [ ] Instance class selected
  - [ ] Storage configured
  - [ ] Backup retention set
  - [ ] Initial database name: `dairy_management`
  
- [ ] Configure networking
  - [ ] VPC selected
  - [ ] Subnet group configured
  - [ ] Public access enabled (dev) or disabled (prod)
  
- [ ] Configure security group
  - [ ] Inbound rule for port 5432 added
  - [ ] Source IP addresses configured
  
- [ ] Note RDS endpoint URL
- [ ] Test connection with psql

## ☑️ Database Schema

- [ ] Connect to RDS instance with psql
- [ ] Run `database-schema.sql` script
- [ ] Verify all extensions installed
  - [ ] pgcrypto
  - [ ] pg_trgm
  - [ ] postgis
- [ ] Verify all tables created (12 tables)
- [ ] Verify indexes created
- [ ] Verify triggers created
- [ ] Verify stored procedures created

## ☑️ Application Configuration

- [ ] Update `.env.local` with AWS RDS credentials
  - [ ] AWS_RDS_HOST
  - [ ] AWS_RDS_PORT
  - [ ] AWS_RDS_DATABASE
  - [ ] AWS_RDS_USER
  - [ ] AWS_RDS_PASSWORD
  
- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Review new database library (`src/lib/db.ts`)

## ☑️ Code Migration

### API Routes Updated

- [x] `/api/shops` - Shop management
- [x] `/api/suppliers` - Supplier management
- [x] `/api/users` - User management
- [ ] `/api/audit-logs` - Audit log queries
- [ ] `/api/batches` - Batch management
- [ ] `/api/deliveries` - Delivery tracking
- [ ] `/api/inventory` - Inventory management
- [ ] `/api/milk-collections` - Collection records
- [ ] `/api/products` - Product catalog
- [ ] `/api/routes` - Route planning
- [ ] `/api/ledger` - Financial ledger
- [ ] `/api/dashboard/stats` - Dashboard statistics

### Migration Pattern Applied

For each route, ensure:
- [ ] Import `db` and `hasDBConfig` from `@/lib/db`
- [ ] Replace Supabase queries with `db` helper methods
- [ ] Update error codes (PGRST205 → 42P01)
- [ ] Maintain mock data fallback
- [ ] Test CRUD operations

## ☑️ Testing

- [ ] Run database connection test
  ```bash
  npm run test:db
  ```

- [ ] Start development server
  ```bash
  npm run dev
  ```

- [ ] Test migrated API endpoints
  - [ ] GET /api/shops
  - [ ] POST /api/shops
  - [ ] PUT /api/shops?id=xxx
  - [ ] GET /api/suppliers
  - [ ] POST /api/suppliers
  - [ ] PUT /api/suppliers?id=xxx
  - [ ] GET /api/users
  - [ ] POST /api/users

- [ ] Test admin interface
  - [ ] Dashboard loads
  - [ ] Shops page works
  - [ ] Suppliers page works
  - [ ] Users page works
  - [ ] CRUD operations work
  - [ ] Search functionality works

## ☑️ Data Migration (If applicable)

If you have existing data in Supabase:

- [ ] Export data from Supabase
- [ ] Transform data format (if needed)
- [ ] Import data to AWS RDS
- [ ] Verify data integrity
- [ ] Test with production-like data

## ☑️ Performance Optimization

- [ ] Review database indexes
- [ ] Test query performance with EXPLAIN ANALYZE
- [ ] Configure connection pool settings
- [ ] Enable query logging (if needed)
- [ ] Set up slow query monitoring

## ☑️ Security Hardening

### Development
- [ ] .env.local not committed to git
- [ ] Connection pooling configured
- [ ] Error handling in place

### Production
- [ ] RDS public access disabled
- [ ] AWS Secrets Manager configured
- [ ] SSL/TLS enabled
- [ ] Security group rules restricted
- [ ] IAM roles configured
- [ ] Encryption at rest enabled
- [ ] Automated backups enabled
- [ ] VPC peering configured (if needed)

## ☑️ Monitoring & Maintenance

- [ ] CloudWatch dashboard created
- [ ] Alarms configured
  - [ ] CPU utilization
  - [ ] Database connections
  - [ ] Free storage space
  - [ ] Read/Write latency
- [ ] Backup strategy documented
- [ ] Disaster recovery plan created

## ☑️ Documentation

- [ ] Update project README
- [ ] Document environment variables
- [ ] Document database schema changes
- [ ] Update deployment instructions
- [ ] Train team on new setup

## ☑️ Production Deployment

- [ ] Review all checklist items above
- [ ] Production RDS instance created
- [ ] Production environment variables set
- [ ] Database schema deployed
- [ ] Data migrated (if applicable)
- [ ] Smoke tests passed
- [ ] Performance tests passed
- [ ] Security scan completed
- [ ] Backup verified
- [ ] Monitoring active
- [ ] Team notified

## ☑️ Post-Deployment

- [ ] Monitor application logs
- [ ] Monitor RDS metrics
- [ ] Verify all features working
- [ ] Test error scenarios
- [ ] Document any issues
- [ ] Create runbook for common issues

## ☑️ Cleanup (Optional)

- [ ] Remove Supabase project (if no longer needed)
- [ ] Cancel Supabase subscription
- [ ] Archive Supabase data
- [ ] Update documentation
- [ ] Remove old Supabase references in code

---

## Quick Reference

### Connection Test
```bash
npm run test:db
```

### Database Schema
```bash
psql -h your-rds-host -U postgres -d dairy_management -f database-schema.sql
```

### Start Development
```bash
npm run dev
```

### Check Logs
- Application: Check terminal/console
- RDS: AWS Console → RDS → Logs & Events

### Emergency Rollback
1. Keep Supabase credentials in .env.backup
2. Reinstall: `npm install @supabase/supabase-js @supabase/ssr`
3. Revert code from git history

---

**Status:** Migration in progress  
**Started:** December 15, 2025  
**Completed:** ___ (to be filled)

---

## Notes

Use this section to track any issues, decisions, or important information:

- 
- 
- 

---

**Tip:** Print this checklist or keep it open in a separate window as you work through the migration.
