/**
 * Conversation Repository
 * 
 * Provides database access for agent conversations.
 */
import { PrismaClient } from '@prisma/client';
import type { ConversationContext, Message as AgentMessage } from '../../types/agent';

// Initialize Prisma client
const prisma = new PrismaClient();
/**
 *
 Conversation interface
 */
export interface Conversation {
  /**
   * The conversation ID
   */
  id: string;

  /**
   * The session ID
   */
  sessionId: string;

  /**
   * The user ID
   */
  userId: string;

  /**
   * The agent type
   */
  agentType: string;

  /**
   * The conversation context
   */
  context: any;

  /**
   * The conversation messages
   */
  messages: Message[];

  /**
   * The creation timestamp
   */
  createdAt: Date;

  /**
   * The update timestamp
   */
  updatedAt: Date;
}

/**
 * Message interface
 */
export interface Message {
  /**
   * The message ID
   */
  id: string;

  /**
   * The conversation ID
   */
  conversationId: string;

  /**
   * The role of the message sender
   */
  role: 'USER' | 'AGENT' | 'SYSTEM';

  /**
   * The message content
   */
  content: string;

  /**
   * The message metadata
   */
  metadata?: any;

  /**
   * The creation timestamp
   */
  createdAt: Date;
}
/**
 * S
ave conversation options interface
 */
export interface SaveConversationOptions {
  /**
   * The session ID
   */
  sessionId: string;

  /**
   * The user ID
   */
  userId: string;

  /**
   * The agent type
   */
  agentType?: string;

  /**
   * The conversation context
   */
  context?: any;
}

/**
 * Save message options interface
 */
export interface SaveMessageOptions {
  /**
   * The conversation ID
   */
  conversationId: string;

  /**
   * The role of the message sender
   */
  role: 'USER' | 'AGENT' | 'SYSTEM';

  /**
   * The message content
   */
  content: string;

  /**
   * The message metadata
   */
  metadata?: any;
}

/**
 * Generated code options interface
 */
export interface SaveGeneratedCodeOptions {
  /**
   * The conversation ID
   */
  conversationId: string;

  /**
   * The user ID
   */
  userId: string;

  /**
   * The generated code
   */
  code: string;

  /**
   * The code version
   */
  version?: number;

  /**
   * The validation status
   */
  validationStatus?: string;

  /**
   * The code metadata
   */
  metadata?: any;
}/
  **
 * Conversation repository class that provides database access for agent conversations
  */
export class ConversationRepository {
    /**
     * Creates a new instance of the ConversationRepository
     */
    constructor() {
      // Prisma client is already initialized
    }

