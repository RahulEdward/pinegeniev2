/**
 * Retention Policy Service Tests
 */
import { RetentionPolicyService, scheduleRetentionPolicy } from '../retention-policy';
import { ConversationRepository } from '../conversation-repository';

// Mock ConversationRepository
jest.mock('../conversation-repository');

describe('RetentionPolicyService', () => {
  let service: RetentionPolicyService;
  let repository: jest.Mocked<ConversationRepository>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ConversationRepository() as jest.Mocked<ConversationRepository>;
    service = new RetentionPolicyService(repository);
  });
  
  describe('constructor', () => {
    it('should use default retention period when not specified', () => {
      // Act
      const service = new RetentionPolicyService(repository);
      
      // Assert
      expect(service.getRetentionPeriod()).toBe(90);
    });
    
    it('should use specified retention period', () => {
      // Act
      const service = new RetentionPolicyService(repository, 60);
      
      // Assert
      expect(service.getRetentionPeriod()).toBe(60);
    });
  });
  
  describe('setRetentionPeriod', () => {
    it('should update the retention period', () => {
      // Act
      service.setRetentionPeriod(45);
      
      // Assert
      expect(service.getRetentionPeriod()).toBe(45);
    });
    
    it('should throw error for invalid retention period', () => {
      // Act & Assert
      expect(() => service.setRetentionPeriod(0)).toThrow('Retention period must be at least 1 day');
      expect(() => service.setRetentionPeriod(-10)).toThrow('Retention period must be at least 1 day');
    });
  });
  
  describe('applyRetentionPolicy', () => {
    it('should call repository to delete old conversations', async () => {
      // Arrange
      repository.deleteOldConversations = jest.fn().mockResolvedValue(5);
      
      // Act
      const result = await service.applyRetentionPolicy();
      
      // Assert
      expect(result).toBe(5);
      expect(repository.deleteOldConversations).toHaveBeenCalledWith(90);
    });
    
    it('should handle errors from repository', async () => {
      // Arrange
      const error = new Error('Database error');
      repository.deleteOldConversations = jest.fn().mockRejectedValue(error);
      
      // Act & Assert
      await expect(service.applyRetentionPolicy()).rejects.toThrow('Database error');
    });
  });
  
  describe('scheduleRetentionPolicy', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should apply policy immediately on startup', () => {
      // Arrange
      service.applyRetentionPolicy = jest.fn().mockResolvedValue(3);
      
      // Act
      scheduleRetentionPolicy(service);
      
      // Assert
      expect(service.applyRetentionPolicy).toHaveBeenCalledTimes(1);
    });
    
    it('should schedule regular policy application', () => {
      // Arrange
      service.applyRetentionPolicy = jest.fn().mockResolvedValue(3);
      
      // Act
      scheduleRetentionPolicy(service, 12);
      
      // Fast-forward time
      jest.advanceTimersByTime(12 * 60 * 60 * 1000);
      
      // Assert
      expect(service.applyRetentionPolicy).toHaveBeenCalledTimes(2);
    });
  });
});