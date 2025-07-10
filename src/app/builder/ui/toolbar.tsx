'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Download, Save, Trash2 } from 'lucide-react';
import useBuilderStore from '../builder-state';
import { generatePineScript } from '../export-pinescript';

export default function Toolbar() {
  const { nodes, edges } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save operation
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Strategy saved successfully!');
    }, 1000);
  };

  const handleExport = () => {
    const script = generatePineScript(nodes, edges);
    // Create a blob and download link
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strategy.pine';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Pine Script exported successfully!');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      // Reset to initial state using the store's reset function
      const { reset } = useBuilderStore.getState();
      reset();
      toast.success('Canvas cleared');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">PineGenie Builder</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Export Pine Script
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
