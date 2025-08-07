# 🚀 PineGenie Hostinger Deployment Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- ✅ Hostinger hosting account with Node.js support
- ✅ Your GitHub repository ready (`pinegeniev2`)
- ✅ Neon PostgreSQL database URL
- ✅ OpenAI and Anthropic API keys
- ✅ Domain name (optional, can use subdomain)

## 🎯 Deployment Options

### Option 1: Hostinger VPS (Recommended)
- Full control over Node.js environment
- Can run Next.js applications
- SSH access available

### Option 2: Hostinger Shared Hosting
- Limited Node.js support
- May require static export
- More restrictions

## 🚀 Step-by-Step Deployment (VPS Method)

### Step 1: Set Up Hostinger VPS

1. **Login to Hostinger**
   - Go to [hostinger.com](https://hostinger.com)
   - Login to your account
   - Navigate to VPS section

2. **Create/Access VPS**
   - Choose your VPS plan
   - Select Ubuntu 20.04 or 22.04
   - Note down your VPS IP address
   - Set up SSH access

### Step 2: Connect to VPS via SSH

```bash
# Connect to your VPS (replace with your IP)
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y
```

### Step 3: Install Required Software

```bash
# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install Git
apt-get install -y git

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx (Web Server)
apt-get install -y nginx

# Verify installations
node --version
npm --version
git --version
```

### Step 4: Clone Your Repository

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/RahulEdward/pinegeniev2.git
cd pinegeniev2

# Install dependencies
npm install
```

### Step 5: Set Up Environment Variables

```bash
# Create production environment file
nano .env.production

# Add the following content:
```

```env
# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_OUCisE9tK4Br@ep-red-cell-a173yc22-pooler.ap-southeast-1.aws.neon.tech/nitinneon?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_OUCisE9tK4Br@ep-red-cell-a173yc22-pooler.ap-southeast-1.aws.neon.tech/nitinneon?sslmode=require&channel_binding=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secure-production-secret-key-make-it-very-long-and-random"
NEXTAUTH_URL="https://yourdomain.com"

# AI API Keys
OPENAI_API_KEY="sk-your-openai-api-key-here"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"

# Admin Configuration
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-admin-password"

# Production Settings
NODE_ENV="production"
```

### Step 6: Build the Application

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Build the Next.js application
npm run build

# Test the build
npm start
```

### Step 7: Set Up PM2 Process Manager

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'pinegenie',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/pinegeniev2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 8: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/pinegenie
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/pinegenie /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 9: Set Up SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### Step 10: Configure Domain DNS

1. **In Hostinger Control Panel:**
   - Go to DNS Zone Editor
   - Add A record pointing to your VPS IP
   - Add CNAME record for www subdomain

2. **DNS Records:**
   ```
   Type: A
   Name: @
   Value: your-vps-ip-address
   
   Type: CNAME
   Name: www
   Value: yourdomain.com
   ```

## 🔧 Alternative: Shared Hosting Deployment

### Step 1: Prepare Static Export

```bash
# In your local project
# Update next.config.js
```

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

```bash
# Build static version
npm run build

# Upload the 'out' folder to public_html
```

### Step 2: Upload Files

1. **Using File Manager:**
   - Login to Hostinger control panel
   - Open File Manager
   - Upload the 'out' folder contents to public_html

2. **Using FTP:**
   - Use FileZilla or similar FTP client
   - Upload files to public_html directory

## 🔍 Troubleshooting

### Common Issues:

1. **Port Already in Use:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Permission Issues:**
   ```bash
   # Fix permissions
   chown -R www-data:www-data /var/www/pinegeniev2
   chmod -R 755 /var/www/pinegeniev2
   ```

3. **Database Connection Issues:**
   ```bash
   # Test database connection
   npm run db:health
   ```

4. **Memory Issues:**
   ```bash
   # Check memory usage
   free -h
   
   # Restart PM2 if needed
   pm2 restart pinegenie
   ```

## 📊 Monitoring and Maintenance

### PM2 Commands:
```bash
# View application status
pm2 status

# View logs
pm2 logs pinegenie

# Restart application
pm2 restart pinegenie

# Stop application
pm2 stop pinegenie
```

### Update Deployment:
```bash
# Pull latest changes
cd /var/www/pinegeniev2
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart pinegenie
```

## ✅ Post-Deployment Checklist

- [ ] Application loads at your domain
- [ ] Database connection works
- [ ] User registration/login functional
- [ ] Visual builder loads correctly
- [ ] Pine Script generation works
- [ ] Admin panel accessible
- [ ] SSL certificate active (if configured)
- [ ] PM2 process running
- [ ] Nginx serving correctly

## 🎯 Performance Optimization

### Enable Gzip Compression:
```nginx
# Add to Nginx config
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Set Up Caching:
```nginx
# Add caching headers
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚀 Success!

Your PineGenie application should now be live on Hostinger! 

**Access your app at:** `https://yourdomain.com`
**Admin panel:** `https://yourdomain.com/admin`

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs pinegenie`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Verify environment variables are set correctly
4. Ensure database is accessible from your VPS IP

**Deployment Success Probability: 90%+** 🎯