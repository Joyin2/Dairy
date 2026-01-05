# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Copy `.env.production` to your hosting platform
- [ ] Set all required environment variables
- [ ] Replace placeholder values with actual production credentials
- [ ] Use AWS Secrets Manager for sensitive data (recommended)
- [ ] Verify `NODE_ENV=production`
- [ ] Set production domain in `NEXT_PUBLIC_APP_URL`

### 2. Database Security

#### RDS Configuration
- [ ] **Disable public access** to RDS instance
- [ ] Use VPC peering or AWS PrivateLink
- [ ] Configure security groups to allow only application server IPs
- [ ] Enable **encryption at rest**
- [ ] Enable **automated backups** (7-35 days retention)
- [ ] Enable **Multi-AZ deployment** for high availability
- [ ] Configure **Enhanced Monitoring**
- [ ] Set up **CloudWatch alarms**

#### Database User Permissions
```sql
-- Create application user (don't use postgres superuser)
CREATE USER dairy_app WITH PASSWORD 'strong-password-here';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE dairy_management TO dairy_app;
GRANT USAGE ON SCHEMA public TO dairy_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dairy_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dairy_app;

-- Update .env to use dairy_app user
AWS_RDS_USER=dairy_app
```

### 3. Security Headers (Already Configured)

✅ Security headers configured in `next.config.ts`:
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options` (Clickjacking protection)
- `X-Content-Type-Options` (MIME sniffing protection)
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

### 4. SSL/TLS Configuration

- [ ] Obtain SSL certificate (Let's Encrypt, AWS Certificate Manager, etc.)
- [ ] Configure HTTPS on your hosting platform
- [ ] Enable HTTP to HTTPS redirect
- [ ] Update RDS SSL configuration (set `rejectUnauthorized: true`)

### 5. Performance Optimization

- [ ] Build the application: `npm run prod:build`
- [ ] Verify build size is reasonable
- [ ] Test production build locally: `npm run prod:start`
- [ ] Configure CDN for static assets (if using Vercel/AWS CloudFront)
- [ ] Enable gzip/brotli compression (already enabled)

### 6. Monitoring Setup

- [ ] Set up error tracking (Sentry, Datadog, etc.)
- [ ] Configure CloudWatch logs
- [ ] Set up uptime monitoring
- [ ] Create CloudWatch dashboards
- [ ] Configure alerts for:
  - High error rates
  - Database connection issues
  - High CPU/memory usage
  - Slow response times

---

## 🔐 Security Best Practices

### Application Level

1. **API Rate Limiting**
   - Implement rate limiting on API routes
   - Use Redis or in-memory store for rate limit tracking

2. **Input Validation**
   - Validate all user inputs
   - Use parameterized queries (already implemented)
   - Sanitize data before display

3. **Authentication & Authorization**
   - Implement proper authentication (NextAuth.js recommended)
   - Use JWT tokens with expiration
   - Implement role-based access control (RBAC)

4. **CORS Configuration**
   - Restrict CORS to your domain only
   - Don't use `*` in production

5. **Secrets Management**
   ```bash
   # Use AWS Secrets Manager
   aws secretsmanager create-secret \
     --name dairy-app/rds-credentials \
     --secret-string '{"username":"dairy_app","password":"your-password"}'
   ```

### Database Level

1. **Connection Security**
   - Use SSL/TLS for database connections
   - Rotate credentials regularly
   - Use IAM database authentication (AWS RDS)

2. **Backup Strategy**
   - Automated daily backups (enabled)
   - Test restore procedures monthly
   - Store backups in different region

3. **Monitoring**
   - Enable RDS Performance Insights
   - Monitor slow query log
   - Set up alerts for unusual activity

---

## 📦 Deployment Platforms

### Option 1: Vercel (Recommended for Quick Deploy)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# https://vercel.com/[your-team]/[your-project]/settings/environment-variables
```

**Important**: 
- Add Vercel IP ranges to RDS security group
- Or use Vercel's database connection pooling

### Option 2: AWS (ECS/Fargate)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name dairy-app
   ```

2. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS base
   
   # Dependencies
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Builder
   FROM base AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run prod:build
   
   # Runner
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT=3000
   
   CMD ["node", "server.js"]
   ```

