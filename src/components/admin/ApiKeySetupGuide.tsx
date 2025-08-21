/**
 * API Key Setup Guide Component
 * 
 * Provides instructions for securely setting up API keys
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Copy,
    Check,
    ExternalLink,
    AlertTriangle,
    Info,
    Terminal,
    FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApiKeySetupGuideProps {
    service: string;
    onClose?: () => void;
}

interface ServiceConfig {
    name: string;
    description: string;
    envVar: string;
    signupUrl: string;
    instructions: string[];
    exampleValue: string;
    testEndpoint?: string;
}

const serviceConfigs: Record<string, ServiceConfig> = {
    openai: {
        name: 'OpenAI',
        description: 'GPT models and AI features',
        envVar: 'OPENAI_API_KEY',
        signupUrl: 'https://platform.openai.com/api-keys',
        instructions: [
            'Go to OpenAI Platform and sign in to your account',
            'Navigate to API Keys section',
            'Click "Create new secret key"',
            'Copy the generated key (starts with sk-proj-...)',
            'Add it to your environment variables'
        ],
        exampleValue: 'sk-proj-...',
        testEndpoint: 'https://api.openai.com/v1/models'
    },
    anthropic: {
        name: 'Anthropic',
        description: 'Claude AI models',
        envVar: 'ANTHROPIC_API_KEY',
        signupUrl: 'https://console.anthropic.com/',
        instructions: [
            'Go to Anthropic Console and sign in',
            'Navigate to API Keys section',
            'Click "Create Key"',
            'Copy the generated key (starts with sk-ant-...)',
            'Add it to your environment variables'
        ],
        exampleValue: 'sk-ant-...',
        testEndpoint: 'https://api.anthropic.com/v1/messages'
    },
    google: {
        name: 'Google AI',
        description: 'Gemini and other Google AI services',
        envVar: 'GOOGLE_AI_API_KEY',
        signupUrl: 'https://makersuite.google.com/app/apikey',
        instructions: [
            'Go to Google AI Studio',
            'Sign in with your Google account',
            'Click "Get API key"',
            'Create a new API key',
            'Copy the generated key (starts with AIza...)',
            'Add it to your environment variables'
        ],
        exampleValue: 'AIza...',
        testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
    },
    payu: {
        name: 'PayU',
        description: 'Payment processing gateway',
        envVar: 'PAYU_MERCHANT_KEY',
        signupUrl: 'https://www.payu.in/',
        instructions: [
            'Sign up for PayU merchant account',
            'Complete the verification process',
            'Get your Merchant Key and Salt from dashboard',
            'For testing, you can use PayU test credentials',
            'Add both PAYU_MERCHANT_KEY and PAYU_SALT to environment variables'
        ],
        exampleValue: 'rjQUPktU (test key)',
        testEndpoint: 'PayU Payment Gateway'
    }
};

export default function ApiKeySetupGuide({ service, onClose }: ApiKeySetupGuideProps) {
    const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
    
    const config = serviceConfigs[service];
    
    if (!config) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-red-600">Unknown service: {service}</p>
                </CardContent>
            </Card>
        );
    }

    const copyToClipboard = async (text: string, item: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItems(prev => new Set([...prev, item]));
            toast.success('Copied to clipboard');
            
            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopiedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(item);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const envVarExample = service === 'payu' 
        ? `PAYU_MERCHANT_KEY=your_merchant_key_here\nPAYU_SALT=your_salt_here`
        : `${config.envVar}=your_api_key_here`;

    return (
        <div className="space-y-6">
            {/* Service Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {config.name} API Setup
                                <Badge variant="outline">{service}</Badge>
                            </CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => window.open(config.signupUrl, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Get API Key
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Setup Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Setup Instructions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-3">
                        {config.instructions.map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                </span>
                                <span className="text-sm">{instruction}</span>
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>

            {/* Environment Variable Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        Environment Variable Setup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">For Development (.env.local)</h4>
                        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative">
                            <pre className="whitespace-pre-wrap">{envVarExample}</pre>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2"
                                onClick={() => copyToClipboard(envVarExample, 'env-dev')}
                            >
                                {copiedItems.has('env-dev') ? 
                                    <Check className="w-4 h-4 text-green-600" /> : 
                                    <Copy className="w-4 h-4" />
                                }
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">For Production</h4>
                        <p className="text-sm text-gray-600 mb-2">
                            Set the environment variable in your hosting platform (Vercel, Netlify, etc.)
                        </p>
                        <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
                            Variable: <code>{config.envVar}</code><br />
                            Value: <code>{config.exampleValue}</code>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Best Practices */}
            <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-5 h-5" />
                        Security Best Practices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-yellow-700">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            Never commit API keys to version control
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            Use environment variables for all API keys
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            Rotate API keys regularly
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            Use different keys for development and production
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                            Monitor API key usage and set up alerts
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Testing Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Testing Your Setup
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                            After setting up your API key, you can test it using the "Test" button in the API Keys dashboard.
                        </p>
                        <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> You'll need to restart your development server after adding new environment variables.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => window.open(config.signupUrl, '_blank')}
                    className="flex-1"
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get {config.name} API Key
                </Button>
                {onClose && (
                    <Button onClick={onClose} className="flex-1">
                        Done
                    </Button>
                )}
            </div>
        </div>
    );
}