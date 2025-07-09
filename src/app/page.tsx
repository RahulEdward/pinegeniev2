"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Bot,
  Code,
  BarChart3,
  Palette,
  Star,
  ArrowRight,
  Github,
  Cpu
} from 'lucide-react';

export default function PineGenieLanding() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register'); // or wherever your signup page is
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Visual Drag-n-Drop Builder",
      description: "Create complex trading strategies with our intuitive visual interface. No coding required."
    },
    {
      icon: <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "AI Strategy Generator",
      description: "Powered by GPT & Mistral AI to generate intelligent trading strategies from simple descriptions."
    },
    {
      icon: <Code className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Zero-error Pine Script v6",
      description: "Generate clean, optimized Pine Script v6 code that works perfectly on TradingView."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Live Chart Testing",
      description: "Test your strategies in real-time with integrated TradingView chart simulation."
    },
    {
      icon: <Cpu className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Custom Indicator Modules",
      description: "Build and save custom indicators that you can reuse across multiple strategies."
    },
    {
      icon: <Palette className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
      title: "Dark/Light Mode UI",
      description: "Beautiful interface that adapts to your preference with seamless theme switching."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Describe Your Strategy",
      description: "Simply tell our AI what kind of trading strategy you want to build using natural language."
    },
    {
      number: "02", 
      title: "Visual Builder Magic",
      description: "Use our drag-and-drop interface to customize and fine-tune your strategy components."
    },
    {
      number: "03",
      title: "Export & Deploy",
      description: "Get production-ready Pine Script v6 code and deploy directly to TradingView."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Quantitative Trader",
      content: "Pine Genie transformed how I build strategies. What used to take hours of coding now takes minutes with the visual builder.",
      rating: 5
    },
    {
      name: "Mike Rodriguez", 
      role: "Crypto Analyst",
      content: "The AI strategy generator is incredible. It understood my complex requirements and generated perfect Pine Script code.",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "Day Trader",
      content: "Finally, a tool that bridges the gap between ideas and implementation. The live testing feature is a game-changer.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Do I need coding experience to use Pine Genie?",
      answer: "Not at all! Pine Genie is designed for traders of all skill levels. Our visual drag-and-drop builder and AI-powered generator make strategy creation accessible to everyone."
    },
    {
      question: "What version of Pine Script does Pine Genie support?",
      answer: "Pine Genie generates clean, optimized Pine Script v6 code that's fully compatible with TradingView's latest standards."
    },
    {
      question: "Can I test my strategies before deploying them?",
      answer: "Yes! Pine Genie includes integrated live chart testing powered by TradingView, so you can validate your strategies before going live."
    },
    {
      question: "How does the AI strategy generator work?",
      answer: "Our AI is powered by advanced models like GPT and Mistral. Simply describe your trading idea in natural language, and it will generate a complete strategy for you."
    },
    {
      question: "Can I export my strategies to other platforms?",
      answer: "Pine Genie generates standard Pine Script v6 code that works on any platform supporting Pine Script, primarily TradingView."
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PineGenie
                </span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">
                  Testimonials
                </a>
                <a href="#faq" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors">
                  FAQ
                </a>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button 
                onClick={handleLogin}
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2 text-sm font-medium transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Sign Up
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 dark:text-gray-400"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 dark:text-gray-400"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Features</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Testimonials</a>
              <a href="#faq" className="block px-3 py-2 text-gray-700 dark:text-gray-300">FAQ</a>
              <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleLogin}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Login
                </button>
                <button 
                  onClick={handleSignUp}
                  className="block w-full text-left px-3 py-2 text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-powered Visual Builder for{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TradingView Strategies
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create professional Pine Script strategies without coding. Our AI-powered visual builder transforms your trading ideas into production-ready code in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>
            
            {/* Hero stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Strategies Created', value: '10,000+' },
                { label: 'Active Users', value: '2,500+' },
                { label: 'Success Rate', value: '98%' },
                { label: 'Time Saved', value: '90%' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Traders
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to build, test, and deploy professional trading strategies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* How it Works Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Pine Genie Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From idea to implementation in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full text-xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Traders Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our users are saying about Pine Genie
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about Pine Genie
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <span className="flex-shrink-0">
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </span>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Build Your First Strategy?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of traders who are already using Pine Genie to create winning strategies.
          </p>
          <button 
            onClick={handleSignUp}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className="text-xl font-bold">PineGenie</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered visual builder for TradingView strategies.
              </p>
              <div className="flex space-x-4">
                <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} PineGenie. All rights reserved.
            </p>
            <p className="text-gray-400 mt-4 md:mt-0">
              Built by Abhishek Software and Digital Solutions Pvt Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}