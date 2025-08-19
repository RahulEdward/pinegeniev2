/**
 * Token Management Dashboard
 * 
 * Admin interface for managing AI tokens, allocations, and usage monitoring
 */

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Coins,
    Users,
    TrendingUp,
    AlertTriangle,
    Plus,
    Search,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TokenMetrics {
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    activeUsers: number;
    lowTokenUsers: number;
    averageUsage: number;
}

interface UserTokenData {
    id: string;
    name: string;
    email: string;
    totalTokens: number;
    usedTokens: number;
    remainingTokens: number;
    lastUsed: string;
    status: 'active' | 'low' | 'expired';
    subscription: string;
}

export default function TokenManagementPage() {
    const [metrics, setMetrics] = useState<TokenMetrics | null>(null);
    const [users, setUsers] = useState<UserTokenData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const breadcrumbs = [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Token Management', icon: 'Coins' },
    ];

    useEffect(() => {
        fetchTokenMetrics();
        fetchUserTokens();
    }, []);

    const fetchTokenMetrics = async () => {
        try {
            const response = await fetch('/api/admin/tokens');
            if (response.ok) {
                const data = await response.json();
                setMetrics(data.metrics);
            }
        } catch (error) {
            console.error('Error fetching token metrics:', error);
            toast.error('Failed to load token metrics');
        }
    };

    const fetchUserTokens = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/tokens/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching user tokens:', error);
            toast.error('Failed to load user token data');
        } finally {
            setLoading(false);
        }
    };

    const handleAllocateTokens = async (userId: string, amount: number) => {
        try {
            const response = await fetch('/api/admin/tokens/allocate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tokenAmount: amount })
            });

            if (response.ok) {
                toast.success('Tokens allocated successfully');
                fetchUserTokens();
                fetchTokenMetrics();
            } else {
                toast.error('Failed to allocate tokens');
            }
        } catch (error) {
            console.error('Error allocating tokens:', error);
            toast.error('Failed to allocate tokens');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'low': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout
            title="Token Management"
            breadcrumbs={breadcrumbs}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchUserTokens}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Bulk Allocate
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Token Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics?.totalAllocated?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tokens allocated to users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics?.totalUsed?.toLocaleString() || '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tokens consumed by users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics?.activeUsers || '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Users with active tokens
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Token Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {metrics?.lowTokenUsers || '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Users with low tokens
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* User Token Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Token Management</CardTitle>
                        <CardDescription>
                            Manage token allocations and monitor usage for all users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Search and Filter Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="low">Low Tokens</option>
                                    <option value="expired">Expired</option>
                                </select>
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* User Token Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium">User</th>
                                        <th className="text-left p-4 font-medium">Subscription</th>
                                        <th className="text-left p-4 font-medium">Allocated</th>
                                        <th className="text-left p-4 font-medium">Used</th>
                                        <th className="text-left p-4 font-medium">Remaining</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Last Used</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-8">
                                                <div className="flex items-center justify-center">
                                                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                                                    Loading token data...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center p-8 text-gray-500">
                                                No users found matching your criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{user.subscription}</Badge>
                                                </td>
                                                <td className="p-4 font-mono">
                                                    {user.totalTokens.toLocaleString()}
                                                </td>
                                                <td className="p-4 font-mono">
                                                    {user.usedTokens.toLocaleString()}
                                                </td>
                                                <td className="p-4 font-mono">
                                                    {user.remainingTokens.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={getStatusColor(user.status)}>
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {user.lastUsed}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAllocateTokens(user.id, 1000)}
                                                        >
                                                            Add 1K
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAllocateTokens(user.id, 5000)}
                                                        >
                                                            Add 5K
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
            </div>
        </AdminLayout>
    );
}