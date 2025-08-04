/**
 * Replay System for PineGenie AI Animations
 * 
 * This module provides replay functionality with detailed explanations,
 * learning modes, progress tracking, and interactive features for educational purposes.
 * 
 * SAFE INTEGRATION: Uses existing animation systems without modification
 * PROTECTION: No changes to existing replay or learning systems
 * 
 * Requirements: 3.3, 3.4
 */

import { AnimationSequence, AnimationStep } from '../types/animation-types';
import { GeneratedExplanation } from './explanation-generator';

export interface ReplayConfig {
  /** Playback settings */
  playback: {
    defaultSpeed: number;
    minSpeed: number;
    maxSpeed: number;
    enableVariableSpeed: boolean;
    enableStepByStep: boolean;
    enableAutoAdvance: boolean;
    autoAdvanceDelay: number;
  };
  
  /** Learning features */
  learning: {
    enableQuizzes: boolean;
    enableProgressTracking: boolean;
    enableBookmarks: boolean;
    enableNotes: boolean;
    enableHighlights: boolean;
    requireQuizCompletion: boolean;
    adaptiveDifficulty: boolean;
  };
  
  /** Interactive features */
  interaction: {
    enablePause: boolean;
    enableRewind: boolean;
    enableSkip: boolean;
    enableJumpToStep: boolean;
    enableLooping: boolean;
    enableChapters: boolean;
  };
  
  /** Visual settings */
  visual: {
    showProgress: boolean;
    showTimeline: boolean;
    showStepNumbers: boolean;
    showExplanations: boolean;
    highlightCurrentStep: boolean;
    enableThumbnails: boolean;
  };
  
  /** Accessibility */
  accessibility: {
    enableCaptions: boolean;
    enableAudioDescription: boolean;
    enableKeyboardNavigation: boolean;
    enableScreenReaderSupport: boolean;
    enableHighContrast: boolean;
  };
}

export interface ReplaySession {
  id: string;
  name: string;
  sequence: AnimationSequence;
  explanations: Map<string, GeneratedExplanation>;
  startTime: Date;
  endTime?: Date;
  currentStep: number;
  totalSteps: number;
  playbackSpeed: number;
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  bookmarks: ReplayBookmark[];
  notes: ReplayNote[];
  quizResults: QuizResult[];
  progressData: ProgressData;
}

export interface ReplayBookmark {
  id: string;
  stepIndex: number;
  timestamp: number;
  title: string;
  description?: string;
  tags: string[];
  createdAt: Date;
}

export interface ReplayNote {
  id: string;
  stepIndex: number;
  timestamp: number;
  content: string;
  type: 'text' | 'highlight' | 'question' | 'insight';
  position?: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizResult {
  id: string;
  stepIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number;
  completedAt: Date;
}

export interface ProgressData {
  stepsCompleted: number;
  totalSteps: number;
  timeSpent: number;
  quizzesCompleted: number;
  quizzesCorrect: number;
  bookmarksCreated: number;
  notesCreated: number;
  completionPercentage: number;
  learningScore: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  criteria: string;
}

export interface ReplayChapter {
  id: string;
  title: string;
  description: string;
  startStep: number;
  endStep: number;
  duration: number;
  thumbnail?: string;
  learningObjectives: string[];
}

export interface ReplayControls {
  play(): void;
  pause(): void;
  stop(): void;
  rewind(): void;
  fastForward(): void;
  skipToStep(stepIndex: number): void;
  setSpeed(speed: number): void;
  toggleLoop(): void;
  addBookmark(title: string, description?: string): void;
  addNote(content: string, type: ReplayNote['type']): void;
  takeQuiz(stepIndex: number): void;
}

export interface ReplayEvent {
  type: 'play' | 'pause' | 'stop' | 'step-changed' | 'bookmark-added' | 'note-added' | 'quiz-completed';
  sessionId: string;
  stepIndex: number;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export type ReplayEventListener = (event: ReplayEvent) => void;

/**
 * Default replay configuration
 */
export const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  playback: {
    defaultSpeed: 1.0,
    minSpeed: 0.25,
    maxSpeed: 4.0,
    enableVariableSpeed: true,
    enableStepByStep: true,
    enableAutoAdvance: true,
    autoAdvanceDelay: 2000
  },
  learning: {
    enableQuizzes: true,
    enableProgressTracking: true,
    enableBookmarks: true,
    enableNotes: true,
    enableHighlights: true,
    requireQuizCompletion: false,
    adaptiveDifficulty: true
  },
  interaction: {
    enablePause: true,
    enableRewind: true,
    enableSkip: true,
    enableJumpToStep: true,
    enableLooping: false,
    enableChapters: true
  },
  visual: {
    showProgress: true,
    showTimeline: true,
    showStepNumbers: true,
    showExplanations: true,
    highlightCurrentStep: true,
    enableThumbnails: false
  },
  accessibility: {
    enableCaptions: true,
    enableAudioDescription: false,
    enableKeyboardNavigation: true,
    enableScreenReaderSupport: true,
    enableHighContrast: false
  }
};

/**
 * Replay System Class
 * 
 * Manages replay functionality with learning features and progress tracking
 */
export class ReplaySystem {
  private config: ReplayConfig;
  private activeSessions: Map<string, ReplaySession> = new Map();
  private listeners: Set<ReplayEventListener> = new Set();
  private achievements: Map<string, Achievement> = new Map();
  private userProgress: Map<string, ProgressData> = new Map();
  private animationFrame: number | null = null;

  constructor(config: ReplayConfig = DEFAULT_REPLAY_CONFIG) {
    this.config = { ...config };
    this.initializeAchievements();
  }

  /**
   * Create new replay session
   */
  createSession(
    id: string,
    name: string,
    sequence: AnimationSequence,
    explanations: Map<string, GeneratedExplanation> = new Map()
  ): ReplaySession {
    const session: ReplaySession = {
      id,
      name,
      sequence,
      explanations,
      startTime: new Date(),
      currentStep: 0,
      totalSteps: sequence.steps.length,
      playbackSpeed: this.config.playback.defaultSpeed,
      isPlaying: false,
      isPaused: false,
      isCompleted: false,
      bookmarks: [],
      notes: [],
      quizResults: [],
      progressData: {
        stepsCompleted: 0,
        totalSteps: sequence.steps.length,
        timeSpent: 0,
        quizzesCompleted: 0,
        quizzesCorrect: 0,
        bookmarksCreated: 0,
        notesCreated: 0,
        completionPercentage: 0,
        learningScore: 0,
        achievements: []
      }
    };

    this.activeSessions.set(id, session);
    return session;
  }

  /**
   * Start replay session
   */
  startReplay(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Replay session not found: ${sessionId}`);
    }

    session.isPlaying = true;
    session.isPaused = false;
    session.startTime = new Date();

    this.notifyListeners({
      type: 'play',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date()
    });

    this.startPlaybackLoop(session);
  }

  /**
   * Pause replay session
   */
  pauseReplay(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.isPaused = true;

    this.notifyListeners({
      type: 'pause',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date()
    });
  }

  /**
   * Resume replay session
   */
  resumeReplay(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isPaused) return;

    session.isPaused = false;

    this.notifyListeners({
      type: 'play',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date()
    });

    this.startPlaybackLoop(session);
  }

  /**
   * Stop replay session
   */
  stopReplay(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.isPlaying = false;
    session.isPaused = false;
    session.endTime = new Date();

    this.notifyListeners({
      type: 'stop',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date()
    });

    this.updateProgressData(session);
  }

  /**
   * Skip to specific step
   */
  skipToStep(sessionId: string, stepIndex: number): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    if (stepIndex >= 0 && stepIndex < session.totalSteps) {
      session.currentStep = stepIndex;

      this.notifyListeners({
        type: 'step-changed',
        sessionId,
        stepIndex,
        timestamp: new Date()
      });

      this.updateProgressData(session);
    }
  }

  /**
   * Set playback speed
   */
  setPlaybackSpeed(sessionId: string, speed: number): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const clampedSpeed = Math.max(
      this.config.playback.minSpeed,
      Math.min(this.config.playback.maxSpeed, speed)
    );

    session.playbackSpeed = clampedSpeed;
  }

  /**
   * Add bookmark
   */
  addBookmark(sessionId: string, title: string, description?: string, tags: string[] = []): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const bookmark: ReplayBookmark = {
      id: `bookmark_${Date.now()}`,
      stepIndex: session.currentStep,
      timestamp: this.getCurrentTimestamp(session),
      title,
      description,
      tags,
      createdAt: new Date()
    };

    session.bookmarks.push(bookmark);
    session.progressData.bookmarksCreated++;

    this.notifyListeners({
      type: 'bookmark-added',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date(),
      data: { bookmark }
    });

    this.checkAchievements(session);
  }

  /**
   * Add note
   */
  addNote(sessionId: string, content: string, type: ReplayNote['type'] = 'text', position?: { x: number; y: number }): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const note: ReplayNote = {
      id: `note_${Date.now()}`,
      stepIndex: session.currentStep,
      timestamp: this.getCurrentTimestamp(session),
      content,
      type,
      position,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    session.notes.push(note);
    session.progressData.notesCreated++;

    this.notifyListeners({
      type: 'note-added',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date(),
      data: { note }
    });

    this.checkAchievements(session);
  }

  /**
   * Take quiz for current step
   */
  takeQuiz(sessionId: string, question: string, userAnswer: string, correctAnswer: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    
    const quizResult: QuizResult = {
      id: `quiz_${Date.now()}`,
      stepIndex: session.currentStep,
      question,
      userAnswer,
      correctAnswer,
      isCorrect,
      attempts: 1,
      timeSpent: 0, // Would be calculated based on quiz start time
      completedAt: new Date()
    };

    session.quizResults.push(quizResult);
    session.progressData.quizzesCompleted++;
    
    if (isCorrect) {
      session.progressData.quizzesCorrect++;
    }

    this.notifyListeners({
      type: 'quiz-completed',
      sessionId,
      stepIndex: session.currentStep,
      timestamp: new Date(),
      data: { quizResult }
    });

    this.updateLearningScore(session);
    this.checkAchievements(session);
  }

  /**
   * Get replay controls for session
   */
  getControls(sessionId: string): ReplayControls {
    return {
      play: () => this.startReplay(sessionId),
      pause: () => this.pauseReplay(sessionId),
      stop: () => this.stopReplay(sessionId),
      rewind: () => this.skipToStep(sessionId, Math.max(0, this.getSession(sessionId)?.currentStep - 1 || 0)),
      fastForward: () => {
        const session = this.getSession(sessionId);
        if (session) {
          this.skipToStep(sessionId, Math.min(session.totalSteps - 1, session.currentStep + 1));
        }
      },
      skipToStep: (stepIndex: number) => this.skipToStep(sessionId, stepIndex),
      setSpeed: (speed: number) => this.setPlaybackSpeed(sessionId, speed),
      toggleLoop: () => this.toggleLoop(sessionId),
      addBookmark: (title: string, description?: string) => this.addBookmark(sessionId, title, description),
      addNote: (content: string, type: ReplayNote['type'] = 'text') => this.addNote(sessionId, content, type),
      takeQuiz: (stepIndex: number) => {
        // This would trigger quiz UI - implementation depends on UI framework
        console.log(`Taking quiz for step ${stepIndex}`);
      }
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ReplaySession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): ReplaySession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Create chapters from animation sequence
   */
  createChapters(sequence: AnimationSequence): ReplayChapter[] {
    const chapters: ReplayChapter[] = [];
    const stepsPerChapter = Math.max(1, Math.floor(sequence.steps.length / 5)); // Aim for ~5 chapters
    
    for (let i = 0; i < sequence.steps.length; i += stepsPerChapter) {
      const startStep = i;
      const endStep = Math.min(i + stepsPerChapter - 1, sequence.steps.length - 1);
      const chapterSteps = sequence.steps.slice(startStep, endStep + 1);
      
      const chapter: ReplayChapter = {
        id: `chapter_${Math.floor(i / stepsPerChapter) + 1}`,
        title: this.generateChapterTitle(chapterSteps),
        description: this.generateChapterDescription(chapterSteps),
        startStep,
        endStep,
        duration: chapterSteps.reduce((sum, step) => sum + step.duration, 0),
        learningObjectives: this.generateChapterObjectives(chapterSteps)
      };
      
      chapters.push(chapter);
    }
    
    return chapters;
  }

  /**
   * Export session data
   */
  exportSession(sessionId: string): {
    session: ReplaySession;
    summary: {
      completionRate: number;
      timeSpent: number;
      learningScore: number;
      achievements: Achievement[];
    };
  } {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const summary = {
      completionRate: session.progressData.completionPercentage,
      timeSpent: session.progressData.timeSpent,
      learningScore: session.progressData.learningScore,
      achievements: session.progressData.achievements
    };

    return { session, summary };
  }

  /**
   * Subscribe to replay events
   */
  subscribe(listener: ReplayEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start playback loop
   */
  private startPlaybackLoop(session: ReplaySession): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const loop = () => {
      if (!session.isPlaying || session.isPaused) {
        return;
      }

      // Update current step based on timing
      this.updateCurrentStep(session);

      // Check if replay is complete
      if (session.currentStep >= session.totalSteps) {
        session.isCompleted = true;
        this.stopReplay(session.id);
        return;
      }

      // Continue loop
      this.animationFrame = requestAnimationFrame(loop);
    };

    this.animationFrame = requestAnimationFrame(loop);
  }

  /**
   * Update current step based on timing
   */
  private updateCurrentStep(session: ReplaySession): void {
    const elapsed = Date.now() - session.startTime.getTime();
    const adjustedElapsed = elapsed * session.playbackSpeed;
    
    // Find current step based on elapsed time
    let cumulativeTime = 0;
    for (let i = 0; i < session.sequence.steps.length; i++) {
      const step = session.sequence.steps[i];
      cumulativeTime += step.duration;
      
      if (adjustedElapsed <= cumulativeTime) {
        if (session.currentStep !== i) {
          session.currentStep = i;
          this.notifyListeners({
            type: 'step-changed',
            sessionId: session.id,
            stepIndex: i,
            timestamp: new Date()
          });
        }
        break;
      }
    }
  }

  /**
   * Update progress data
   */
  private updateProgressData(session: ReplaySession): void {
    const progress = session.progressData;
    
    progress.stepsCompleted = session.currentStep + 1;
    progress.completionPercentage = (progress.stepsCompleted / progress.totalSteps) * 100;
    
    if (session.endTime && session.startTime) {
      progress.timeSpent = session.endTime.getTime() - session.startTime.getTime();
    }
    
    this.updateLearningScore(session);
  }

  /**
   * Update learning score
   */
  private updateLearningScore(session: ReplaySession): void {
    const progress = session.progressData;
    let score = 0;
    
    // Base score from completion
    score += (progress.completionPercentage / 100) * 40;
    
    // Quiz performance
    if (progress.quizzesCompleted > 0) {
      const quizScore = (progress.quizzesCorrect / progress.quizzesCompleted) * 30;
      score += quizScore;
    }
    
    // Engagement score (bookmarks and notes)
    const engagementScore = Math.min(20, (progress.bookmarksCreated + progress.notesCreated) * 2);
    score += engagementScore;
    
    // Time bonus (completing in reasonable time)
    const expectedTime = session.sequence.totalDuration;
    if (progress.timeSpent > 0 && progress.timeSpent <= expectedTime * 1.5) {
      score += 10;
    }
    
    progress.learningScore = Math.round(score);
  }

  /**
   * Check and award achievements
   */
  private checkAchievements(session: ReplaySession): void {
    const progress = session.progressData;
    
    // First bookmark achievement
    if (progress.bookmarksCreated === 1 && !this.hasAchievement(session, 'first-bookmark')) {
      this.awardAchievement(session, 'first-bookmark');
    }
    
    // Note taker achievement
    if (progress.notesCreated >= 5 && !this.hasAchievement(session, 'note-taker')) {
      this.awardAchievement(session, 'note-taker');
    }
    
    // Quiz master achievement
    if (progress.quizzesCompleted >= 3 && progress.quizzesCorrect === progress.quizzesCompleted && !this.hasAchievement(session, 'quiz-master')) {
      this.awardAchievement(session, 'quiz-master');
    }
    
    // Completion achievement
    if (progress.completionPercentage === 100 && !this.hasAchievement(session, 'completion')) {
      this.awardAchievement(session, 'completion');
    }
  }

  /**
   * Check if session has specific achievement
   */
  private hasAchievement(session: ReplaySession, achievementId: string): boolean {
    return session.progressData.achievements.some(a => a.id === achievementId);
  }

  /**
   * Award achievement to session
   */
  private awardAchievement(session: ReplaySession, achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (achievement) {
      const awardedAchievement = {
        ...achievement,
        unlockedAt: new Date()
      };
      session.progressData.achievements.push(awardedAchievement);
    }
  }

  /**
   * Initialize available achievements
   */
  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first-bookmark',
        name: 'Bookworm',
        description: 'Created your first bookmark',
        icon: '📖',
        unlockedAt: new Date(),
        criteria: 'Create first bookmark'
      },
      {
        id: 'note-taker',
        name: 'Note Taker',
        description: 'Created 5 or more notes',
        icon: '📝',
        unlockedAt: new Date(),
        criteria: 'Create 5 notes'
      },
      {
        id: 'quiz-master',
        name: 'Quiz Master',
        description: 'Answered all quizzes correctly',
        icon: '🎯',
        unlockedAt: new Date(),
        criteria: 'Perfect quiz score'
      },
      {
        id: 'completion',
        name: 'Completionist',
        description: 'Completed the entire replay',
        icon: '🏆',
        unlockedAt: new Date(),
        criteria: 'Complete replay session'
      },
      {
        id: 'speed-learner',
        name: 'Speed Learner',
        description: 'Completed replay in record time',
        icon: '⚡',
        unlockedAt: new Date(),
        criteria: 'Complete under expected time'
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Generate chapter title
   */
  private generateChapterTitle(steps: AnimationStep[]): string {
    const stepTypes = steps.map(s => s.type);
    const uniqueTypes = [...new Set(stepTypes)];
    
    if (uniqueTypes.includes('node-appear')) {
      return 'Adding Components';
    } else if (uniqueTypes.includes('connection-draw')) {
      return 'Creating Connections';
    } else if (uniqueTypes.includes('highlight')) {
      return 'Understanding Flow';
    } else {
      return 'Strategy Building';
    }
  }

  /**
   * Generate chapter description
   */
  private generateChapterDescription(steps: AnimationStep[]): string {
    return `This chapter covers ${steps.length} steps in the strategy building process.`;
  }

  /**
   * Generate chapter learning objectives
   */
  private generateChapterObjectives(steps: AnimationStep[]): string[] {
    const objectives: string[] = [];
    const stepTypes = steps.map(s => s.type);
    
    if (stepTypes.includes('node-appear')) {
      objectives.push('Understand component placement');
    }
    if (stepTypes.includes('connection-draw')) {
      objectives.push('Learn data flow concepts');
    }
    if (stepTypes.includes('highlight')) {
      objectives.push('Identify key elements');
    }
    
    return objectives;
  }

  /**
   * Get current timestamp in session
   */
  private getCurrentTimestamp(session: ReplaySession): number {
    if (!session.startTime) return 0;
    return Date.now() - session.startTime.getTime();
  }

  /**
   * Toggle loop mode
   */
  private toggleLoop(sessionId: string): void {
    // Implementation would toggle loop mode
    console.log(`Toggling loop for session ${sessionId}`);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: ReplayEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Replay event listener error:', error);
      }
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ReplayConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ReplayConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.activeSessions.clear();
    this.listeners.clear();
  }
}

/**
 * Create replay system instance
 */
export function createReplaySystem(config?: Partial<ReplayConfig>): ReplaySystem {
  const fullConfig = config ? { ...DEFAULT_REPLAY_CONFIG, ...config } : DEFAULT_REPLAY_CONFIG;
  return new ReplaySystem(fullConfig);
}

/**
 * Replay utilities
 */
export const ReplayUtils = {
  /**
   * Calculate optimal playback speed
   */
  calculateOptimalSpeed(totalDuration: number, availableTime: number): number {
    const baseSpeed = 1.0;
    const speedAdjustment = totalDuration / availableTime;
    return Math.max(0.25, Math.min(4.0, baseSpeed * speedAdjustment));
  },

  /**
   * Generate session summary
   */
  generateSessionSummary(session: ReplaySession): {
    completionRate: string;
    timeSpent: string;
    engagement: string;
    learningScore: string;
  } {
    const progress = session.progressData;
    
    return {
      completionRate: `${Math.round(progress.completionPercentage)}%`,
      timeSpent: this.formatDuration(progress.timeSpent),
      engagement: `${progress.bookmarksCreated + progress.notesCreated} interactions`,
      learningScore: `${progress.learningScore}/100`
    };
  },

  /**
   * Format duration in milliseconds to readable string
   */
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Export session data to JSON
   */
  exportToJSON(session: ReplaySession): string {
    const exportData = {
      id: session.id,
      name: session.name,
      startTime: session.startTime,
      endTime: session.endTime,
      progressData: session.progressData,
      bookmarks: session.bookmarks,
      notes: session.notes,
      quizResults: session.quizResults
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Import session data from JSON
   */
  importFromJSON(jsonData: string): Partial<ReplaySession> {
    try {
      const data = JSON.parse(jsonData);
      return {
        id: data.id,
        name: data.name,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        progressData: data.progressData,
        bookmarks: data.bookmarks,
        notes: data.notes,
        quizResults: data.quizResults
      };
    } catch (error) {
      throw new Error('Invalid JSON data for session import');
    }
  },

  /**
   * Validate session data
   */
  validateSession(session: ReplaySession): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!session.id) {
      errors.push('Session must have an ID');
    }

    if (!session.name) {
      warnings.push('Session should have a name');
    }

    if (!session.sequence || session.sequence.steps.length === 0) {
      errors.push('Session must have a valid animation sequence');
    }

    if (session.currentStep < 0 || session.currentStep >= session.totalSteps) {
      warnings.push('Current step index is out of bounds');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};