3. **Deploy to ECS**
   - Create ECS cluster
   - Define task definition
   - Create service
   - Configure ALB (Application Load Balancer)

### Option 3: AWS Amplify

```bash
# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Option 4: Docker Compose (Self-hosted)

Already configured in the project. See Docker section below.

---

## 🐳 Docker Deployment

### Build and Run

```bash
# Build image
docker build -t dairy-app:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name dairy-app \
  dairy-app:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 🔍 Post-Deployment Verification

### 1. Health Checks

```bash
# Test application health
curl https://your-domain.com/api/health

# Test database connection
curl https://your-domain.com/api/health/db

# Check API endpoints
curl https://your-domain.com/api/shops
curl https://your-domain.com/api/suppliers
```

### 2. Performance Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Load test
ab -n 1000 -c 10 https://your-domain.com/
```

### 3. Security Scan

```bash
# Install OWASP ZAP or use online tools
# https://www.zaproxy.org/

# Check SSL configuration
# https://www.ssllabs.com/ssltest/
```

---

## 📊 Monitoring & Alerting

### CloudWatch Alarms

```bash
# CPU Utilization
aws cloudwatch put-metric-alarm \
  --alarm-name dairy-app-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

# Database Connections
aws cloudwatch put-metric-alarm \
  --alarm-name dairy-db-connections \
  --alarm-description "Alert on high database connections" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 40 \
  --comparison-operator GreaterThanThreshold
```

### Application Monitoring

Add to your application:

```typescript
// Health check endpoint
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}

// Database health check
// src/app/api/health/db/route.ts
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query('SELECT 1')
    return Response.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    return Response.json({ status: 'unhealthy', database: 'disconnected' }, { status: 503 })
  }
}
```

---

## 🔄 Database Migrations

### Manual Migration Process

```sql
-- 1. Backup current database
pg_dump -h your-rds-endpoint -U dairy_app dairy_management > backup_$(date +%Y%m%d).sql

-- 2. Run migration
psql -h your-rds-endpoint -U dairy_app -d dairy_management -f migrations/001_add_column.sql

-- 3. Verify migration
-- Check application logs and database state
```

### Using Migration Tools

```bash
# Install node-pg-migrate
npm install -D node-pg-migrate

# Create migration
npm run migrate create add-new-column

# Run migration
npm run migrate up
```

---

## 📝 Environment Variables Checklist

Required variables for production:

```bash
# Database
AWS_RDS_HOST=                    # RDS endpoint
AWS_RDS_PORT=5432
AWS_RDS_DATABASE=dairy_management
AWS_RDS_USER=dairy_app           # NOT postgres
AWS_RDS_PASSWORD=                # From Secrets Manager

# Connection Pool
DATABASE_MAX_CONNECTIONS=50
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=5000

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=             # Your domain
NEXT_PUBLIC_API_URL=             # Your API URL

# Security
NEXTAUTH_SECRET=                 # Generate: openssl rand -base64 32
NEXTAUTH_URL=                    # Your domain

# Optional
SENTRY_DSN=                      # Error tracking
NEW_RELIC_LICENSE_KEY=           # Performance monitoring
```

---

## 🚨 Incident Response

### Database Connection Issues

1. Check RDS status in AWS Console
2. Verify security group rules
3. Check connection pool exhaustion
4. Review CloudWatch logs
5. Scale up if needed

### High CPU/Memory

1. Check slow query log
2. Review recent deployments
3. Scale vertically (larger instance)
4. Add read replicas for read-heavy workload

### Application Errors

1. Check error tracking (Sentry)
2. Review application logs
3. Rollback if necessary
4. Apply hotfix and redeploy

---

## 📚 Additional Resources

- [AWS RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## ✅ Final Checklist

- [ ] All environment variables configured
- [ ] RDS security hardened
- [ ] SSL/TLS enabled
- [ ] Monitoring and alerting set up
- [ ] Backups verified
- [ ] Load testing completed
- [ ] Security scan performed
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Incident response plan documented
- [ ] Rollback plan tested

---

**Deployment Status**: ⏳ Pending Production Deployment

**Next Steps**:
1. Configure production environment variables
2. Harden RDS security (disable public access)
3. Deploy to chosen platform
4. Verify all health checks
5. Enable monitoring and alerts
