/**
 * API Key Management Dashboard
 * 
 * Admin interface for managing external API keys and configurations
 */

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Key,
    Eye,
    EyeOff,
    Plus,
    Edit,
    Trash2,
    TestTube,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApiKeyConfig {
    id: string;
    name: string;
    service: string;
    keyPreview: string;
    status: 'active' | 'inactive' | 'testing';
    lastTested: string;
    createdAt: string;
    environment: 'development' | 'staging' | 'production';
}

interface ApiKeyTest {
    service: string;
    status: 'success' | 'error' | 'testing';
    message: string;
    responseTime?: number;
}

export default function ApiKeyManagementPage() {
    const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, ApiKeyTest>>({});
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

    const breadcrumbs = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'API Keys', icon: 'Key' },
    ];

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/api-keys');
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data.apiKeys);
            }
        } catch (error) {
            console.error('Error fetching API keys:', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const testApiKey = async (keyId: string, service: string) => {
        setTestResults(prev => ({
            ...prev,
            [keyId]: { service, status: 'testing', message: 'Testing connection...' }
        }));

        try {
            const response = await fetch('/api/admin/api-keys/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyId, service })
            });

            const result = await response.json();
            
            setTestResults(prev => ({
                ...prev,
                [keyId]: {
                    service,
                    status: result.success ? 'success' : 'error',
                    message: result.message,
                    responseTime: result.responseTime
                }
            }));

            if (result.success) {
                toast.success(`${service} API key test successful`);
            } else {
                toast.error(`${service} API key test failed: ${result.message}`);
            }
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [keyId]: {
                    service,
                    status: 'error',
                    message: 'Test failed: Network error'
                }
            }));
            toast.error('API key test failed');
        }
    };

    const toggleKeyVisibility = (keyId: string) => {
        setVisibleKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(keyId)) {
                newSet.delete(keyId);
            } else {
                newSet.add(keyId);
            }
            return newSet;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'testing': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTestStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'testing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <AdminLayout
            title="API Key Management"
            breadcrumbs={breadcrumbs}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchApiKeys}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add API Key
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* API Key Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
                            <Key className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{apiKeys.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Configured API keys
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {apiKeys.filter(key => key.status === 'active').length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Services</CardTitle>
                            <TestTube className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Set(apiKeys.map(key => key.service)).size}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Integrated services
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Setup for Common Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Setup</CardTitle>
                        <CardDescription>
                            Configure API keys for commonly used services
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { name: 'OpenAI', service: 'openai', description: 'GPT models and AI features' },
                                { name: 'Anthropic', service: 'anthropic', description: 'Claude AI models' },
                                { name: 'Google AI', service: 'google', description: 'Gemini and other Google AI' },
                                { name: 'PayU', service: 'payu', description: 'Payment processing' }
                            ].map((service) => (
                                <Card key={service.service} className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{service.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {apiKeys.find(k => k.service === service.service)?.status || 'Not configured'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => {
                                            // Open configuration modal for this service
                                            setShowAddForm(true);
                                        }}
                                    >
                                        {apiKeys.find(k => k.service === service.service) ? 'Update' : 'Configure'}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* API Keys Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configured API Keys</CardTitle>
                        <CardDescription>
                            Manage and test your API key configurations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">Service</th>
                                        <th className="text-left p-4 font-medium">Name</th>
                                        <th className="text-left p-4 font-medium">Key Preview</th>
                                        <th className="text-left p-4 font-medium">Environment</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Last Test</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                                                    Loading API keys...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : apiKeys.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-gray-500">
                                                No API keys configured yet
                                            </td>
                                        </tr>
                                    ) : (
                                        apiKeys.map((apiKey) => (
                                            <tr key={apiKey.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                            <Key className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium capitalize">{apiKey.service}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">{apiKey.name}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {visibleKeys.has(apiKey.id) 
                                                                ? 'sk-proj-...' // Would show actual key in real implementation
                                                                : apiKey.keyPreview
                                                            }
                                                        </code>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                                        >
                                                            {visibleKeys.has(apiKey.id) ? 
                                                                <EyeOff className="w-4 h-4" /> : 
                                                                <Eye className="w-4 h-4" />
                                                            }
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {apiKey.environment}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStatusColor(apiKey.status)}>
                                                            {apiKey.status}
                                                        </Badge>
                                                        {testResults[apiKey.id] && (
                                                            <div className="flex items-center gap-1">
                                                                {getTestStatusIcon(testResults[apiKey.id].status)}
                                                                <span className="text-xs text-gray-500">
                                                                    {testResults[apiKey.id].responseTime && 
                                                                        `${testResults[apiKey.id].responseTime}ms`
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {apiKey.lastTested}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => testApiKey(apiKey.id, apiKey.service)}
                                                            disabled={testResults[apiKey.id]?.status === 'testing'}
                                                        >
                                                            <TestTube className="w-4 h-4 mr-1" />
                                                            Test
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Notice */}
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800">Security Notice</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    API keys are stored securely using environment variables. Never commit API keys to version control. 
                                    Use the proper environment configuration for each deployment environment.
                                </p>
                                <div className="mt-2 text-xs text-yellow-600">
                                    <strong>Recommended:</strong> Set API keys in your .env.local file for development, 
                                    and use your hosting platform's environment variable settings for production.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}