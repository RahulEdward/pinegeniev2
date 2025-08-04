// Simple test to verify chat functionality
const { ResponseGenerator } = require('./services/response-generator');
const { ConversationManager } = require('./services/conversation-manager');

async function testChatSystem() {
  console.log('Testing PineGenie AI Chat System...\n');

  // Test Response Generator
  const responseGenerator = new ResponseGenerator();
  
  console.log('1. Testing RSI strategy request...');
  try {
    const rsiResponse = await responseGenerator.generateResponse('Create a RSI strategy that buys when RSI is below 30');
    console.log('✅ RSI Response:', rsiResponse.message.substring(0, 100) + '...');
    console.log('   Actions:', rsiResponse.actions.map(a => a.label).join(', '));
    console.log('   Strategy Preview:', rsiResponse.strategyPreview?.name);
  } catch (error) {
    console.log('❌ RSI test failed:', error.message);
  }

  console.log('\n2. Testing MACD strategy request...');
  try {
    const macdResponse = await responseGenerator.generateResponse('Build a MACD crossover strategy with stop loss');
    console.log('✅ MACD Response:', macdResponse.message.substring(0, 100) + '...');
    console.log('   Actions:', macdResponse.actions.map(a => a.label).join(', '));
    console.log('   Strategy Preview:', macdResponse.strategyPreview?.name);
  } catch (error) {
    console.log('❌ MACD test failed:', error.message);
  }

  console.log('\n3. Testing help request...');
  try {
    const helpResponse = await responseGenerator.generateResponse('What can you help me with?');
    console.log('✅ Help Response:', helpResponse.message.substring(0, 100) + '...');
    console.log('   Actions:', helpResponse.actions.map(a => a.label).join(', '));
  } catch (error) {
    console.log('❌ Help test failed:', error.message);
  }

  // Test Conversation Manager
  console.log('\n4. Testing Conversation Manager...');
  try {
    const conversationManager = new ConversationManager();
    const conversation = conversationManager.createConversation();
    console.log('✅ Created conversation:', conversation.id);
    
    const testMessage = {
      id: 'test-1',
      type: 'user-input',
      content: 'Test message',
      timestamp: new Date()
    };
    
    conversationManager.addMessageToConversation(conversation.id, testMessage);
    const retrieved = conversationManager.getConversation(conversation.id);
    console.log('✅ Message added and retrieved:', retrieved.messages.length, 'messages');
  } catch (error) {
    console.log('❌ Conversation Manager test failed:', error.message);
  }

  console.log('\n🎉 Chat system testing complete!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testChatSystem().catch(console.error);
}

module.exports = { testChatSystem };