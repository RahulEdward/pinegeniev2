# Next.js 14 Starter Template with Authentication

A modern, production-ready Next.js 14 starter template featuring authentication, protected routes, and a clean, responsive UI. Built with TypeScript, Tailwind CSS, and Prisma ORM.

## ✨ Features

- 🔒 **Authentication** - Email/Password authentication with NextAuth.js
- 🛡 **Protected Routes** - Middleware for route protection
- 🎨 **Modern UI** - Built with Tailwind CSS for beautiful, responsive designs
- 🗃 **Database** - Prisma ORM with SQLite (easily switchable to other databases)
- ⚡ **Fast Refresh** - Next.js 14 with App Router for optimal performance
- 🔄 **State Management** - Built-in React Context API
- 📱 **Fully Responsive** - Works on all device sizes

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RahulEdward/nextjs14_startertemplate.git
   cd nextjs14_startertemplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🛠 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/            # Authentication API routes
│   ├── dashboard/           # Protected dashboard routes
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
├── lib/                     # Utility functions and configs
│   ├── auth.ts              # Auth utilities
│   └── prisma.ts            # Prisma client
├── middleware.ts            # Authentication middleware
└── styles/                  # Global styles
```

## 🔧 Built With

- [Next.js 14](https://nextjs.org/) - The React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [NextAuth.js](https://next-auth.js.org/) - For authentication
- [Prisma](https://www.prisma.io/) - ORM for database
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📬 Contact

Rahul Edward - [@YourTwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/RahulEdward/nextjs14_startertemplate](https://github.com/RahulEdward/nextjs14_startertemplate)
