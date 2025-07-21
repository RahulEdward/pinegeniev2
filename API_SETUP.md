# API Keys Setup Guide

## Getting Started Without API Keys

Your PineGenie AI system is currently running in **Demo Mode** with mock responses. This allows you to:

- ✅ Test the admin dashboard
- ✅ See the chat interface
- ✅ Manage AI models
- ✅ View system metrics
- ✅ Experience the full UI/UX

## When You're Ready to Add Real AI

### 1. Get OpenAI API Key (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-...`)

**Models Available:**
- GPT-4 (Most capable)
- GPT-4 Turbo (Faster, cheaper)
- GPT-3.5 Turbo (Fast, cost-effective)

### 2. Get Anthropic API Key (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

**Models Available:**
- Claude 3 Opus (Most powerful)
- Claude 3 Sonnet (Balanced)
- Claude 3 Haiku (Fastest)

### 3. Add Keys to Your Project

Create or update your `.env.local` file:

```bash
# Database (already configured)
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret"
NEXTAUTH_URL="http://localhost:3000"

# Add these API keys
OPENAI_API_KEY="sk-your-openai-key-here"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key-here"
```

### 4. Restart Your Application

```bash
npm run dev
```

## Cost Considerations

### OpenAI Pricing (approximate)
- GPT-4: $0.03 per 1K tokens
- GPT-4 Turbo: $0.01 per 1K tokens  
- GPT-3.5 Turbo: $0.002 per 1K tokens

### Anthropic Pricing (approximate)
- Claude 3 Opus: $0.015 per 1K tokens
- Claude 3 Sonnet: $0.003 per 1K tokens
- Claude 3 Haiku: $0.00025 per 1K tokens

## Demo Mode Features

While in demo mode, you can:

1. **Admin Dashboard**: View metrics, manage models, see system status
2. **Model Management**: Add, edit, activate/deactivate models
3. **Chat Interface**: Test the UI with realistic mock responses
4. **User Management**: See how the admin system works

## What Changes When You Add API Keys

- ✅ Real AI responses instead of mock responses
- ✅ Actual conversation intelligence
- ✅ Pine Script code generation
- ✅ Trading strategy assistance
- ✅ Technical analysis help

## Testing the Demo

Try these sample questions in the chat:

1. "Hello, how can you help me?"
2. "Create a simple Pine Script strategy"
3. "Explain RSI indicator"
4. "Help me with moving averages"

The system will respond with realistic demo content showing what the real AI would provide.

## Need Help?

The demo mode is perfect for:
- Testing the system architecture
- Showing the interface to stakeholders
- Understanding the user flow
- Planning your AI strategy

When you're ready to go live with real AI, just add the API keys and restart!