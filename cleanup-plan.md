# PineGenie Cleanup Plan for Vercel Deployment

## Files and Folders to Remove

### 1. Unnecessary Documentation Files
- `API_SETUP.md` - Outdated API setup documentation
- `project_structure.md` - Outdated project structure
- `SUBSCRIPTION_LIMITATIONS_SUMMARY.md` - Internal documentation
- `RENDER_DEPLOYMENT.md` - Render-specific deployment (we're using Vercel)
- `render.yaml` - Render configuration file
- `docs/` directory - Internal documentation not needed for deployment

### 2. Duplicate Configuration Files
- `next.config.ts` - Keep only `next.config.js`
- `tsconfig.tsbuildinfo` - Build cache file

### 3. Test and Development Files
- `test-scripts-api.js` - Test script
- `jest.config.js` - Jest configuration (if not using tests in production)
- `jest.setup.js` - Jest setup file

### 4. Unused Scripts
- `scripts/cleanup-plans.ts` - Cleanup script
- `scripts/cleanup-subscriptions.ts` - Cleanup script
- `scripts/create-demo-users.ts` - Demo user creation
- `scripts/create-test-user.ts` - Test user creation
- `scripts/verify-users.ts` - User verification script
- `scripts/check-subscriptions.ts` - Subscription check script
- `scripts/init-database.ps1` - PowerShell database init
- `scripts/init-database.sh` - Bash database init

### 5. Environment Files (Keep Templates Only)
- `.env` - Contains sensitive data
- `.env.local` - Local environment
- Keep: `.env.example`, `.env.local.template`, `.env.neon.example`

### 6. Build and Cache Directories
- `.next/` - Next.js build cache
- `.swc/` - SWC cache
- `node_modules/` - Dependencies (will be reinstalled)

## Dependencies to Review

### Potentially Unused Dependencies
- `@google-cloud/speech` - Google Cloud Speech (check if used)
- `microsoft-cognitiveservices-speech-sdk` - Microsoft Speech SDK (check if used)
- `aws-sdk` - AWS SDK (check if used)
- `@types/pg` - PostgreSQL types (if using Prisma only)
- `pg` - PostgreSQL driver (if using Prisma only)

### TailwindCSS Configuration Issues
- Current setup uses TailwindCSS v4 with PostCSS plugin
- Need to ensure compatibility with Vercel deployment

## Actions to Take

1. Remove unnecessary files and folders
2. Clean up package.json dependencies
3. Verify TailwindCSS configuration
4. Update .gitignore to prevent unnecessary files
5. Test build locally before deployment