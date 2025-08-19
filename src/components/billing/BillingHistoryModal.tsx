/**
 * Billing History Modal
 * 
 * Modal component to display user's billing history
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paymentMethod: string | null;
  invoiceId: string | null;
  invoiceNumber: string | null;
}

interface BillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingHistoryModal({ isOpen, onClose }: BillingHistoryModalProps) {
  const [history, setHistory] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBillingHistory();
    }
  }, [isOpen]);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/billing/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      } else {
        toast.error('Failed to load billing history');
      }
    } catch (error) {
      console.error('Error fetching billing history:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      toast.success('Downloading invoice...');
      // TODO: Implement actual PDF download
      console.log('Download invoice:', invoiceId);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Billing History" size="lg">
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">Loading billing history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No billing history
            </h3>
            <p className="text-gray-600 dark:text-slate-400">
              You haven't made any payments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {record.description}
                      </h4>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(record.date)}
                      </div>
                      {record.paymentMethod && (
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {record.paymentMethod}
                        </div>
                      )}
                      {record.invoiceNumber && (
                        <div>
                          Invoice: {record.invoiceNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatAmount(record.amount, record.currency)}
                      </div>
                    </div>
                    
                    {record.invoiceId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(record.invoiceId!)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}