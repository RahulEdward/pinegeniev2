# Project Structure

This document outlines the file and folder structure of the PineGenieV project.

## Root Directory

```
pinegeniev/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   │   └── system.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/
│   │   │       │   └── route.ts
│   │   │       └── register/
│   │   │           └── route.ts
│   │   ├── builder/
│   │   │   ├── data/
│   │   │   │   └── indicator-defs.ts
│   │   │   ├── nodes/
│   │   │   │   ├── IndicatorNode.tsx
│   │   │   │   ├── RSINode.tsx
│   │   │   │   ├── base-node.tsx
│   │   │   │   └── n8n-base-node.tsx
│   │   │   ├── ui/
│   │   │   │   ├── canvas.tsx
│   │   │   │   └── toolbar.tsx
│   │   │   ├── builder-state.ts
│   │   │   ├── canvas-config.ts
│   │   │   ├── export-pinescript.ts
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── page.tsx.bak
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthButton.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── landing/
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── Hero.tsx
│   │   │   └── TestimonialCard.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── ThemeToggle.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── styles/
│       └── custom.css
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.js
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── project_structure.md
├── README.md
└── tailwind.config.ts
```

## Key Files Explained

### Configuration Files
- `next.config.js` / `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Project dependencies and scripts
- `prisma/schema.prisma`: Database schema definition

### Authentication
- `src/lib/auth-options.ts`: NextAuth configuration
- `src/middleware.ts`: Authentication middleware
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route

### Core Application
- `src/app/layout.tsx`: Root layout component
- `src/app/page.tsx`: Home page
- `src/app/login/page.tsx`: Login page
- `src/app/register/page.tsx`: Registration page
- `src/app/dashboard/page.tsx`: User dashboard

### Builder Feature
- `src/app/builder/`: Visual strategy builder
  - `nodes/`: Node components for the builder
  - `ui/`: Builder interface components
  - `data/`: Data definitions and utilities

### Components
- `src/components/`: Reusable UI components
  - `ui/button.tsx`: Button component
  - `auth-nav.tsx`: Authentication navigation

### Utilities
- `src/lib/`: Core utilities
  - `prisma.ts`: Database client
  - `auth.ts`: Authentication utilities

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.
