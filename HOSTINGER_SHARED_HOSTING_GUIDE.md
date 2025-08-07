# 🚀 PineGenie Hostinger Shared Hosting Deployment Guide

## 📋 Hostinger Dashboard se Deployment

Aapka Hostinger dashboard ready hai, ab step-by-step deployment karte hain:

## ⚠️ **Important Limitation**
Hostinger shared hosting mein **full Next.js app directly run nahi kar sakte**. Humein **static export** banana hoga.

## 🔧 **Step 1: Prepare Static Export**

### Local Machine Pe (Aapke Computer Pe):

```bash
# Next.js config update karo
```

**File: `next.config.js` update karo:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove server-side features for static export
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
```

### Static Build Banao:
```bash
# Dependencies install karo
npm install

# Static build banao
npm run build
```

## 🚨 **Problem: Database Features Won't Work**

Shared hosting mein **API routes** aur **database connections** work nahi karenge. Sirf **static pages** work karenge.

## 🎯 **Better Alternative Solutions:**

### **Option 1: Hostinger Cloud Hosting (Recommended)**
- Hostinger dashboard mein **"Websites"** section mein jao
- **"Cloud Hosting"** option dekho
- Ye Node.js support karta hai
- Monthly cost: ~$9-15

### **Option 2: Use Subdomain for Static Demo**
Sirf **visual builder** aur **frontend** deploy karo as demo:

## 📁 **Step 2: Hostinger File Manager Use Karo**

### Hostinger Dashboard Mein:

1. **"Websites"** section mein jao
2. **"Manage"** button click karo
3. **"File Manager"** open karo
4. **"public_html"** folder mein jao

### Upload Files:

1. **Local build folder** (`out` folder) ke contents copy karo
2. **File Manager** mein upload karo
3. **Extract** karo agar ZIP file hai

## 🔧 **Step 3: Database Alternative**

Since database direct connect nahi kar sakte, alternatives:

### **Option A: Use External API**
```javascript
// Use external database service
const API_BASE = 'https://your-api-service.com'

// Replace database calls with API calls
const fetchStrategies = async () => {
  const response = await fetch(`${API_BASE}/strategies`)
  return response.json()
}
```

### **Option B: Local Storage**
```javascript
// Store data in browser localStorage
const saveStrategy = (strategy) => {
  localStorage.setItem('strategies', JSON.stringify(strategy))
}

const getStrategies = () => {
  return JSON.parse(localStorage.getItem('strategies') || '[]')
}
```

## 🎯 **Recommended Approach: Hybrid Solution**

### **Frontend on Hostinger + Backend on Vercel**

1. **Static frontend** → Hostinger shared hosting
2. **API backend** → Vercel (free)
3. **Database** → Neon (free)

## 📋 **Step-by-Step Hybrid Deployment:**

### **Step 1: Separate Frontend & Backend**

**Create API-only version for Vercel:**
```bash
# Create new branch for API only
git checkout -b api-only

# Keep only API routes and remove pages
# Deploy this to Vercel
```

**Update frontend for static hosting:**
```javascript
// Update API calls to point to Vercel
const API_BASE = 'https://your-app.vercel.app'

// Replace all /api/ calls
fetch('/api/strategies') // Old
fetch(`${API_BASE}/api/strategies`) // New
```

### **Step 2: Deploy Backend to Vercel**
```bash
# Deploy API to Vercel
vercel --prod
```

### **Step 3: Deploy Frontend to Hostinger**
```bash
# Build static version
npm run build

# Upload 'out' folder to Hostinger public_html
```

## 🔧 **Hostinger File Manager Steps:**

### **Upload Process:**

1. **Hostinger Dashboard** → **Websites** → **Manage**
2. **File Manager** click karo
3. **public_html** folder open karo
4. **Upload** button click karo
5. **Select files** from your `out` folder
6. **Upload** karo
7. **Extract** karo (if ZIP)

### **File Structure:**
```
public_html/
├── index.html
├── _next/
├── assets/
├── favicon.ico
└── other static files
```

## 🌐 **Domain Setup:**

### **Using Hostinger Domain:**
1. **Domains** section mein jao
2. **Manage** click karo
3. **DNS Zone** mein jao
4. **A Record** add karo pointing to hosting IP

### **Access Your Site:**
- **Main domain**: `https://yourdomain.com`
- **Subdomain**: `https://pinegenie.yourdomain.com`

## ⚡ **Quick Demo Deployment (Static Only):**

Agar aap sirf **demo** deploy karna chahte hain:

### **Simplified Version:**
```bash
# Remove all API dependencies
# Keep only visual components
# Use mock data instead of database
# Build static version
npm run build
```

### **Mock Data Example:**
```javascript
// Replace database calls with mock data
const mockStrategies = [
  { id: 1, name: "RSI Strategy", code: "// Pine Script code here" },
  { id: 2, name: "MA Crossover", code: "// Pine Script code here" }
]

// Use mock data instead of API calls
const getStrategies = () => Promise.resolve(mockStrategies)
```

## 🎯 **Final Recommendation:**

### **Best Approach for You:**

1. **Deploy static demo** on Hostinger shared hosting
2. **Keep full app** on Vercel (free)
3. **Use Hostinger domain** to redirect to Vercel

### **Domain Redirect Setup:**
```html
<!-- In Hostinger public_html/index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=https://your-app.vercel.app">
    <title>Redirecting to PineGenie...</title>
</head>
<body>
    <p>Redirecting to PineGenie...</p>
</body>
</html>
```

## 📞 **Need Help?**

Agar aap chahte hain:
1. **Static demo** banau Hostinger ke liye
2. **Full app** Vercel pe deploy karu
3. **Domain redirect** setup karu

**Kya approach prefer karoge?** 🤔

- **Option A**: Static demo on Hostinger
- **Option B**: Full app on Vercel + domain redirect
- **Option C**: Hybrid (frontend Hostinger + backend Vercel)

**Batao kya karna hai!** 🚀