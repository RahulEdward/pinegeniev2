# PineGenieV - AI-Powered TradingView Strategy Builder

A modern, AI-powered visual builder for creating professional TradingView strategies without writing a single line of code. Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

## ✨ Features

- **Visual Strategy Builder**: Drag-and-drop interface to build complex trading strategies.
- **AI-Powered Generation**: Describe your strategy in natural language and let our AI generate the Pine Script code for you.
- **No-Code Solution**: Accessible to traders of all skill levels, no coding experience required.
- **Live Testing**: Integrated live chart testing powered by TradingView to validate your strategies.
- **Export to Pine Script v6**: Get clean, optimized, and production-ready Pine Script v6 code.
- **Authentication**: Secure user authentication with NextAuth.js.
- **Modern UI**: A clean, responsive, and intuitive user interface built with Tailwind CSS.
- **Theming**: Light and dark mode support.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RahulEdward/pinegeniev.git
   cd pinegeniev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory and add the necessary environment variables (e.g., `DATABASE_URL`, `NEXTAUTH_SECRET`).

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🛠 Project Structure

```
pinegeniev/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── ... (static assets)
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── builder/
│   │   ├── dashboard/
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── landing/
│   │   └── ui/
│   ├── lib/
│   └── styles/
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tailwind.config.ts
```

## 🔧 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Prisma](https://www.prisma.io/)
- **UI Components**: Custom components, shadcn/ui (implied)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📝 License

This project is licensed under the terms of the LICENSE file. See [LICENSE](LICENSE) for details.

## 📬 Contact

Rahul Edward

Project Link: [https://github.com/RahulEdward/pinegeniev](https://github.com/RahulEdward/pinegeniev)
