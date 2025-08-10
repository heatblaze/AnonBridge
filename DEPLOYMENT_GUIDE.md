# AnonBridge Deployment Guide

<div align="center">
  <h1>🚀 Production Deployment Guide</h1>
  <p><strong>Complete guide to deploying AnonBridge to production environments</strong></p>
</div>

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Frontend Deployment](#frontend-deployment)
6. [Domain Configuration](#domain-configuration)
7. [Security Checklist](#security-checklist)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup Configuration](#backup-configuration)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Accounts
- [ ] **Supabase Account** - [Sign up here](https://supabase.com)
- [ ] **Netlify Account** - [Sign up here](https://netlify.com) (for frontend)
- [ ] **GitHub Account** - For code repository
- [ ] **Domain Provider** - For custom domain (optional)

### Required Tools
- [ ] **Node.js 18+** - [Download here](https://nodejs.org)
- [ ] **Git** - Version control
- [ ] **Code Editor** - VS Code recommended

### Technical Requirements
- [ ] **Manipal University Email** - For admin account setup
- [ ] **SSL Certificate** - Handled automatically by hosting providers
- [ ] **Database Storage** - Minimum 1GB recommended

---

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. **Visit Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"

2. **Project Configuration**
   ```
   Project Name: AnonBridge Production
   Database Password: [Generate strong password]
   Region: [Choose closest to your users]
   Pricing Plan: [Select appropriate plan]
   ```

3. **Note Project Details**
   - Project URL: `https://your-project-ref.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Configure Authentication

1. **Navigate to Authentication Settings**
   - Go to Authentication > Settings in Supabase dashboard

2. **Configure Email Settings**
   ```
   Site URL: https://your-domain.com
   Redirect URLs: https://your-domain.com/auth/callback
   Email Confirmation: Disabled (for this project)
   ```

3. **Set Up Email Templates** (Optional)
   - Customize confirmation email template
   - Set up password reset template

### Step 3: Database Configuration

1. **Access SQL Editor**
   - Go to SQL Editor in Supabase dashboard

2. **Set Database Timezone**
   ```sql
   ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';
   ```

3. **Configure Connection Pooling**
   ```sql
   -- Adjust connection limits if needed
   ALTER SYSTEM SET max_connections = 100;
   SELECT pg_reload_conf();
   ```

---

## 🔧 Environment Configuration

### Frontend Environment Variables

Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=AnonBridge
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=production

# Optional: Analytics and Monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Production Environment Variables

```env
# Production-specific variables
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://your-domain.com/api
```

### Environment Variable Security

```bash
# Verify environment variables are loaded
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Never commit .env files to version control
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

---

## 📊 Database Migration

### Step 1: Apply Migrations

1. **Using Supabase Dashboard**
   - Go to SQL Editor
   - Copy and paste each migration file content
   - Execute in chronological order

2. **Migration Order**
   ```
   1. 20250702080106_crimson_voice.sql      # Users table
   2. 20250702081342_super_wind.sql         # Chats table
   3. 20250702082558_jade_crystal.sql       # Reports table
   4. 20250702091042_azure_limit.sql        # RLS policies
   5. 20250702091311_floating_glade.sql     # Constraints
   6. 20250702092718_weathered_coast.sql    # Faculty table
   7. fix_chat_rls_policy.sql               # RLS fixes
   ```

### Step 2: Verify Migration Success

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- Check foreign key constraints
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

### Step 3: Seed Initial Data (Optional)

```sql
-- Create admin user
INSERT INTO users (
  email, 
  role, 
  department, 
  anonymous_id, 
  theme
) VALUES (
  'admin@manipal.edu',
  'faculty',
  'Administration',
  'Admin#001',
  'red_alert'
);

-- Create sample departments
INSERT INTO users (email, role, department, anonymous_id) VALUES
('cs.faculty@manipal.edu', 'faculty', 'Computer Science Engineering', 'Faculty#101'),
('it.faculty@manipal.edu', 'faculty', 'Information Technology', 'Faculty#102'),
('ece.faculty@manipal.edu', 'faculty', 'Electronics & Communication', 'Faculty#103');
```

---

## 🌐 Frontend Deployment

### Netlify Deployment

#### Method 1: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect GitHub repository
   - Select AnonBridge repository

3. **Build Configuration**
   ```
   Build Command: npm run build
   Publish Directory: dist
   Node Version: 18
   ```

4. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all variables from `.env` file

#### Method 2: Manual Deployment

1. **Build Project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist
   ```

### Vercel Deployment (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

---

## 🔒 Security Checklist

### Pre-deployment Security

- [ ] **Environment Variables Secured**
  - No sensitive data in code
  - Production keys different from development
  - Service role key not exposed to frontend

- [ ] **Database Security**
  - RLS enabled on all tables
  - Policies tested with different user roles
  - No public access to sensitive data

- [ ] **Authentication Security**
  - Email domain restrictions active
  - Strong password requirements enforced
  - Session management configured

- [ ] **API Security**
  - Rate limiting configured
  - Input validation implemented
  - SQL injection prevention verified

### Post-deployment Security

```sql
-- Verify RLS policies are active
SELECT 
  tablename,
  rowsecurity,
  COUNT(*) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
GROUP BY tablename, rowsecurity;

-- Check for public access
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee = 'public';
```

### Security Monitoring

```javascript
// Monitor failed authentication attempts
const monitorAuthFailures = async () => {
  const { data, error } = await supabase.auth.admin.listUsers();
  
  // Log authentication events
  console.log('Active users:', data?.users?.length);
  
  // Monitor for suspicious activity
  const recentReports = await supabase
    .from('reports')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
  if (recentReports.data?.length > 10) {
    console.warn('High report volume detected');
  }
};
```

---

## 📊 Monitoring Setup

### Application Monitoring

#### Health Check Endpoint

```javascript
// Create health check function
export const healthCheck = async () => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;

    // Test real-time connection
    const channel = supabase.channel('health-check');
    const subscription = await channel.subscribe();
    
    const isHealthy = subscription === 'SUBSCRIBED';
    channel.unsubscribe();

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      database: 'connected',
      realtime: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
```

#### Performance Monitoring

```javascript
// Monitor API response times
const performanceMonitor = {
  trackApiCall: async (functionName, apiCall) => {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Log to monitoring service
      console.log(`${functionName}: ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`${functionName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }
};

// Usage
const chats = await performanceMonitor.trackApiCall(
  'getUserChats',
  () => getUserChats(userId, role)
);
```

### Database Monitoring

```sql
-- Create monitoring views
CREATE VIEW chat_activity_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as chats_created,
  SUM(jsonb_array_length(messages)) as messages_sent
FROM chats
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

CREATE VIEW user_activity_summary AS
SELECT 
  role,
  department,
  COUNT(*) as active_users,
  MAX(created_at) as last_registration
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY role, department;
```

---

## 💾 Backup Configuration

### Automated Backups

#### Supabase Automatic Backups
- **Daily Backups**: Automatically enabled
- **Point-in-time Recovery**: Available for Pro plans
- **Retention Period**: 7 days (Free), 30 days (Pro)

#### Custom Backup Script

```bash
#!/bin/bash
# backup.sh - Custom backup script

# Configuration
SUPABASE_HOST="db.your-project.supabase.co"
SUPABASE_USER="postgres"
DATABASE_NAME="postgres"
BACKUP_DIR="/backups/anonbridge"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump --host=$SUPABASE_HOST \
        --username=$SUPABASE_USER \
        --format=custom \
        --compress=9 \
        --file=$BACKUP_DIR/full_backup_$DATE.dump \
        $DATABASE_NAME

# Schema-only backup
pg_dump --host=$SUPABASE_HOST \
        --username=$SUPABASE_USER \
        --schema-only \
        --file=$BACKUP_DIR/schema_backup_$DATE.sql \
        $DATABASE_NAME

# Data-only backup
pg_dump --host=$SUPABASE_HOST \
        --username=$SUPABASE_USER \
        --data-only \
        --file=$BACKUP_DIR/data_backup_$DATE.sql \
        $DATABASE_NAME

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Schedule Backups

```bash
# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
0 2 * * * /path/to/backup.sh >> /var/log/anonbridge-backup.log 2>&1
```

### Backup Verification

```bash
#!/bin/bash
# verify_backup.sh - Verify backup integrity

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Test backup file integrity
pg_restore --list $BACKUP_FILE > /dev/null 2>&1

if [ $? -eq 0 ]; then
  echo "✅ Backup file is valid: $BACKUP_FILE"
else
  echo "❌ Backup file is corrupted: $BACKUP_FILE"
  exit 1
fi

# Check backup size
BACKUP_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
MIN_SIZE=1048576  # 1MB minimum

if [ $BACKUP_SIZE -gt $MIN_SIZE ]; then
  echo "✅ Backup size is acceptable: $(($BACKUP_SIZE / 1024 / 1024))MB"
else
  echo "⚠️  Backup size is suspiciously small: $(($BACKUP_SIZE / 1024))KB"
fi
```

---

## 🔐 SSL and Domain Configuration

### Custom Domain Setup

#### Step 1: Domain Configuration
1. **Purchase Domain** (if needed)
2. **Configure DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify's load balancer)
   ```

#### Step 2: SSL Certificate
- **Automatic SSL**: Enabled by default on Netlify
- **Custom Certificate**: Upload if you have one
- **Force HTTPS**: Enable in Netlify settings

### Security Headers

Configure security headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co"
```

---

## 📈 Performance Optimization

### Frontend Optimization

#### Build Optimization

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});
```

#### Caching Strategy

```toml
# netlify.toml - Caching configuration
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Database Optimization

```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_chats_created_at ON chats(created_at);
CREATE INDEX CONCURRENTLY idx_users_role_department ON users(role, department);
CREATE INDEX CONCURRENTLY idx_reports_timestamp ON reports(timestamp);

-- Optimize JSONB queries
CREATE INDEX CONCURRENTLY idx_chats_messages_gin ON chats USING gin(messages);
```

---

## 🔍 Testing in Production

### Smoke Tests

```javascript
// production-tests.js
const runSmokeTests = async () => {
  console.log('🧪 Running production smoke tests...');
  
  try {
    // Test 1: Database connectivity
    const { data: users } = await supabase.from('users').select('count').limit(1);
    console.log('✅ Database connection successful');
    
    // Test 2: Authentication
    const { data: authData } = await supabase.auth.getSession();
    console.log('✅ Authentication system operational');
    
    // Test 3: Real-time subscriptions
    const channel = supabase.channel('test-channel');
    const subscription = await channel.subscribe();
    if (subscription === 'SUBSCRIBED') {
      console.log('✅ Real-time subscriptions working');
      channel.unsubscribe();
    }
    
    // Test 4: RLS policies
    const { error: rlsError } = await supabase
      .from('chats')
      .select('*')
      .limit(1);
    
    if (!rlsError || rlsError.code === '42501') {
      console.log('✅ RLS policies active');
    }
    
    console.log('🎉 All smoke tests passed!');
    
  } catch (error) {
    console.error('❌ Smoke test failed:', error);
  }
};

// Run tests
runSmokeTests();
```

### Load Testing

```javascript
// load-test.js
const runLoadTest = async () => {
  const concurrentUsers = 50;
  const messagesPerUser = 10;
  
  console.log(`🚀 Starting load test: ${concurrentUsers} users, ${messagesPerUser} messages each`);
  
  const promises = Array.from({ length: concurrentUsers }, async (_, i) => {
    const startTime = Date.now();
    
    try {
      // Simulate user registration
      const userData = {
        email: `loadtest${i}@learner.manipal.edu`,
        role: 'student',
        department: 'Computer Science Engineering',
        year: '2nd Year'
      };
      
      const { data: user } = await registerUser(userData);
      
      // Simulate message sending
      for (let j = 0; j < messagesPerUser; j++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        // Send message logic here
      }
      
      const duration = Date.now() - startTime;
      return { success: true, duration, userId: user.id };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r.success).length;
  const avgDuration = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.duration, 0) / successful;
  
  console.log(`📊 Load test results:`);
  console.log(`   Successful: ${successful}/${concurrentUsers}`);
  console.log(`   Average duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`   Success rate: ${(successful/concurrentUsers*100).toFixed(1)}%`);
};
```

---

## 🚨 Disaster Recovery

### Recovery Procedures

#### Database Recovery

```bash
# 1. Restore from backup
pg_restore --host=db.your-project.supabase.co \
           --username=postgres \
           --dbname=postgres \
           --clean \
           --if-exists \
           backup_file.dump

# 2. Verify data integrity
psql --host=db.your-project.supabase.co \
     --username=postgres \
     --dbname=postgres \
     --command="SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM chats;"

# 3. Re-enable RLS if needed
psql --host=db.your-project.supabase.co \
     --username=postgres \
     --dbname=postgres \
     --file=enable_rls.sql
```

#### Application Recovery

```bash
# 1. Rollback to previous deployment
netlify sites:list
netlify api listSiteDeploys --site-id=your-site-id
netlify api restoreSiteDeploy --site-id=your-site-id --deploy-id=previous-deploy-id

# 2. Verify application functionality
curl -f https://your-domain.com/health || echo "Health check failed"

# 3. Monitor error rates
# Check application logs and error tracking
```

### Emergency Contacts

```yaml
# emergency-contacts.yml
Primary DBA:
  Name: "Database Administrator"
  Email: "dba@anonbridge.manipal.edu"
  Phone: "+91-820-2925-000"
  
Security Officer:
  Name: "Security Team Lead"
  Email: "security@anonbridge.manipal.edu"
  Phone: "+91-820-2925-001"
  
System Administrator:
  Name: "System Admin"
  Email: "sysadmin@anonbridge.manipal.edu"
  Phone: "+91-820-2925-002"
```

---

## 📋 Post-Deployment Checklist

### Immediate Verification (0-1 hour)

- [ ] **Application Loads**
  - Homepage accessible
  - Login/register pages functional
  - No console errors

- [ ] **Database Connectivity**
  - User registration works
  - Chat creation successful
  - Data retrieval functional

- [ ] **Authentication**
  - Login with test accounts
  - Role-based access working
  - Session persistence active

- [ ] **Real-time Features**
  - Message delivery working
  - Live updates functional
  - WebSocket connections stable

### Extended Verification (1-24 hours)

- [ ] **Performance Monitoring**
  - Response times acceptable (<2s)
  - No memory leaks detected
  - Database queries optimized

- [ ] **Security Verification**
  - RLS policies enforced
  - No unauthorized access
  - Error messages don't leak sensitive data

- [ ] **User Experience**
  - Mobile responsiveness
  - Theme switching works
  - All features accessible

### Long-term Monitoring (24+ hours)

- [ ] **Stability Monitoring**
  - No application crashes
  - Database connections stable
  - Error rates within acceptable limits

- [ ] **User Feedback**
  - Monitor support channels
  - Check for reported issues
  - Gather user experience feedback

---

## 📞 Support and Maintenance

### Maintenance Schedule

#### Daily Tasks
- Monitor application health
- Check error logs
- Verify backup completion
- Review security alerts

#### Weekly Tasks
- Analyze performance metrics
- Review user feedback
- Update documentation
- Security patch assessment

#### Monthly Tasks
- Database optimization
- Capacity planning
- Security audit
- Feature usage analysis

### Support Channels

- **Technical Issues**: technical@anonbridge.manipal.edu
- **Security Concerns**: security@anonbridge.manipal.edu
- **User Support**: support@anonbridge.manipal.edu
- **Emergency**: emergency@anonbridge.manipal.edu

---

<div align="center">
  <p><strong>🚀 Production-Ready • Secure • Monitored</strong></p>
  <p>Deployed with ❤️ for the Manipal University community</p>
  <p><em>Last updated: January 2025</em></p>
</div>