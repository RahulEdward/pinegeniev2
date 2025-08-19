# 🛡️ PineGenie Development Guidelines

## Safe Development Practices

### Before Making Changes

1. **Always create a backup:**
   ```bash
   npm run backup
   # or
   git checkout -b backup-$(date +%Y%m%d-%H%M%S)
   ```

2. **Use safe development mode:**
   ```bash
   npm run safe-dev
   ```

3. **Check current status:**
   ```bash
   git status
   git log --oneline -5
   ```

### During Development

1. **Commit frequently with meaningful messages:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

2. **Test before committing:**
   ```bash
   npm run build
   npm run lint
   ```

3. **Use feature branches for major changes:**
   ```bash
   git checkout -b feature/new-feature
   ```

### Emergency Recovery

If something breaks:

1. **Quick restore:**
   ```bash
   npm run restore-last
   ```

2. **Emergency recovery tool:**
   ```bash
   node scripts/emergency-recovery.js
   ```

3. **Manual restore to specific commit:**
   ```bash
   git log --oneline -10  # Find the commit hash
   git reset --hard <commit-hash>
   ```

### Protected Files

Never directly edit these files without backup:
- `src/app/page.tsx` (Main landing page)
- `src/app/layout.tsx` (Root layout)
- `src/app/builder/` (Visual builder components)
- `package.json` (Dependencies)

### Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `style:` - UI/styling changes
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `test:` - Testing
- `chore:` - Maintenance

### Branch Strategy

- `main` - Stable, working code
- `development` - Active development
- `feature/*` - New features
- `fix/*` - Bug fixes
- `backup-*` - Automatic backups

## Emergency Contacts

If you need help:
1. Check this document
2. Use emergency recovery script
3. Restore to last working commit
4. Ask for help with specific error messages

## Quick Commands

```bash
# Safe development
npm run safe-dev

# Create backup
npm run backup

# Emergency recovery
node scripts/emergency-recovery.js

# Restore last commit
npm run restore-last

# Check app health
npm run build && npm run lint
```