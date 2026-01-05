# AWS RDS Connection Timeout Fix Guide

## Problem
You're experiencing **connection timeouts** when trying to connect to AWS RDS PostgreSQL from your local machine. The database pool creates successfully, but all queries fail with:

```
Error: Connection terminated due to connection timeout
Error: Connection terminated unexpectedly
```

## Root Cause
AWS RDS instances are **secured by default** and block external connections. Your local machine cannot reach the database due to security group rules.

---

## Solution: Fix AWS RDS Security Group

### Step 1: Get Your Public IP Address

Open PowerShell and run:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

Or visit: https://whatismyipaddress.com/

**Copy your IP address** (e.g., `203.0.113.45`)

---

### Step 2: Configure RDS Security Group

#### 2.1 Open AWS Console
1. Go to: https://console.aws.amazon.com/rds/
2. Click on **"Databases"** in the left sidebar
3. Click on your database: **`dairyproject`**

#### 2.2 Find Security Group
1. In the **"Connectivity & security"** tab, scroll down to **"Security"**
2. Click on the **VPC security group** link (e.g., `sg-0abc123def456`)
   - This will open the EC2 Security Groups console

#### 2.3 Add Inbound Rule
1. Select the security group
2. Click **"Edit inbound rules"**
3. Click **"Add rule"**
4. Configure the new rule:
   - **Type:** PostgreSQL
   - **Protocol:** TCP
   - **Port Range:** 5432
   - **Source:** My IP (or Custom: `YOUR_IP/32`)
   - **Description:** `Local development access`

5. Click **"Save rules"**

---

### Step 3: Make RDS Publicly Accessible

#### 3.1 Modify Database Settings
1. Go back to RDS console → **Databases**
2. Select your database: **`dairyproject`**
3. Click **"Modify"**

#### 3.2 Enable Public Access
1. Scroll to **"Connectivity"** section
2. Expand **"Additional configuration"**
3. Find **"Public access"**
4. Select **"Yes"** (Publicly accessible)

5. Scroll to bottom and click **"Continue"**
6. Choose **"Apply immediately"**
7. Click **"Modify DB instance"**

⚠️ **Wait 2-5 minutes** for changes to apply

---

### Step 4: Test Connection

Run the connection test script:

```powershell
cd "c:\joyin projects\Dairy Project\my-app"
node scripts/test-db-connection.js
```

**Expected Output:**
```
🔍 Testing AWS RDS Database Connection...

📋 Configuration:
   Host: dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com
   Port: 5432
   Database: dairy_management
   User: postgres
   Password: ✅ Set

🔌 Attempting to connect...
✅ Connection successful!

📊 Running test query...
✅ Query successful!
   Current Time: 2025-12-17 12:30:45
   PostgreSQL Version: PostgreSQL 16.1

📚 Checking database tables...
⚠️  No tables found. You need to run the database schema.

✅ All checks passed! Database is ready.
```

---

## Step 5: Load Database Schema

If you see "No tables found", you need to load the schema:

### Option A: Using pgAdmin (Windows GUI)

1. **Download pgAdmin:** https://www.pgadmin.org/download/
2. **Install and open pgAdmin**
3. **Add new server:**
   - Right-click "Servers" → "Register" → "Server"
   - **General tab:**
     - Name: `Dairy RDS`
   - **Connection tab:**
     - Host: `dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com`
     - Port: `5432`
     - Database: `dairy_management`
     - Username: `postgres`
     - Password: `<your-password>`
4. **Connect** and right-click database → "Query Tool"
5. **Open file:** `database-schema.sql`
6. **Execute** (F5 or ⚡ button)

### Option B: Using psql Command Line

First, install PostgreSQL client tools:
1. Download from: https://www.postgresql.org/download/windows/
2. Install (choose only "Command Line Tools")

Then run:
```powershell
cd "c:\joyin projects\Dairy Project\my-app"

psql -h dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com -U postgres -d dairy_management -f database-schema.sql
```

Enter your password when prompted.

---

## Step 6: Update Environment Variables

Edit `.env.local` and ensure these settings:

```env
# AWS RDS Configuration
AWS_RDS_HOST=dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com
AWS_RDS_PORT=5432
AWS_RDS_DATABASE=dairy_management
AWS_RDS_USER=postgres
AWS_RDS_PASSWORD=<your-actual-password>

# Connection pool settings (optimized for development)
DATABASE_MAX_CONNECTIONS=20
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=10000

# SSL (not needed for development)
AWS_RDS_SSL=false

# Environment
NODE_ENV=development
```

---

## Step 7: Restart Development Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

You should now see successful database queries!

---

## Troubleshooting

### Still Getting Timeout?

#### Check 1: VPC Network ACLs
1. Go to VPC console: https://console.aws.amazon.com/vpc/
2. Click "Network ACLs"
3. Find the ACL for your RDS subnet
4. Ensure inbound/outbound rules allow port 5432

#### Check 2: Subnet Route Table
1. RDS must be in a subnet with internet gateway route
2. VPC console → Subnets → Check route table
3. Should have route: `0.0.0.0/0` → `igw-xxxxx`

#### Check 3: Your IP Changed
If you have dynamic IP, you may need to update the security group rule when your IP changes.

Run this to check current IP:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

#### Check 4: Database Running
1. AWS Console → RDS → Databases
2. Status should be **"Available"** (not "Stopped" or "Maintenance")

### Password Issues?

Reset password in AWS Console:
1. Select database → "Modify"
2. Under "Settings" → "New master password"
3. Save and apply immediately
4. Update `.env.local` with new password

---

## Security Best Practices for Production

⚠️ **For production deployment:**

1. **Don't make RDS publicly accessible**
2. **Deploy application on EC2/ECS in same VPC as RDS**
3. **Use private subnets for RDS**
4. **Security group should only allow traffic from application security group**
5. **Use AWS Secrets Manager for credentials**
6. **Enable SSL/TLS with certificate validation**

Example production security group:
- **Source:** `sg-app-server` (application security group)
- **NOT:** `0.0.0.0/0` or any public IP

---

## Quick Reference Commands

```powershell
# Test database connection
node scripts/test-db-connection.js

# Check your public IP
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Start development server
npm run dev

# Load database schema (if psql installed)
psql -h dairyproject.c4bcgmceqsoh.us-east-1.rds.amazonaws.com -U postgres -d dairy_management -f database-schema.sql
```

---

## Summary

**The main issue:** AWS RDS security group is blocking connections from your IP address.

**The fix:**
1. ✅ Add your IP to RDS security group inbound rules (port 5432)
2. ✅ Make RDS publicly accessible (for development only)
3. ✅ Load database schema
4. ✅ Update `.env.local` configuration
5. ✅ Restart dev server

After these steps, your application will successfully connect to AWS RDS! 🎉