    /**
     * Gets a conversation by session ID
     * 
     * @param sessionId - The session ID
     * @returns A promise that resolves to the conversation or undefined
     */
    public async getConversationBySessionId(sessionId: string): Promise<Conversation | undefined> {
      try {
        const conversation = await prisma.agentConversation.findUnique({
          where: {
            sessionId: sessionId
          },
          include: {
            messages: true
          }
        });

        if (!conversation) {
          return undefined;
        }

        return {
          id: conversation.id,
          sessionId: conversation.sessionId,
          userId: conversation.userId,
          agentType: conversation.agentType,
          context: conversation.context,
          messages: conversation.messages.map(message => ({
            id: message.id,
            conversationId: message.conversationId,
            role: message.role as 'USER' | 'AGENT' | 'SYSTEM',
            content: message.content,
            metadata: message.metadata,
            createdAt: message.createdAt
          })),
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        };
      } catch (error) {
        console.error('Error getting conversation:', error);
        throw error;
      }
    }  /**

   * Saves a conversation
   * 
   * @param options - The save conversation options
   * @returns A promise that resolves to the created conversation
   */
    public async saveConversation(options: SaveConversationOptions): Promise<Conversation> {
      try {
        // Check if conversation already exists
        const existingConversation = await prisma.agentConversation.findUnique({
          where: {
            sessionId: options.sessionId
          }
        });

        if (existingConversation) {
          // Update existing conversation
          const updatedConversation = await prisma.agentConversation.update({
            where: {
              id: existingConversation.id
            },
            data: {
              context: options.context || existingConversation.context,
              updatedAt: new Date()
            },
            include: {
              messages: true
            }
          });

          return {
            id: updatedConversation.id,
            sessionId: updatedConversation.sessionId,
            userId: updatedConversation.userId,
            agentType: updatedConversation.agentType,
            context: updatedConversation.context,
            messages: updatedConversation.messages.map(message => ({
              id: message.id,
              conversationId: message.conversationId,
              role: message.role as 'USER' | 'AGENT' | 'SYSTEM',
              content: message.content,
              metadata: message.metadata,
              createdAt: message.createdAt
            })),
            createdAt: updatedConversation.createdAt,
            updatedAt: updatedConversation.updatedAt
          };
        }

        // Create new conversation
        const newConversation = await prisma.agentConversation.create({
          data: {
            userId: options.userId,
            sessionId: options.sessionId,
            agentType: options.agentType || 'pinescript',
            context: options.context || {}
          },
          include: {
            messages: true
          }
        });

        return {
          id: newConversation.id,
          sessionId: newConversation.sessionId,
          userId: newConversation.userId,
          agentType: newConversation.agentType,
          context: newConversation.context,
          messages: [],
          createdAt: newConversation.createdAt,
          updatedAt: newConversation.updatedAt
        };
      } catch (error) {
        console.error('Error saving conversation:', error);
        throw error;
      }
    }
    /**
      * Saves a message
      * 
      * @param options - The save message options
      * @returns A promise that resolves to the created message
      */
    public async saveMessage(options: SaveMessageOptions): Promise<Message> {
      try {
        const message = await prisma.agentMessage.create({
          data: {
            conversationId: options.conversationId,
            role: options.role,
            content: options.content,
            metadata: options.metadata || {}
          }
        });

        // Update conversation updatedAt timestamp
        await prisma.agentConversation.update({
          where: {
            id: options.conversationId
          },
          data: {
            updatedAt: new Date()
          }
        });

        return {
          id: message.id,
          conversationId: message.conversationId,
          role: message.role as 'USER' | 'AGENT' | 'SYSTEM',
          content: message.content,
          metadata: message.metadata,
          createdAt: message.createdAt
        };
      } catch (error) {
        console.error('Error saving message:', error);
        throw error;
      }
    }

