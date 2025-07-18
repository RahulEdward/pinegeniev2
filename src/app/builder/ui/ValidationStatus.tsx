import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ValidationStatusProps {
  nodes: any[];
  connections: any[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  status: 'valid' | 'warning' | 'error' | 'empty';
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({ nodes, connections }) => {
  const { colors } = useTheme();
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    status: 'empty'
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    validateStrategy();
  }, [nodes, connections]);

  const validateStrategy = async () => {
    if (nodes.length === 0) {
      setValidation({
        isValid: true,
        errors: [],
        warnings: [],
        status: 'empty'
      });
      return;
    }

    try {
      // Import the validation function
      const { validateStrategyRealtime } = await import('../export-pinescript');
      
      // Convert nodes to the expected format
      const convertedNodes = nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        data: {
          id: node.id,
          label: node.label,
          type: node.type as any,
          description: node.description,
          config: node.props || {},
          category: 'Generated'
        },
        position: node.position
      }));

      const convertedEdges = connections.map(conn => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 },
        type: 'smoothstep' as const
      }));

      const result = validateStrategyRealtime(convertedNodes, convertedEdges);
      
      let status: 'valid' | 'warning' | 'error' = 'valid';
      if (result.errors.length > 0) {
        status = 'error';
      } else if (result.warnings.length > 0) {
        status = 'warning';
      }

      setValidation({
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        status
      });
    } catch (error) {
      console.error('Validation error:', error);
      setValidation({
        isValid: false,
        errors: ['Failed to validate strategy'],
        warnings: [],
        status: 'error'
      });
    }
  };

  const getStatusIcon = () => {
    switch (validation.status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'empty':
        return <Info className="w-4 h-4 text-blue-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (validation.status) {
      case 'valid':
        return 'Ready';
      case 'warning':
        return `${validation.warnings.length} Warning${validation.warnings.length > 1 ? 's' : ''}`;
      case 'error':
        return `${validation.errors.length} Error${validation.errors.length > 1 ? 's' : ''}`;
      case 'empty':
        return 'Empty';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (validation.status) {
      case 'valid':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'empty':
        return 'text-blue-400';
      default:
        return colors.text.tertiary;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 text-xs font-medium ${getStatusColor()} hover:opacity-80 transition-opacity`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>

      {/* Validation Details Tooltip */}
      {showDetails && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className={`absolute top-6 right-0 w-80 ${colors.bg.glass} ${colors.border.primary} border rounded-xl p-4 shadow-xl z-50`}>
          <div className="space-y-3">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">
                    Errors ({validation.errors.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <div key={index} className={`text-xs ${colors.text.secondary} pl-6`}>
                      • {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">
                    Warnings ({validation.warnings.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className={`text-xs ${colors.text.secondary} pl-6`}>
                      • {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className={`${colors.border.secondary} border-t pt-3`}>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Tips</span>
              </div>
              <div className={`text-xs ${colors.text.tertiary} space-y-1`}>
                {validation.status === 'error' && (
                  <div>• Fix errors before generating Pine Script</div>
                )}
                {validation.status === 'warning' && (
                  <div>• Warnings won't prevent code generation</div>
                )}
                {nodes.filter(n => n.type === 'data').length === 0 && (
                  <div>• Add a data source to start building</div>
                )}
                {nodes.filter(n => n.type === 'action').length === 0 && (
                  <div>• Add trading actions to complete strategy</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationStatus;