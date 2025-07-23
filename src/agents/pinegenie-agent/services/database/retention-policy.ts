/**
 * Retention Policy Service
 * 
 * Implements data retention policies for agent conversations.
 */
import { ConversationRepository } from './conversation-repository';

/**
 * Default retention period in days
 */
const DEFAULT_RETENTION_DAYS = 90;

/**
 * Retention policy service class
 */
export class RetentionPolicyService {
  private repository: ConversationRepository;
  private retentionDays: number;

  /**
   * Creates a new instance of the RetentionPolicyService
   * 
   * @param repository - The conversation repository
   * @param retentionDays - The number of days to retain conversations (default: 90)
   */
  constructor(repository: ConversationRepository, retentionDays: number = DEFAULT_RETENTION_DAYS) {
    this.repository = repository;
    this.retentionDays = retentionDays;
  }

  /**
   * Applies the retention policy
   * 
   * @returns A promise that resolves to the number of deleted conversations
   */
  public async applyRetentionPolicy(): Promise<number> {
    try {
      console.log(`Applying retention policy: deleting conversations older than ${this.retentionDays} days`);
      
      const deletedCount = await this.repository.deleteOldConversations(this.retentionDays);
      
      console.log(`Deleted ${deletedCount} old conversations`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error applying retention policy:', error);
      throw error;
    }
  }

  /**
   * Sets the retention period
   * 
   * @param days - The number of days to retain conversations
   */
  public setRetentionPeriod(days: number): void {
    if (days < 1) {
      throw new Error('Retention period must be at least 1 day');
    }
    
    this.retentionDays = days;
  }

  /**
   * Gets the current retention period
   * 
   * @returns The number of days conversations are retained
   */
  public getRetentionPeriod(): number {
    return this.retentionDays;
  }
}

/**
 * Creates a scheduled job to apply the retention policy
 * 
 * @param service - The retention policy service
 * @param intervalHours - The interval in hours between policy applications (default: 24)
 * @returns The interval ID
 */
export function scheduleRetentionPolicy(
  service: RetentionPolicyService,
  intervalHours: number = 24
): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling retention policy to run every ${intervalHours} hours`);
  
  // Apply immediately on startup
  service.applyRetentionPolicy().catch(error => {
    console.error('Error applying retention policy on startup:', error);
  });
  
  // Schedule regular application
  return setInterval(() => {
    service.applyRetentionPolicy().catch(error => {
      console.error('Error applying scheduled retention policy:', error);
    });
  }, intervalMs);
}