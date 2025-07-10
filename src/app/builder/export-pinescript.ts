import { Node, Edge } from 'reactflow';
import { CustomNodeData } from './canvas-config';

export const generatePineScript = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[]
): string => {
  // Start with the Pine Script version and basic info
  let script = `//@version=6
strategy("PineGenie Strategy", overlay=true, margin_long=100, margin_short=100)

`;

  // Add indicator calculations
  nodes.forEach((node) => {
    if (node.type === 'indicator' && node.data.config) {
      script += `// ${node.data.label}\n`;
      script += generateIndicatorCode(node.data);
      script += '\n';
    }
  });

  // Add strategy conditions
  script += '// Strategy Conditions\n';
  script += generateStrategyCode(nodes, edges);

  return script;
};

const generateIndicatorCode = (data: CustomNodeData): string => {
  // This is a simplified example - in a real app, you'd have specific logic for each indicator type
  switch (data.label) {
    case 'RSI':
      return `length = input(14, "RSI Length")
rsi = ta.rsi(close, length)
plot(rsi, "RSI", color=color.blue)`;
    case 'SMA':
      return `length = input(20, "SMA Length")
sma = ta.sma(close, length)
plot(sma, "SMA", color=color.orange)`;
    default:
      return `// ${data.label} configuration would go here`;
  }
};

const generateStrategyCode = (
  nodes: Node<CustomNodeData>[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  edges: Edge[]
): string => {
  // This is a simplified example - in a real app, you'd parse the node graph
  // to generate the appropriate Pine Script strategy code
  let code = '';
  
  // Find entry/exit nodes and their connections
  const entryNodes = nodes.filter((n) => n.type === 'condition' && n.data.label === 'Entry');
  const exitNodes = nodes.filter((n) => n.type === 'condition' && n.data.label === 'Exit');

  if (entryNodes.length > 0) {
    code += '// Entry conditions\n';
    code += 'longCondition = ' + entryNodes.map(n => generateConditionCode(n.data)).join(' and ') + '\n';
    code += 'strategy.entry("Long", strategy.long, when=longCondition)\n\n';
  }

  if (exitNodes.length > 0) {
    code += '// Exit conditions\n';
    code += 'exitCondition = ' + exitNodes.map(n => generateConditionCode(n.data)).join(' or ') + '\n';
    code += 'strategy.close("Long", when=exitCondition)\n';
  }

  return code || '// No strategy conditions defined';
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateConditionCode = (data: CustomNodeData): string => {
  // This would generate the actual condition code based on the node's configuration
  return `true`; // Placeholder
};
