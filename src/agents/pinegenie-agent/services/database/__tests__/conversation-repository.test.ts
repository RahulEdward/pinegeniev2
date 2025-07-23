/**
 * Conversation Repository Tests
 */
import { ConversationRepository, SaveConversationOptions, SaveMessageOptions } from '../conversation-repository';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockAgentConversation = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  };
  
  const mockAgentMessage = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };
  
  const mockGeneratedPineCode = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      agentConversation: mockAgentConversation,
      agentMessage: mockAgentMessage,
      generatedPineCode: mockGeneratedPineCode,
    })),
  };
});

describe('ConversationRepository', () => {
  let repository: ConversationRepository;
  let prisma: PrismaClient;
  
  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ConversationRepository();
    prisma = new PrismaClient();
  });
  
  describe('getConversationBySessionId', () => {
    it('should return undefined when conversation not found', async () => {
      // Arrange
      prisma.agentConversation.findUnique = jest.fn().mockResolvedValue(null);
      
      // Act
      const result = await repository.getConversationBySessionId('test-session');
      
      // Assert
      expect(result).toBeUndefined();
      expect(prisma.agentConversation.findUnique).toHaveBeenCalledWith({
        where: { sessionId: 'test-session' },
        include: { messages: true },
      });
    });
    
    it('should return conversation when found', async () => {
      // Arrange
      const mockConversation = {
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            role: 'USER',
            content: 'Hello',
            metadata: {},
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.agentConversation.findUnique = jest.fn().mockResolvedValue(mockConversation);
      
      // Act
      const result = await repository.getConversationBySessionId('test-session');
      
      // Assert
      expect(result).toEqual({
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
        messages: [
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            role: 'USER',
            content: 'Hello',
            metadata: {},
            createdAt: expect.any(Date),
          },
        ],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
  
  describe('saveConversation', () => {
    it('should create a new conversation when it does not exist', async () => {
      // Arrange
      const options: SaveConversationOptions = {
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
      };
      
      prisma.agentConversation.findUnique = jest.fn().mockResolvedValue(null);
      
      const mockCreatedConversation = {
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.agentConversation.create = jest.fn().mockResolvedValue(mockCreatedConversation);
      
      // Act
      const result = await repository.saveConversation(options);
      
      // Assert
      expect(result).toEqual({
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
        messages: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      expect(prisma.agentConversation.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          sessionId: 'test-session',
          agentType: 'pinescript',
          context: { test: true },
        },
        include: {
          messages: true,
        },
      });
    });
    
    it('should update an existing conversation', async () => {
      // Arrange
      const options: SaveConversationOptions = {
        sessionId: 'test-session',
        userId: 'user-1',
        context: { updated: true },
      };
      
      const existingConversation = {
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { test: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      prisma.agentConversation.findUnique = jest.fn().mockResolvedValue(existingConversation);
      
      const updatedConversation = {
        ...existingConversation,
        context: { updated: true },
        messages: [],
      };
      
      prisma.agentConversation.update = jest.fn().mockResolvedValue(updatedConversation);
      
      // Act
      const result = await repository.saveConversation(options);
      
      // Assert
      expect(result).toEqual({
        id: 'conv-1',
        sessionId: 'test-session',
        userId: 'user-1',
        agentType: 'pinescript',
        context: { updated: true },
        messages: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      
      expect(prisma.agentConversation.update).toHaveBeenCalledWith({
        where: {
          id: 'conv-1',
        },
        data: {
          context: { updated: true },
          updatedAt: expect.any(Date),
        },
        include: {
          messages: true,
        },
      });
    });
  });
  
  describe('deleteOldConversations', () => {
    it('should delete conversations older than the retention period', async () => {
      // Arrange
      const conversationsToDelete = [
        { id: 'conv-1' },
        { id: 'conv-2' },
      ];
      
      prisma.agentConversation.findMany = jest.fn().mockResolvedValue(conversationsToDelete);
      prisma.agentMessage.deleteMany = jest.fn().mockResolvedValue({ count: 5 });
      prisma.generatedPineCode.deleteMany = jest.fn().mockResolvedValue({ count: 3 });
      prisma.agentConversation.deleteMany = jest.fn().mockResolvedValue({ count: 2 });
      
      // Act
      const result = await repository.deleteOldConversations(30);
      
      // Assert
      expect(result).toBe(2);
      
      expect(prisma.agentConversation.findMany).toHaveBeenCalledWith({
        where: {
          updatedAt: {
            lt: expect.any(Date),
          },
        },
        select: {
          id: true,
        },
      });
      
      expect(prisma.agentMessage.deleteMany).toHaveBeenCalledWith({
        where: {
          conversationId: {
            in: ['conv-1', 'conv-2'],
          },
        },
      });
      
      expect(prisma.generatedPineCode.deleteMany).toHaveBeenCalledWith({
        where: {
          conversationId: {
            in: ['conv-1', 'conv-2'],
          },
        },
      });
      
      expect(prisma.agentConversation.deleteMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['conv-1', 'conv-2'],
          },
        },
      });
    });
  });
});