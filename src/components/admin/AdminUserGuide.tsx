'use client';

import { useState } from 'react';
import { 
  Book, 
  ChevronDown, 
  ChevronRight, 
  Bot, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  CreditCard,
  Coins,
  Key,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  content: GuideContent[];
}

interface GuideContent {
  type: 'text' | 'steps' | 'example' | 'warning' | 'tip';
  title?: string;
  content: string | string[];
  code?: string;
}

const guideData: GuideSection[] = [
  {
    id: 'overview',
    title: 'Admin Dashboard Overview',
    icon: Book,
    description: 'Admin dashboard ka complete overview aur navigation guide',
    content: [
      {
        type: 'text',
        content: 'PineGenie Admin Dashboard aapko complete control deta hai AI system ke upar. Yahan aap users, models, API keys, subscriptions aur analytics manage kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'Dashboard Navigation:',
        content: [
          'Left sidebar mein saare main sections hain',
          'Dashboard - System overview aur metrics',
          'User Management - Users ko manage karne ke liye',
          'Token Management - User tokens allocate karne ke liye',
          'Subscriptions - Payment aur subscription management',
          'AI Models - AI models activate/deactivate karne ke liye',
          'API Keys - External API keys configure karne ke liye',
          'Analytics - System performance metrics',
          'Security - Security settings aur logs'
        ]
      }
    ]
  },
  {
    id: 'models',
    title: 'AI Model Management',
    icon: Bot,
    description: 'AI models ko activate, deactivate aur configure kaise kare',
    content: [
      {
        type: 'text',
        content: 'AI Models section mein aap different AI providers ke models manage kar sakte hain jaise OpenAI GPT, Anthropic Claude, aur Google Gemini.'
      },
      {
        type: 'steps',
        title: 'Model Management Steps:',
        content: [
          'Admin Dashboard → AI Models par click kare',
          'Available models ki list dikhegi',
          'Har model card mein status dikhta hai (Active/Inactive)',
          'Individual model ko activate/deactivate karne ke liye "Activate" ya "Deactivate" button click kare',
          'Default model set karne ke liye "Set Default" button use kare',
          'Model information mein max tokens aur cost per 1K tokens dikhta hai'
        ]
      },
      {
        type: 'example',
        title: 'Model Status Examples:',
        content: [
          '🟢 Active + Default: Ye model currently use ho raha hai',
          '🟢 Active: Ye model available hai but default nahi hai',
          '🔴 Inactive: Ye model currently disabled hai'
        ]
      },
      {
        type: 'warning',
        content: 'Agar koi model inactive hai to users use nahi kar sakte. Kam se kam ek model active rakhna zaroori hai.'
      }
    ]
  },
  {
    id: 'api-keys',
    title: 'API Keys Configuration',
    icon: Key,
    description: 'External AI services ke API keys setup aur test kaise kare',
    content: [
      {
        type: 'text',
        content: 'API Keys section mein aap external AI services ke API keys add, test aur manage kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'API Key Setup Process:',
        content: [
          'Admin Dashboard → API Keys par click kare',
          'Available providers ki list dikhegi (OpenAI, Anthropic, Google AI)',
          'Har provider ke liye API key input field hai',
          'Valid API key enter kare',
          '"Test Connection" button click kar ke verify kare',
          'Green checkmark successful connection show karta hai',
          'Red cross invalid key ya connection error show karta hai'
        ]
      },
      {
        type: 'example',
        title: 'Required API Keys:',
        content: [
          'OPENAI_API_KEY: GPT models ke liye (sk-...)',
          'ANTHROPIC_API_KEY: Claude models ke liye (sk-ant-...)',
          'GOOGLE_AI_KEY: Gemini models ke liye'
        ]
      },
      {
        type: 'tip',
        content: 'API keys .env.local file mein automatically save ho jati hain. Server restart karne ki zaroorat nahi hai.'
      },
      {
        type: 'warning',
        content: 'API keys sensitive information hain. Kabhi bhi public repositories mein commit na kare.'
      }
    ]
  },
  {
    id: 'users',
    title: 'User Management',
    icon: Users,
    description: 'Users ko manage kaise kare, roles assign kare aur activity monitor kare',
    content: [
      {
        type: 'text',
        content: 'User Management section mein aap saare registered users ko dekh aur manage kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'User Management Features:',
        content: [
          'Admin Dashboard → User Management par click kare',
          'Users ki complete list dikhegi with details',
          'User information: Name, Email, Registration Date, Status',
          'User roles: Admin ya Regular User',
          'User activity aur last login time',
          'User ko block/unblock kar sakte hain',
          'Admin privileges assign kar sakte hain'
        ]
      },
      {
        type: 'example',
        title: 'User Status Types:',
        content: [
          '🟢 Active: User normally use kar sakta hai',
          '🔴 Blocked: User temporarily blocked hai',
          '👑 Admin: User ko admin privileges hain'
        ]
      }
    ]
  },
  {
    id: 'tokens',
    title: 'Token Management',
    icon: Coins,
    description: 'User tokens allocate aur manage kaise kare',
    content: [
      {
        type: 'text',
        content: 'Token Management system se aap users ko AI usage ke liye tokens allocate kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'Token Allocation Process:',
        content: [
          'Admin Dashboard → Token Management par click kare',
          'User search kare ya list se select kare',
          'Current token balance dikhega',
          'New tokens allocate karne ke liye amount enter kare',
          '"Allocate Tokens" button click kare',
          'Token history aur usage statistics dekh sakte hain'
        ]
      },
      {
        type: 'example',
        title: 'Token Usage Examples:',
        content: [
          'Text generation: ~1 token per word',
          'Chat conversation: Variable based on length',
          'Free users: Limited tokens per month',
          'Premium users: Higher token limits'
        ]
      },
      {
        type: 'tip',
        content: 'Regular monitoring kare ki users tokens efficiently use kar rahe hain ya abuse to nahi kar rahe.'
      }
    ]
  },
  {
    id: 'subscriptions',
    title: 'Subscription Management',
    icon: CreditCard,
    description: 'User subscriptions, payments aur billing manage kaise kare',
    content: [
      {
        type: 'text',
        content: 'Subscription Management mein aap user payments, subscription plans aur billing history manage kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'Subscription Features:',
        content: [
          'Admin Dashboard → Subscriptions par click kare',
          'Active subscriptions ki list dikhegi',
          'Payment transactions aur history',
          'Subscription plans aur pricing',
          'Revenue metrics aur analytics',
          'Failed payments aur refunds',
          'PayU integration status'
        ]
      },
      {
        type: 'example',
        title: 'Subscription Types:',
        content: [
          'Free Plan: Limited features aur tokens',
          'Basic Plan: More tokens aur features',
          'Premium Plan: Unlimited access',
          'Enterprise Plan: Custom solutions'
        ]
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Monitoring',
    icon: BarChart3,
    description: 'System performance, usage metrics aur analytics kaise dekhe',
    content: [
      {
        type: 'text',
        content: 'Analytics section mein aap system ki complete performance aur usage statistics dekh sakte hain.'
      },
      {
        type: 'steps',
        title: 'Available Analytics:',
        content: [
          'Admin Dashboard → Analytics par click kare',
          'User growth metrics aur trends',
          'AI model usage statistics',
          'Token consumption patterns',
          'Revenue aur subscription metrics',
          'System performance indicators',
          'Error rates aur uptime statistics'
        ]
      },
      {
        type: 'example',
        title: 'Key Metrics to Monitor:',
        content: [
          'Daily/Monthly Active Users (DAU/MAU)',
          'API response times aur success rates',
          'Token usage per user/model',
          'Revenue growth aur churn rate',
          'System uptime aur error rates'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Management',
    icon: Shield,
    description: 'Security settings, access control aur audit logs manage kaise kare',
    content: [
      {
        type: 'text',
        content: 'Security section mein aap system ki security settings aur access controls manage kar sakte hain.'
      },
      {
        type: 'steps',
        title: 'Security Features:',
        content: [
          'Admin Dashboard → Security par click kare',
          'Admin access logs aur login history',
          'Failed login attempts monitoring',
          'API key security status',
          'User permission management',
          'Security audit trails',
          'System vulnerability checks'
        ]
      },
      {
        type: 'warning',
        content: 'Regular security audits kare aur suspicious activities ko immediately investigate kare.'
      },
      {
        type: 'tip',
        content: 'Strong passwords use kare aur 2FA enable karne ko recommend kare users ko.'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Troubleshooting',
    icon: AlertCircle,
    description: 'Common problems aur unke solutions',
    content: [
      {
        type: 'text',
        content: 'Yahan common issues aur unke quick solutions hain jo admin dashboard use karte time aa sakte hain.'
      },
      {
        type: 'steps',
        title: 'API Key Issues:',
        content: [
          'Problem: API key test fail ho rahi hai',
          'Solution: Key format check kare (sk- se start honi chahiye)',
          'Solution: API provider dashboard mein key active hai ya nahi check kare',
          'Solution: Rate limits exceed to nahi ho rahe check kare'
        ]
      },
      {
        type: 'steps',
        title: 'Model Not Working:',
        content: [
          'Problem: AI model response nahi de raha',
          'Solution: Model active hai ya nahi check kare',
          'Solution: Related API key properly configured hai ya nahi',
          'Solution: User ke paas sufficient tokens hain ya nahi'
        ]
      },
      {
        type: 'steps',
        title: 'User Login Issues:',
        content: [
          'Problem: User login nahi kar pa raha',
          'Solution: User account blocked to nahi hai check kare',
          'Solution: Email verification complete hai ya nahi',
          'Solution: Password reset option provide kare'
        ]
      }
    ]
  }
];

export default function AdminUserGuide() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const expandAll = () => {
    setExpandedSections(new Set(guideData.map(section => section.id)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const filteredSections = guideData.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = (content: GuideContent) => {
    switch (content.type) {
      case 'text':
        return (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {content.content}
          </p>
        );
      
      case 'steps':
        return (
          <div>
            {content.title && (
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {content.title}
              </h4>
            )}
            <ol className="space-y-2">
              {(content.content as string[]).map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      
      case 'example':
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                {content.title && (
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    {content.title}
                  </h4>
                )}
                <div className="space-y-1">
                  {(content.content as string[]).map((example, index) => (
                    <p key={index} className="text-blue-800 dark:text-blue-300 text-sm">
                      {example}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'warning':
        return (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                {content.content}
              </p>
            </div>
          </div>
        );
      
      case 'tip':
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-300 text-sm font-medium">
                💡 <strong>Tip:</strong> {content.content}
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard User Guide
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complete guide for PineGenie admin dashboard features
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search guide sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="pt-4 space-y-4">
                    {section.content.map((content, index) => (
                      <div key={index}>
                        {renderContent(content)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Need more help? Contact technical support or check the documentation.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="mailto:support@pinegenie.com"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            Email Support <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          <a
            href="/docs"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            Documentation <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
}