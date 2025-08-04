/**
 * Basic Usage Examples for PineGenie AI System
 * 
 * This file demonstrates the most common use cases and basic integration patterns
 * for the PineGenie AI System.
 */

import { 
  PineGenieAI,
  NLPEngine,
  StrategyInterpreter,
  AIStrategyBuilder,
  ChatInterface
} from '@/agents/pinegenie-ai';

// Example 1: Simple Strategy Generation
export async function basicStrategyGeneration() {
  console.log('🚀 Basic Strategy Generation Example');
  
  // Initialize the AI system
  const ai = new PineGenieAI({
    enableAnimations: false,
    performanceMode: 'fast'
  });

  try {
    // Process user input
    const result = await ai.processUserInput(
      "Create an RSI strategy that buys when RSI is below 30 and sells when above 70"
    );

    console.log('✅ Strategy generated successfully:');
    console.log(`   Name: ${result.strategy.name}`);
    console.log(`   Type: ${result.strategyType}`);
    console.log(`   Indicators: ${result.indicators.join(', ')}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);

    return result;
  } catch (error) {
    console.error('❌ Strategy generation failed:', error);
    throw error;
  }
}

// Example 2: Step-by-Step Processing
export async function stepByStepProcessing() {
  console.log('🔧 Step-by-Step Processing Example');

  // Initialize individual components
  const nlp = new NLPEngine();
  const interpreter = new StrategyInterpreter();
  const builder = new AIStrategyBuilder();

  const userInput = "Build a MACD crossover strategy with stop loss";

  try {
    // Step 1: Parse user input
    console.log('Step 1: Parsing user input...');
    const parsed = await nlp.parseUserInput(userInput);
    console.log(`   Tokens: ${parsed.tokens.length}`);
    console.log(`   Entities: ${parsed.entities.length}`);
    console.log(`   Confidence: ${(parsed.confidence * 100).toFixed(1)}%`);

    // Step 2: Extract intent
    console.log('Step 2: Extracting trading intent...');
    const intent = await nlp.extractIntent(parsed.tokens);
    console.log(`   Strategy Type: ${intent.strategyType}`);
    console.log(`   Indicators: ${intent.indicators.join(', ')}`);
    console.log(`   Actions: ${intent.actions.join(', ')}`);

    // Step 3: Extract parameters
    console.log('Step 3: Extracting parameters...');
    const parameters = await nlp.extractParameters(parsed.entities);
    console.log(`   Parameters: ${Object.keys(parameters).length}`);

    // Step 4: Create blueprint
    console.log('Step 4: Creating strategy blueprint...');
    const blueprint = await interpreter.interpretIntent(intent, parameters);
    console.log(`   Components: ${blueprint.components.length}`);
    console.log(`   Flow connections: ${blueprint.flow.length}`);

    // Step 5: Build visual strategy
    console.log('Step 5: Building visual strategy...');
    const buildResult = await builder.buildStrategy(blueprint);
    console.log(`   Nodes: ${buildResult.nodes.length}`);
    console.log(`   Edges: ${buildResult.edges.length}`);

    console.log('✅ Step-by-step processing completed successfully');
    return buildResult;
  } catch (error) {
    console.error('❌ Step-by-step processing failed:', error);
    throw error;
  }
}

// Example 3: Integration with Existing Builder
export async function builderIntegration() {
  console.log('🔗 Builder Integration Example');

  // Mock existing builder store (replace with actual import)
  const mockBuilderStore = {
    addNode: (node: any) => console.log(`   Added node: ${node.type}`),
    addEdge: (edge: any) => console.log(`   Added edge: ${edge.source} -> ${edge.target}`),
    getNodes: () => [],
    getEdges: () => []
  };

  const ai = new PineGenieAI();

  try {
    // Generate strategy
    const result = await ai.processUserInput("Create a simple moving average crossover");

    // Integrate with existing builder
    console.log('Integrating with existing builder...');
    
    // Add nodes to builder
    result.nodes?.forEach(node => {
      mockBuilderStore.addNode({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      });
    });

    // Add edges to builder
    result.edges?.forEach(edge => {
      mockBuilderStore.addEdge({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      });
    });

    console.log('✅ Builder integration completed');
    return result;
  } catch (error) {
    console.error('❌ Builder integration failed:', error);
    throw error;
  }
}

// Example 4: Chat Interface Usage
export function chatInterfaceExample() {
  console.log('💬 Chat Interface Example');

  // This would be used in a React component
  const chatConfig = {
    onStrategyGenerated: (strategy: any) => {
      console.log('🎯 Strategy generated from chat:', strategy.name);
      // Integrate with your builder here
    },
    
    onError: (error: any) => {
      console.error('💥 Chat error:', error.message);
      // Handle error in your UI
    },
    
    enableAnimations: true,
    enableVoiceInput: false,
    maxMessages: 100
  };

  console.log('Chat interface configuration ready');
  console.log('Use this config with: <ChatInterface {...chatConfig} />');
  
  return chatConfig;
}

// Example 5: Error Handling
export async function errorHandlingExample() {
  console.log('⚠️ Error Handling Example');

  const ai = new PineGenieAI();

  // Test various error scenarios
  const testCases = [
    "", // Empty input
    "asdfgh random text", // Unclear input
    "Create strategy with RSI > 150", // Invalid parameter
    "Make me rich quickly" // Vague request
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase}"`);
      const result = await ai.processUserInput(testCase);
      
      if (result.needsClarification) {
        console.log('   ❓ Needs clarification');
        console.log(`   Questions: ${result.clarificationQuestions?.join(', ')}`);
      } else {
        console.log('   ✅ Processed successfully');
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      
      // Handle specific error types
      if (error.type === 'validation-error') {
        console.log(`   💡 Suggestions: ${error.suggestions?.join(', ')}`);
      } else if (error.type === 'low-confidence') {
        console.log(`   📊 Confidence: ${error.confidence}`);
      }
    }
  }

  console.log('Error handling examples completed');
}

