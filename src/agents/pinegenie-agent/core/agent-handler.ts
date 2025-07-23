/**
 * Agent Handler
 * 
 * Main entry point for the Kiro-Style Pine Script Agent.
 * Processes user messages and manages conversation flow.
 */

import { PineScriptGenerator } from './pine-generator/generator';
import { VoiceProcessor } from './voice-processor/processor';
import { ContextManager } from './context-manager/manager';
import { LLMService } from '../services/llm/service';
import { ConversationRepository } from '../services/database/conversation-repository';
import type { AgentResponse, ConversationContext, Message } from '../types/agent';

/**
 * Agent Handler class that processes user messages and manages conversation flow
 */
export class AgentHandler {
  private pineGenerator: PineScriptGenerator;
  private voiceProcessor: VoiceProcessor;
  private contextManager: ContextManager;
  private llmService: LLMService;
  private conversationRepository: ConversationRepository;

  /**
   * Creates a new instance of the AgentHandler
   */
  constructor() {
    this.pineGenerator = new PineScriptGenerator();
    this.voiceProcessor = new VoiceProcessor();
    this.contextManager = new ContextManager();
    this.llmService = new LLMService();
    this.conversationRepository = new ConversationRepository();
  }

  /**
   * Processes a user message and generates an appropriate response
   * 
   * @param message - The user message to process
   * @param context - The conversation context
   * @returns A promise that resolves to an agent response
   */
  public async processMessage(message: string, context: ConversationContext): Promise<AgentResponse> {
    try {
      // Update context with the new message
      context.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Persist the updated context
      await this.contextManager.updateContext(context.sessionId, context);
      await this.conversationRepository.saveMessage({
        conversationId: context.sessionId,
        role: 'user',
        content: message
      });

      // Generate a response using the LLM service
      const llmResponse = await this.llmService.generateCompletion({
        prompt: this.buildPrompt(context),
        temperature: 0.7,
        maxTokens: 1000
      });

      // Check if code generation is needed
      let generatedCode = undefined;
      if (this.shouldGenerateCode(message, context)) {
        generatedCode = await this.pineGenerator.generateFromPrompt(message, context.currentStrategy);
      }

      // Create the agent response
      const agentResponse: AgentResponse = {
        message: llmResponse.text,
        code: generatedCode,
        suggestions: this.generateSuggestions(context),
        nextSteps: this.determineNextSteps(context),
        requiresInput: this.requiresUserInput(llmResponse.text),
        voiceResponse: await this.generateVoiceResponseIfNeeded(llmResponse.text, context)
      };

      // Update context with the agent response
      context.conversationHistory.push({
        role: 'agent',
        content: agentResponse.message,
        timestamp: new Date(),
        code: generatedCode
      });

      // Persist the updated context
      await this.contextManager.updateContext(context.sessionId, context);
      await this.conversationRepository.saveMessage({
        conversationId: context.sessionId,
        role: 'agent',
        content: agentResponse.message,
        metadata: { code: generatedCode }
      });

      return agentResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
        suggestions: ['Try a different approach', 'Simplify your request', 'Contact support if the issue persists'],
        nextSteps: [],
        requiresInput: true
      };
    }
  }

  /**
   * Maintains the conversation context for a session
   * 
   * @param sessionId - The session ID
   * @returns A promise that resolves to the conversation context
   */
  public async maintainContext(sessionId: string): Promise<ConversationContext> {
    try {
      // Try to retrieve existing context
      const existingContext = await this.contextManager.getContext(sessionId);
      if (existingContext) {
        return existingContext;
      }

      // Create a new context if none exists
      const newContext: ConversationContext = {
        sessionId,
        userId: '',
        conversationHistory: [],
        preferences: {
          voiceEnabled: false,
          theme: 'light',
          codePreviewEnabled: true
        },
        progressSteps: []
      };

      await this.contextManager.updateContext(sessionId, newContext);
      return newContext;
    } catch (error) {
      console.error('Error maintaining context:', error);
      throw error;
    }
  }

  /**
   * Tracks progress for a conversation
   * 
   * @param sessionId - The session ID
   * @param step - The progress step to track
   */
  public async trackProgress(sessionId: string, step: string): Promise<void> {
    try {
      const context = await this.contextManager.getContext(sessionId);
      if (!context) {
        throw new Error(`Context not found for session ${sessionId}`);
      }

      context.progressSteps.push({
        step,
        timestamp: new Date()
      });

      await this.contextManager.updateContext(sessionId, context);
    } catch (error) {
      console.error('Error tracking progress:', error);
      throw error;
    }
  }

  /**
   * Generates follow-up suggestions based on the conversation context
   * 
   * @param context - The conversation context
   * @returns An array of follow-up suggestions
   */
  public generateFollowUp(context: ConversationContext): string[] {
    // Implementation will depend on the specific requirements
    return [
      'Modify the strategy parameters',
      'Add risk management controls',
      'Optimize the code for performance',
      'Export the strategy to TradingView'
    ];
  }

  /**
   * Builds a prompt for the LLM service based on the conversation context
   * 
   * @param context - The conversation context
   * @returns The prompt for the LLM service
   */
  private buildPrompt(context: ConversationContext): string {
    // Implementation will depend on the specific requirements
    const conversationHistory = context.conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Agent'}: ${msg.content}`)
      .join('\n');

    return `
You are a Kiro-Style Pine Script Agent that helps users create trading strategies using Pine Script v6.
The user is having the following conversation with you:

${conversationHistory}

Based on this conversation, provide a helpful response that guides the user through the strategy creation process.
If the user is asking for code generation, focus on understanding their requirements before generating code.
If the user has a specific question about Pine Script, provide a clear and concise explanation.
`;
  }

  /**
   * Determines if code generation is needed based on the message and context
   * 
   * @param message - The user message
   * @param context - The conversation context
   * @returns True if code generation is needed, false otherwise
   */
  private shouldGenerateCode(message: string, context: ConversationContext): boolean {
    // Implementation will depend on the specific requirements
    const codeGenerationKeywords = [
      'generate', 'create', 'build', 'write', 'code', 'script', 'strategy', 'indicator'
    ];

    return codeGenerationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  /**
   * Generates suggestions based on the conversation context
   * 
   * @param context - The conversation context
   * @returns An array of suggestions
   */
  private generateSuggestions(context: ConversationContext): string[] {
    // Implementation will depend on the specific requirements
    return [
      'Tell me more about trend following strategies',
      'How do I add a stop loss to my strategy?',
      'Can you explain the RSI indicator?',
      'Show me an example of a breakout strategy'
    ];
  }

  /**
   * Determines the next steps based on the conversation context
   * 
   * @param context - The conversation context
   * @returns An array of next steps
   */
  private determineNextSteps(context: ConversationContext): string[] {
    // Implementation will depend on the specific requirements
    return [
      'Define strategy parameters',
      'Add technical indicators',
      'Implement entry and exit conditions',
      'Add risk management controls'
    ];
  }

  /**
   * Determines if user input is required based on the agent message
   * 
   * @param message - The agent message
   * @returns True if user input is required, false otherwise
   */
  private requiresUserInput(message: string): boolean {
    // Implementation will depend on the specific requirements
    const questionKeywords = ['?', 'what', 'how', 'when', 'where', 'why', 'which', 'who', 'can you', 'could you'];
    return questionKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  /**
   * Generates a voice response if needed
   * 
   * @param message - The agent message
   * @param context - The conversation context
   * @returns A promise that resolves to an audio buffer or undefined
   */
  private async generateVoiceResponseIfNeeded(message: string, context: ConversationContext): Promise<AudioBuffer | undefined> {
    if (context.preferences.voiceEnabled) {
      return this.voiceProcessor.generateVoiceResponse(message);
    }
    return undefined;
  }
}