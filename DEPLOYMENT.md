# PineGenie Production Deployment Guide

## ✅ Build Status
- **Build Successful**: 34 static pages generated
- **All API routes**: Dynamic exports configured
- **Payment system**: Integrated with PayU
- **Authentication**: Google OAuth ready

## 🚀 Deployment Steps

### 1. Choose Your Platform
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### 2. Environment Variables Setup
Copy these variables to your production environment:

```env
# Database
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-database-url"

# NextAuth
NEXTAUTH_SECRET="generate-a-new-secure-secret"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# AI APIs
OPENAI_API_KEY="your-production-openai-key"
ANTHROPIC_API_KEY="your-production-anthropic-key"

# Admin
ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="your-secure-admin-password"

# PayU Payment
PAYU_MERCHANT_KEY="rQZie8"
PAYU_MERCHANT_SALT="pXR2MnRumAAcclHwipEEaBb7BLwtqPc"
PAYU_BASE_URL="https://secure.payu.in/_payment"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# Environment
NODE_ENV="production"
```

### 3. Database Migration
Run database migrations in production:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. PayU Configuration
Update PayU dashboard with production URLs:
- **Success URL**: `https://your-domain.com/payment/success`
- **Failure URL**: `https://your-domain.com/payment/failure`
- **Webhook URL**: `https://your-domain.com/api/payment/webhook/payu`

### 5. Google OAuth Setup
Update Google Cloud Console:
- **Authorized redirect URIs**: `https://your-domain.com/api/auth/callback/google`
- **Authorized JavaScript origins**: `https://your-domain.com`

### 6. Security Checklist
- [ ] Change NEXTAUTH_SECRET to a new secure value
- [ ] Update ADMIN_PASSWORD to a strong password
- [ ] Verify all API keys are production keys
- [ ] Enable HTTPS only
- [ ] Configure CORS if needed

## 🔧 Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all production environment variables

3. **Custom Domain**
   - Add your custom domain in Vercel Dashboard
   - Update NEXTAUTH_URL and NEXT_PUBLIC_BASE_URL

## 📊 Post-Deployment Verification

### Test These Features:
- [ ] User registration/login
- [ ] Google OAuth login
- [ ] Payment flow with PayU
- [ ] AI chat functionality
- [ ] Strategy builder
- [ ] Admin panel access
- [ ] Database connections

### Monitor These Metrics:
- [ ] Page load times
- [ ] API response times
- [ ] Payment success rates
- [ ] User registration rates
- [ ] Error rates

## 🛠️ Troubleshooting

### Common Issues:
1. **Database Connection**: Verify DATABASE_URL format
2. **OAuth Errors**: Check redirect URIs in Google Console
3. **Payment Errors**: Verify PayU credentials and URLs
4. **Build Errors**: Ensure all dependencies are installed

### Logs to Check:
- Vercel Function logs
- Database connection logs
- PayU webhook logs
- Authentication logs

## 📈 Performance Optimization

### Already Implemented:
- Static page generation (34 pages)
- Dynamic API routes
- Optimized images
- Code splitting

### Additional Optimizations:
- Enable Vercel Analytics
- Configure CDN caching
- Monitor Core Web Vitals
- Set up error tracking (Sentry)

## 🔒 Security Features

### Implemented:
- NextAuth.js authentication
- Admin middleware protection
- API route protection
- Environment variable security
- CSRF protection

### Additional Security:
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity

---

**Your PineGenie app is production-ready! 🎉**