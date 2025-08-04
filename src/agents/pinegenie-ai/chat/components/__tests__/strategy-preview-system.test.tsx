/**
 * Strategy Preview System Tests
 * 
 * Comprehensive tests for the enhanced strategy preview system including
 * comparison, modification, and export capabilities
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StrategyPreview } from '../StrategyPreview';
import { StrategyComparison } from '../StrategyComparison';
import { StrategyModifier } from '../StrategyModifier';
import { StrategyExporter } from '../StrategyExporter';
import { StrategyPreview as StrategyPreviewType } from '../../../types/chat-types';

// Mock strategy data
const mockStrategy: StrategyPreviewType = {
  id: 'test-strategy-1',
  name: 'RSI Mean Reversion Strategy',
  description: 'A strategy that buys when RSI is oversold and sells when overbought',
  components: [
    {
      type: 'data-source',
      label: 'Market Data',
      description: 'BTCUSDT 1h timeframe',
      essential: true
    },
    {
      type: 'indicator',
      label: 'RSI (14)',
      description: 'Relative Strength Index with 14 period',
      essential: true
    },
    {
      type: 'condition',
      label: 'Oversold Check',
      description: 'RSI < 30 for buy signal',
      essential: true
    },
    {
      type: 'risk',
      label: 'Stop Loss',
      description: '2% stop loss protection',
      essential: false
    }
  ],
  estimatedComplexity: 'medium',
  estimatedTime: 45,
  riskLevel: 'medium'
};

const mockStrategies: StrategyPreviewType[] = [
  mockStrategy,
  {
    id: 'test-strategy-2',
    name: 'MACD Crossover Strategy',
    description: 'A trend-following strategy using MACD crossovers',
    components: [
      {
        type: 'data-source',
        label: 'Market Data',
        description: 'BTCUSDT 4h timeframe',
        essential: true
      },
      {
        type: 'indicator',
        label: 'MACD',
        description: 'MACD with standard parameters',
        essential: true
      }
    ],
    estimatedComplexity: 'low',
    estimatedTime: 30,
    riskLevel: 'low'
  }
];

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

describe('StrategyPreview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders strategy preview with all information', async () => {
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
      />
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading strategy preview...')).not.toBeInTheDocument();
    });

    // Check strategy information
    expect(screen.getByText('RSI Mean Reversion Strategy')).toBeInTheDocument();
    expect(screen.getByText('A strategy that buys when RSI is oversold and sells when overbought')).toBeInTheDocument();
    
    // Check metrics
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    expect(screen.getByText('45s')).toBeInTheDocument();
    
    // Check components
    expect(screen.getByText('Market Data')).toBeInTheDocument();
    expect(screen.getByText('RSI (14)')).toBeInTheDocument();
    expect(screen.getByText('Oversold Check')).toBeInTheDocument();
    expect(screen.getByText('Stop Loss')).toBeInTheDocument();
  });

  test('shows action buttons', async () => {
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading strategy preview...')).not.toBeInTheDocument();
    });

    // Check action buttons
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Modify')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Build Strategy')).toBeInTheDocument();
  });

  test('opens modifier when modify button is clicked', async () => {
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading strategy preview...')).not.toBeInTheDocument();
    });

    // Click modify button
    fireEvent.click(screen.getByText('Modify'));

    // Check if modifier is opened
    await waitFor(() => {
      expect(screen.getByText('Modify Strategy: RSI Mean Reversion Strategy')).toBeInTheDocument();
    });
  });

  test('opens exporter when share button is clicked', async () => {
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading strategy preview...')).not.toBeInTheDocument();
    });

    // Click share button
    fireEvent.click(screen.getByText('Share'));

    // Check if exporter is opened
    await waitFor(() => {
      expect(screen.getByText('Export & Share: RSI Mean Reversion Strategy')).toBeInTheDocument();
    });
  });
});

describe('StrategyComparison Component', () => {
  test('renders comparison interface with multiple strategies', () => {
    const onSelect = jest.fn();
    
    render(
      <StrategyComparison 
        strategies={mockStrategies}
        onSelect={onSelect}
      />
    );

    // Check header
    expect(screen.getByText('Strategy Comparison (2 strategies)')).toBeInTheDocument();
    
    // Check strategies are displayed
    expect(screen.getByText('RSI Mean Reversion Strategy')).toBeInTheDocument();
    expect(screen.getByText('MACD Crossover Strategy')).toBeInTheDocument();
    
    // Check metrics are shown
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  test('handles strategy selection', () => {
    const onSelect = jest.fn();
    
    render(
      <StrategyComparison 
        strategies={mockStrategies}
        onSelect={onSelect}
      />
    );

    // Click on first strategy
    fireEvent.click(screen.getAllByText('Select Strategy')[0]);

    // Check if selection callback is called
    expect(onSelect).toHaveBeenCalledWith('test-strategy-1');
  });

  test('shows empty state when no strategies provided', () => {
    render(
      <StrategyComparison 
        strategies={[]}
        onSelect={jest.fn()}
      />
    );

    expect(screen.getByText('No Strategies to Compare')).toBeInTheDocument();
    expect(screen.getByText('Generate some strategies first to see them here for comparison.')).toBeInTheDocument();
  });

  test('shows action bar when strategy is selected', () => {
    const onSelect = jest.fn();
    
    render(
      <StrategyComparison 
        strategies={mockStrategies}
        onSelect={onSelect}
      />
    );

    // Click on first strategy
    fireEvent.click(screen.getAllByText('Select Strategy')[0]);

    // Check if action bar appears
    expect(screen.getByText('RSI Mean Reversion Strategy selected')).toBeInTheDocument();
    expect(screen.getByText('Build Selected Strategy')).toBeInTheDocument();
  });
});

describe('StrategyModifier Component', () => {
  test('renders modifier interface with tabs', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Check header
    expect(screen.getByText('Modify Strategy: RSI Mean Reversion Strategy')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByText('Risk & Settings')).toBeInTheDocument();
  });

  test('shows components in components tab', () => {
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Check components are listed
    expect(screen.getByText('Market Data')).toBeInTheDocument();
    expect(screen.getByText('RSI (14)')).toBeInTheDocument();
    expect(screen.getByText('Oversold Check')).toBeInTheDocument();
    expect(screen.getByText('Stop Loss')).toBeInTheDocument();
  });

  test('allows adding new components', () => {
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Find and use the add component dropdown
    const dropdown = screen.getByDisplayValue('Add Component...');
    fireEvent.change(dropdown, { target: { value: 'indicator' } });

    // Check if component was added (would show in modification history)
    expect(screen.getByText('Recent Changes')).toBeInTheDocument();
  });

  test('switches between tabs', () => {
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Click on Parameters tab
    fireEvent.click(screen.getByText('Parameters'));
    
    // Check if parameters content is shown
    expect(screen.getByText('Complexity Level')).toBeInTheDocument();
    expect(screen.getByText('Estimated Build Time')).toBeInTheDocument();

    // Click on Risk & Settings tab
    fireEvent.click(screen.getByText('Risk & Settings'));
    
    // Check if risk content is shown
    expect(screen.getByText('Risk Level')).toBeInTheDocument();
    expect(screen.getByText('Strategy Information')).toBeInTheDocument();
  });

  test('handles save and cancel actions', () => {
    const onSave = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={onSave}
        onCancel={onCancel}
      />
    );

    // Test cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();

    // Make a change to enable save button
    const nameInput = screen.getByDisplayValue('RSI Mean Reversion Strategy');
    fireEvent.change(nameInput, { target: { value: 'Modified Strategy' } });

    // Test save
    fireEvent.click(screen.getByText('Save Changes'));
    expect(onSave).toHaveBeenCalled();
  });
});

describe('StrategyExporter Component', () => {
  test('renders exporter interface with tabs', () => {
    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Check header
    expect(screen.getByText('Export & Share: RSI Mean Reversion Strategy')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  test('shows export formats in export tab', () => {
    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Check export formats
    expect(screen.getByText('Pine Script v6')).toBeInTheDocument();
    expect(screen.getByText('Strategy JSON')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Strategy Diagram')).toBeInTheDocument();
  });

  test('shows share options in share tab', () => {
    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Click on Share tab
    fireEvent.click(screen.getByText('Share'));
    
    // Check share options
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
    expect(screen.getByText('Share via Email')).toBeInTheDocument();
    expect(screen.getByText('Share on Social')).toBeInTheDocument();
  });

  test('handles export download', async () => {
    // Mock document.createElement and related methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Click download button for Pine Script
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    // Wait for download to complete
    await waitFor(() => {
      expect(screen.getByText('Downloaded!')).toBeInTheDocument();
    });

    // Check if download was triggered
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();

    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('handles share link copy', async () => {
    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Click on Share tab
    fireEvent.click(screen.getByText('Share'));
    
    // Click copy link
    const shareButtons = screen.getAllByText('Share');
    fireEvent.click(shareButtons[0]); // Copy Link button

    // Wait for copy to complete
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Check if clipboard was used
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('shows strategy summary', () => {
    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Check strategy summary
    expect(screen.getByText('Strategy Summary')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // Components count
    expect(screen.getByText('medium')).toBeInTheDocument(); // Complexity
    expect(screen.getByText('0m 45s')).toBeInTheDocument(); // Build time
  });
});

describe('Integration Tests', () => {
  test('strategy preview integrates with modifier and exporter', async () => {
    const onModify = jest.fn();
    
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
        onModify={onModify}
      />
    );

    // Wait for loading
    await waitFor(() => {
      expect(screen.queryByText('Loading strategy preview...')).not.toBeInTheDocument();
    });

    // Open modifier
    fireEvent.click(screen.getByText('Modify'));
    
    // Make a change
    const nameInput = screen.getByDisplayValue('RSI Mean Reversion Strategy');
    fireEvent.change(nameInput, { target: { value: 'Modified Strategy' } });
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if onModify was called
    expect(onModify).toHaveBeenCalled();
  });

  test('strategy comparison works with multiple strategies', () => {
    const onSelect = jest.fn();
    
    render(
      <StrategyComparison 
        strategies={mockStrategies}
        onSelect={onSelect}
      />
    );

    // Select first strategy
    fireEvent.click(screen.getAllByText('Select Strategy')[0]);
    
    // Build selected strategy
    fireEvent.click(screen.getByText('Build Selected Strategy'));
    
    // Check if selection was handled correctly
    expect(onSelect).toHaveBeenCalledWith('test-strategy-1');
  });
});

describe('Accessibility Tests', () => {
  test('components have proper ARIA labels and roles', () => {
    render(
      <StrategyPreview 
        strategyId="test-strategy-1"
        onPreviewClick={jest.fn()}
      />
    );

    // Check for accessible buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check for proper titles
    expect(screen.getByTitle('View strategy details')).toBeInTheDocument();
    expect(screen.getByTitle('Modify strategy')).toBeInTheDocument();
    expect(screen.getByTitle('Export & share strategy')).toBeInTheDocument();
  });

  test('modifier has proper form labels', () => {
    render(
      <StrategyModifier 
        strategy={mockStrategy}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Switch to Risk & Settings tab to see form inputs
    fireEvent.click(screen.getByText('Risk & Settings'));
    
    // Check for proper labels
    expect(screen.getByText('Strategy Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});

describe('Error Handling', () => {
  test('handles export errors gracefully', async () => {
    // Mock URL.createObjectURL to throw error
    const originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn(() => {
      throw new Error('Export failed');
    });

    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Try to export
    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    // Restore original function
    global.URL.createObjectURL = originalCreateObjectURL;
  });

  test('handles clipboard errors gracefully', async () => {
    // Mock clipboard to reject
    const originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.reject(new Error('Clipboard failed'))),
      },
    });

    render(
      <StrategyExporter 
        strategy={mockStrategy}
        onClose={jest.fn()}
      />
    );

    // Click on Share tab
    fireEvent.click(screen.getByText('Share'));
    
    // Try to copy link
    const shareButtons = screen.getAllByText('Share');
    fireEvent.click(shareButtons[0]);

    // The component should handle the error gracefully
    // (specific error handling would depend on implementation)

    // Restore original clipboard
    Object.assign(navigator, { clipboard: originalClipboard });
  });
});