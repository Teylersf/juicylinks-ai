# 🔗 Juicy Links

<div align="center">

![Juicy Links Logo](https://img.shields.io/badge/AI%20SEO-Juicy%20Links-blue?style=for-the-badge&logo=openai)

**The Future of Search is AI - Get Recommended by Tomorrow's Dominant Platforms**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-18.5.0-635BFF?style=flat&logo=stripe)](https://stripe.com/)

[🚀 Live Demo](https://juicylinks.com) • [📖 Documentation](https://docs.juicylinks.com) • [💬 Support](https://juicylinks.com/contact)

</div>

---

## 🌟 What is Juicy Links?

Juicy Links is a revolutionary **AI SEO platform** that ensures your business gets recommended by AI models like ChatGPT, Claude, Gemini, Grok, and Perplexity. As traditional search engines give way to AI-powered recommendations, we help businesses stay ahead by getting included in AI model training data.

### 🎯 The Problem We Solve

- **AI is replacing traditional search** - Users increasingly ask AI for recommendations instead of using Google
- **Businesses are invisible to AI** - Most companies aren't included in AI training data
- **Future-proofing is critical** - The shift to AI-powered search is accelerating

### ✨ Our Solution

We automatically submit carefully crafted prompts about your business to **22 AI models across 5 major platforms** daily, ensuring your business information becomes part of their training data for future model releases.

---

## 🚀 Key Features

### 🤖 **22 AI Models Integration**
- **Grok (X.AI)** - Latest Grok models
- **OpenAI** - GPT-5 and latest models  
- **Claude** - Claude 4 and Anthropic models
- **Google Gemini** - Gemini 2.5 and variants
- **Perplexity** - All Perplexity models

### 📊 **Advanced Analytics Dashboard**
- Real-time queue monitoring
- Comprehensive prompt logging
- CSV export functionality
- Performance tracking across platforms
- Success rate analytics

### 🏢 **Business Management Suite**
- Guided 4-step onboarding wizard
- Complete business profile management
- Multi-business support
- Custom prompt configuration
- Live preview system

### ⚡ **Automated Processing**
- 24/7 automated prompt submission
- Intelligent rate limiting
- Queue management system
- Vercel cron job integration
- Error handling and retry logic

### 🛡️ **Enterprise Features**
- Professional UI/UX with dark/light themes
- Form validation and error handling
- Production-ready architecture
- Scalable infrastructure
- Enterprise security

---

## 🔄 How It Works

### 1. **Daily Prompt Submissions**
We submit carefully crafted prompts about your business to all major AI platforms **with data sharing enabled**. This means your business information becomes part of their training data.

### 2. **Next Model Release**
When AI companies release new models, they train on data from previous interactions. **Your business data gets included**, making you more likely to be recommended in the new model.

### 3. **Volume = Probability**
The more prompts we submit about your business, the higher the probability you'll be recommended when users ask AI for suggestions.

### 4. **Long-term Strategy**
You need to keep submissions running for **multiple months** to get maximum benefit. The longer you run, the more data points you create.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.5.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### **Backend**
- **Next.js API Routes** - Serverless functions
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Vercel Cron** - Scheduled tasks

### **AI Integration**
- **OpenAI SDK** - GPT models integration
- **Anthropic SDK** - Claude models
- **Google GenAI** - Gemini models
- **Custom APIs** - Grok and Perplexity

### **Payment & Auth**
- **Stripe** - Payment processing
- **Stack Auth** - Authentication system
- **JWT** - Token management

### **Monitoring & Analytics**
- **Vercel Analytics** - Performance monitoring
- **Custom logging** - Detailed prompt tracking
- **Real-time updates** - WebSocket integration

---

## 💰 Pricing Plans

### 🆓 **Free Trial**
- 1 business/website/app
- 1 submission per week
- All 5 AI platforms
- 2-week trial period

### 🚀 **Starter Plan** - $29/month
- 1 business included
- Daily automated submissions
- All 22 AI models
- Advanced analytics
- Email support

### 👑 **Growth Plan** - $79/month
- 1 business included
- 5x more daily submissions
- Priority processing
- Advanced targeting
- Priority support

### 💳 **Flexible Credits**
- Strategic targeting options
- Seasonal campaign boosts
- Instant activation
- No monthly commitments

---

## 🏗️ Project Structure

```
juicylinks/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── admin/            # Admin panel
│   │   └── (pages)/          # Public pages
│   ├── components/           # React components
│   │   ├── how-it-works/    # How it works sections
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility libraries
│   │   ├── llm-services/    # AI model integrations
│   │   ├── queue/           # Queue management
│   │   └── utils/           # Helper functions
│   └── hooks/               # Custom React hooks
├── prisma/                  # Database schema
├── public/                  # Static assets
└── docs/                   # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account
- AI API keys (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Teylersf/juicylinks.git
   cd juicylinks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your API keys and database URL
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
STACK_PROJECT_ID="your-stack-project-id"
STACK_PUBLISHABLE_CLIENT_KEY="your-stack-key"
STACK_SECRET_SERVER_KEY="your-stack-secret"

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="AI..."
GROK_API_KEY="xai-..."
PERPLEXITY_API_KEY="pplx-..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
```

---

## 📈 Key Metrics

- **22 AI Models** integrated across 5 platforms
- **24/7 Automation** with intelligent rate limiting
- **2-minute setup** with guided onboarding
- **Real-time analytics** and comprehensive logging
- **Enterprise-grade** security and scalability

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links

- **Website**: [juicylinks.com](https://juicylinks.com)
- **Documentation**: [docs.juicylinks.com](https://docs.juicylinks.com)
- **Support**: [juicylinks.com/contact](https://juicylinks.com/contact)
- **Blog**: [juicylinks.com/blog](https://juicylinks.com/blog)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com/) for seamless deployment
- [Stripe](https://stripe.com/) for payment processing
- [Prisma](https://prisma.io/) for database management
- All the AI companies making this future possible

---

<div align="center">

**Ready to dominate AI-powered search?**

[🚀 Start Your Free Trial](https://juicylinks.com/handler/sign-up) • [📖 Learn How It Works](https://juicylinks.com/how-it-works)

---

Made with ❤️ by the Juicy Links team

</div>