    /**
     * Gets messages for a conversation
     * 
     * @param conversationId - The conversation ID
     * @returns A promise that resolves to the messages
     */
    public async getMessages(conversationId: string): Promise<Message[]> {
      try {
        const messages = await prisma.agentMessage.findMany({
          where: {
            conversationId: conversationId
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        return messages.map(message => ({
          id: message.id,
          conversationId: message.conversationId,
          role: message.role as 'USER' | 'AGENT' | 'SYSTEM',
          content: message.content,
          metadata: message.metadata,
          createdAt: message.createdAt
        }));
      } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
      }
    }  /**
 
  * Saves generated code
   * 
   * @param options - The save generated code options
   * @returns A promise that resolves to the created code record
   */
    public async saveGeneratedCode(options: SaveGeneratedCodeOptions): Promise<any> {
      try {
        // Get the latest version for this conversation
        const latestVersion = await prisma.generatedPineCode.findFirst({
          where: {
            conversationId: options.conversationId
          },
          orderBy: {
            version: 'desc'
          }
        });

        const version = options.version || (latestVersion ? latestVersion.version + 1 : 1);

        const generatedCode = await prisma.generatedPineCode.create({
          data: {
            conversationId: options.conversationId,
            userId: options.userId,
            code: options.code,
            version: version,
            validationStatus: options.validationStatus || 'pending',
            metadata: options.metadata || {}
          }
        });

        return generatedCode;
      } catch (error) {
        console.error('Error saving generated code:', error);
        throw error;
      }
    }

    /**
     * Gets generated code for a conversation
     * 
     * @param conversationId - The conversation ID
     * @returns A promise that resolves to the generated code
     */
    public async getGeneratedCode(conversationId: string): Promise<any[]> {
      try {
        const generatedCode = await prisma.generatedPineCode.findMany({
          where: {
            conversationId: conversationId
          },
          orderBy: {
            version: 'asc'
          }
        });

        return generatedCode;
      } catch (error) {
        console.error('Error getting generated code:', error);
        throw error;
      }
    }
    /**
      * Deletes old conversations based on retention policy
      * 
      * @param retentionDays - The number of days to retain conversations
      * @returns A promise that resolves to the number of deleted conversations
      */
    public async deleteOldConversations(retentionDays: number): Promise<number> {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // First, get the IDs of conversations to delete
        const conversationsToDelete = await prisma.agentConversation.findMany({
          where: {
            updatedAt: {
              lt: cutoffDate
            }
          },
          select: {
            id: true
          }
        });

        const conversationIds = conversationsToDelete.map(c => c.id);

        // Delete related records first
        await prisma.agentMessage.deleteMany({
          where: {
            conversationId: {
              in: conversationIds
            }
          }
        });

        await prisma.generatedPineCode.deleteMany({
          where: {
            conversationId: {
              in: conversationIds
            }
          }
        });

        // Then delete the conversations
        const result = await prisma.agentConversation.deleteMany({
          where: {
            id: {
              in: conversationIds
            }
          }
        });

        return result.count;
      } catch (error) {
        console.error('Error deleting old conversations:', error);
        throw error;
      }
    }  /**

   * Converts agent message format to database message format
   * 
   * @param message - The agent message
   * @param conversationId - The conversation ID
   * @returns The database message
   */
    public convertAgentMessageToDbMessage(message: AgentMessage, conversationId: string): SaveMessageOptions {
      return {
        conversationId,
        role: message.role === 'user' ? 'USER' : message.role === 'agent' ? 'AGENT' : 'SYSTEM',
        content: message.content,
        metadata: message.code ? { code: message.code } : undefined
      };
    }

    /**
     * Converts database message format to agent message format
     * 
     * @param message - The database message
     * @returns The agent message
     */
    public convertDbMessageToAgentMessage(message: Message): AgentMessage {
      return {
        role: message.role === 'USER' ? 'user' : message.role === 'AGENT' ? 'agent' : 'system',
        content: message.content,
        timestamp: message.createdAt,
        code: message.metadata?.code
      };
    }

    /**
     * Converts conversation context to database context
     * 
     * @param context - The conversation context
     * @returns The database context
     */
    public convertContextToDbContext(context: ConversationContext): any {
      return {
        userId: context.userId,
        currentStrategy: context.currentStrategy,
        preferences: context.preferences,
        progressSteps: context.progressSteps.map(step => ({
          step: step.step,
          timestamp: step.timestamp.toISOString()
        }))
      };
    }

    /**
     * Converts database context to conversation context
     * 
     * @param dbContext - The database context
     * @param sessionId - The session ID
     * @param messages - The messages
     * @returns The conversation context
     */
    public convertDbContextToContext(dbContext: any, sessionId: string, messages: AgentMessage[]): ConversationContext {
      return {
        sessionId,
        userId: dbContext.userId,
        conversationHistory: messages,
        currentStrategy: dbContext.currentStrategy,
        preferences: dbContext.preferences || {
          voiceEnabled: false,
          theme: 'system',
          codePreviewEnabled: true
        },
        progressSteps: (dbContext.progressSteps || []).map((step: any) => ({
          step: step.step,
          timestamp: new Date(step.timestamp)
        }))
      };
    }
  }