// Example 6: Performance Monitoring
export async function performanceMonitoringExample() {
  console.log('📊 Performance Monitoring Example');

  const ai = new PineGenieAI({
    performanceMode: 'optimized'
  });

  // Monitor performance of strategy generation
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const result = await ai.processUserInput("Create RSI strategy with MACD confirmation");
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    // Calculate metrics
    const processingTime = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    
    console.log('Performance Metrics:');
    console.log(`   Processing Time: ${processingTime.toFixed(2)}ms`);
    console.log(`   Memory Used: ${(memoryUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Strategy Complexity: ${result.strategy?.components?.length || 0} components`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    
    return {
      processingTime,
      memoryUsed,
      confidence: result.confidence,
      complexity: result.strategy?.components?.length || 0
    };
  } catch (error) {
    console.error('❌ Performance monitoring failed:', error);
    throw error;
  }
}

// Example 7: Batch Processing
export async function batchProcessingExample() {
  console.log('📦 Batch Processing Example');

  const ai = new PineGenieAI();
  
  const requests = [
    "Create RSI strategy",
    "Build MACD crossover",
    "Make Bollinger Bands strategy",
    "Simple moving average strategy",
    "Stochastic oscillator strategy"
  ];

  console.log(`Processing ${requests.length} strategy requests...`);

  try {
    const results = await Promise.all(
      requests.map(async (request, index) => {
        try {
          const result = await ai.processUserInput(request);
          console.log(`   ✅ ${index + 1}. ${request} -> ${result.strategy.name}`);
          return { success: true, request, result };
        } catch (error: any) {
          console.log(`   ❌ ${index + 1}. ${request} -> Error: ${error.message}`);
          return { success: false, request, error: error.message };
        }
      })
    );

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\nBatch Processing Summary:`);
    console.log(`   Successful: ${successful}/${requests.length}`);
    console.log(`   Failed: ${failed}/${requests.length}`);
    console.log(`   Success Rate: ${(successful / requests.length * 100).toFixed(1)}%`);

    return results;
  } catch (error) {
    console.error('❌ Batch processing failed:', error);
    throw error;
  }
}

// Main function to run all examples
export async function runAllExamples() {
  console.log('🎬 Running All PineGenie AI Examples\n');

  try {
    await basicStrategyGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await stepByStepProcessing();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await builderIntegration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    chatInterfaceExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await errorHandlingExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await performanceMonitoringExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await batchProcessingExample();
    
    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('\n💥 Example execution failed:', error);
  }
}

// Export individual examples for selective usage
export {
  basicStrategyGeneration,
  stepByStepProcessing,
  builderIntegration,
  chatInterfaceExample,
  errorHandlingExample,
  performanceMonitoringExample,
  batchProcessingExample
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}