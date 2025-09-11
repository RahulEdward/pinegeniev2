/**
 * Node Factory
 * Creates specific node components based on node type and label
 */

import React from 'react';
import { N8nNodeData } from './N8nNode';
import { RSINode } from '../nodes/RSINode';
import { IndicatorNode } from '../nodes/IndicatorNode';
import { 
  MACDNode, 
  BollingerBandsNode, 
  StochasticNode, 
  EMANode, 
  ATRNode, 
  VolumeNode 
} from '../nodes/SimpleIndicatorNodes';
import {
  WilliamsRNode,
  CCINode,
  ADXNode,
  ParabolicSARNode,
  IchimokuNode,
  MFINode,
  OBVNode,
  AroonNode,
  VWMANode,
  KeltnerChannelsNode
} from '../nodes/AdvancedIndicatorNodes';

interface NodeFactoryProps {
  node: N8nNodeData;
  isSelected: boolean;
  onConfigChange?: (config: any) => void;
}

export const NodeFactory: React.FC<NodeFactoryProps> = ({
  node,
  isSelected,
  onConfigChange
}) => {
  // Handle specific indicator types
  if (node.type === 'indicator') {
    const label = node.label.toLowerCase();
    
    if (label.includes('rsi')) {
      return (
        <RSINode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('macd')) {
      return (
        <MACDNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('bollinger')) {
      return (
        <BollingerBandsNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('stochastic')) {
      return (
        <StochasticNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('ema')) {
      return (
        <EMANode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('atr')) {
      return (
        <ATRNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    if (label.includes('volume')) {
      return (
        <VolumeNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    // Advanced indicators
    if (label.includes('williams')) {
      return (
        <WilliamsRNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('cci')) {
      return (
        <CCINode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('adx')) {
      return (
        <ADXNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('parabolic') || label.includes('sar')) {
      return (
        <ParabolicSARNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('ichimoku')) {
      return (
        <IchimokuNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('mfi')) {
      return (
        <MFINode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('obv')) {
      return (
        <OBVNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('aroon')) {
      return (
        <AroonNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('vwma')) {
      return (
        <VWMANode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }

    if (label.includes('keltner')) {
      return (
        <KeltnerChannelsNode
          id={node.id}
          data={{
            label: node.label,
            description: node.description,
            config: node.config
          }}
          selected={isSelected}
          onConfigChange={onConfigChange}
        />
      );
    }
    
    // Default indicator node for SMA and others
    return (
      <IndicatorNode
        id={node.id}
        data={{
          label: node.label,
          description: node.description,
          config: node.config
        }}
        selected={isSelected}
        onConfigChange={onConfigChange}
      />
    );
  }
  
  // For non-indicator nodes, return null (will use default N8nNode)
  return null;
};

export const shouldUseCustomNode = (node: N8nNodeData): boolean => {
  if (node.type === 'indicator') {
    const label = node.label.toLowerCase();
    return (
      label.includes('rsi') ||
      label.includes('macd') ||
      label.includes('bollinger') ||
      label.includes('stochastic') ||
      label.includes('ema') ||
      label.includes('atr') ||
      label.includes('volume') ||
      label.includes('williams') ||
      label.includes('cci') ||
      label.includes('adx') ||
      label.includes('parabolic') ||
      label.includes('sar') ||
      label.includes('ichimoku') ||
      label.includes('mfi') ||
      label.includes('obv') ||
      label.includes('aroon') ||
      label.includes('vwma') ||
      label.includes('keltner')
    );
  }
  return false;
};