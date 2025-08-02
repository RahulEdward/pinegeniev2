# 🚀 PineGenie - AI-Powered TradingView Strategy Builder

<div align="center">

![PineGenie Logo](https://img.shields.io/badge/PineGenie-AI%20Trading%20Platform-blue?style=for-the-badge&logo=tradingview)

**The most advanced no-code platform for creating professional TradingView strategies**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0+-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

[🎯 Live Demo](https://pinegenie.com) • [📖 Documentation](https://docs.pinegenie.com) • [🐛 Report Bug](https://github.com/RahulEdward/pinegeniev/issues) • [✨ Request Feature](https://github.com/RahulEdward/pinegeniev/issues)

</div>

---

## 🌟 Overview

PineGenie revolutionizes trading strategy development by combining the power of AI with an intuitive visual builder. Create sophisticated TradingView strategies without writing a single line of code, powered by cutting-edge AI models and a drag-and-drop interface.

### 🎯 Key Highlights

- **🤖 Multi-AI Integration**: Powered by GPT-4, Claude, and Google Gemini
- **🎨 Visual Strategy Builder**: Drag-and-drop interface with 50+ technical indicators
- **📊 Real-time Backtesting**: Integrated TradingView charts for live strategy validation
- **⚡ Zero-Error Code Generation**: Production-ready Pine Script v6 output
- **🌐 Professional UI**: Claude-style interface with responsive design
- **🔐 Enterprise Security**: Secure authentication and data protection

---

## ✨ Core Features

### 🎨 **Visual Strategy Builder**
- **Drag & Drop Interface**: Build complex strategies visually
- **50+ Technical Indicators**: RSI, MACD, Bollinger Bands, and more
- **Custom Logic Nodes**: Advanced conditions and risk management
- **Real-time Validation**: Instant feedback on strategy logic

### 🤖 **AI-Powered Generation**
- **Natural Language Processing**: Describe strategies in plain English
- **Multi-Model Support**: Choose from 5 AI models for optimal results
- **Smart Code Optimization**: AI-enhanced Pine Script generation
- **Context-Aware Suggestions**: Intelligent strategy recommendations

### 📊 **Advanced Analytics**
- **Performance Metrics**: Comprehensive strategy analysis
- **Backtesting Engine**: Historical performance validation
- **Risk Assessment**: Automated risk management evaluation
- **Export Capabilities**: Multiple output formats (TXT, HTML, CSV)

### 🎯 **Professional Tools**
- **Template Library**: 6+ pre-built strategy templates
- **Version Control**: Strategy versioning and rollback
- **Collaboration**: Team-based strategy development
- **API Integration**: Seamless TradingView connectivity

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git
```

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

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Configure your environment variables
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 15.3.5 | Full-stack React framework |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS framework |
| **Database** | Prisma | 5.0+ | Type-safe database ORM |
| **Authentication** | NextAuth.js | 4.0+ | Secure authentication |
| **AI Integration** | OpenAI, Anthropic, Google AI | Latest | Multi-model AI support |
| **UI Components** | Custom + Shadcn/ui | Latest | Professional UI components |
| **State Management** | Zustand | 4.0+ | Lightweight state management |

### Project Structure

```
pinegeniev/
├── 📁 prisma/                 # Database schema and migrations
├── 📁 public/                 # Static assets
├── 📁 src/
│   ├── 📁 app/                # Next.js app router
│   │   ├── 📁 ai-chat/        # AI chat interface
│   │   ├── 📁 api/            # API routes
│   │   ├── 📁 builder/        # Visual strategy builder
│   │   └── 📁 dashboard/      # User dashboard
│   ├── 📁 agents/             # AI agent configurations
│   ├── 📁 components/         # Reusable UI components
│   └── 📁 lib/                # Utility functions
├── 📄 .env.example           # Environment variables template
├── 📄 next.config.js         # Next.js configuration
└── 📄 tailwind.config.ts     # Tailwind CSS configuration
```

---

## 🎯 Usage Examples

### Creating Your First Strategy

1. **Access the Builder**
   ```
   Navigate to /builder
   ```

2. **Choose Your Approach**
   - 🎨 **Visual Builder**: Drag and drop components
   - 🤖 **AI Generation**: Describe your strategy in natural language
   - 📚 **Templates**: Start with pre-built strategies

3. **Configure Parameters**
   - Set entry/exit conditions
   - Define risk management rules
   - Add technical indicators

4. **Test & Export**
   - Backtest on historical data
   - Export to Pine Script v6
   - Deploy to TradingView

### AI Chat Interface

```typescript
// Example: Generate a strategy using natural language
"Create a momentum strategy using RSI and MACD crossovers 
with 2% stop loss and 1:3 risk-reward ratio"
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="your_database_url"

# Authentication
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# AI API Keys
OPENAI_API_KEY="your_openai_key"
ANTHROPIC_API_KEY="your_anthropic_key"
GOOGLE_AI_API_KEY="your_google_ai_key"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  strategies Strategy[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Strategy {
  id          String   @id @default(cuid())
  name        String
  description String?
  pineScript  String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

---

## 📊 Performance & Analytics

- **Build Time**: < 30 seconds
- **Page Load Speed**: < 2 seconds
- **Bundle Size**: Optimized for performance
- **SEO Score**: 100/100
- **Accessibility**: WCAG 2.1 AA compliant

---

## 🛡️ Security

- **Authentication**: Secure JWT-based authentication
- **Data Protection**: Encrypted data storage
- **API Security**: Rate limiting and input validation
- **HTTPS**: SSL/TLS encryption
- **Privacy**: GDPR compliant

---

## 📈 Roadmap

- [ ] **Q1 2024**: Mobile app development
- [ ] **Q2 2024**: Advanced backtesting engine
- [ ] **Q3 2024**: Social trading features
- [ ] **Q4 2024**: Institutional features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **TradingView** for Pine Script documentation
- **OpenAI** for GPT-4 API
- **Anthropic** for Claude API
- **Google** for Gemini API
- **Vercel** for hosting platform

---

## 📞 Support & Contact

<div align="center">

**Need help? We're here for you!**

[![Email](https://img.shields.io/badge/Email-support%40pinegenie.com-red?style=for-the-badge&logo=gmail)](mailto:support@pinegenie.com)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-7289da?style=for-the-badge&logo=discord)](https://discord.gg/pinegenie)
[![Twitter](https://img.shields.io/badge/Twitter-Follow%20Us-1da1f2?style=for-the-badge&logo=twitter)](https://twitter.com/pinegenie)

**⭐ Star us on GitHub if you find PineGenie helpful!**

</div>

---

<div align="center">
  <sub>Built with ❤️ by the PineGenie Team</sub>
</div>