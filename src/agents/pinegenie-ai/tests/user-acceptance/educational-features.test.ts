/**
 * Educational Features - User Acceptance Tests
 * Tests the learning and educational aspects of the AI system
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { educationalScenarios } from '../fixtures/user-scenarios';
import { createTestUtils } from '../helpers/test-utils';

// Mock animation and educational components
jest.mock('../../animations', () => ({
  StepAnimator: jest.fn().mockImplementation(() => ({
    playAnimation: jest.fn(),
    pauseAnimation: jest.fn(),
    replayAnimation: jest.fn(),
    setSpeed: jest.fn(),
  })),
  ExplanationGenerator: jest.fn().mockImplementation(() => ({
    generateExplanation: jest.fn(),
    getContextualHelp: jest.fn(),
  })),
}));

describe('Educational Features - User Acceptance Tests', () => {
  let testUtils: ReturnType<typeof createTestUtils>;

  beforeEach(() => {
    testUtils = createTestUtils();
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanup();
  });

  describe('First-Time User Experience', () => {
    test('should provide comprehensive onboarding for new users', async () => {
      const result = await testUtils.simulateFirstTimeUser();
      
      // Should detect first-time user
      expect(result.isFirstTimeUser).toBe(true);
      
      // Should offer guided tour
      expect(result.guidedTour).toBeDefined();
      expect(result.guidedTour.steps).toHaveLength.greaterThan(5);
      
      // Should include welcome message
      expect(result.welcomeMessage).toContain('welcome');
      expect(result.welcomeMessage).toContain('PineGenie');
      
      // Should provide basic concepts explanation
      expect(result.basicConcepts).toBeDefined();
      expect(result.basicConcepts).toContain('trading strategy');
      expect(result.basicConcepts).toContain('technical indicators');
    });

    test('should guide users through their first strategy creation', async () => {
      const result = await testUtils.simulateGuidedStrategyCreation(
        'I want to learn how to create a simple strategy'
      );
      
      // Should provide step-by-step guidance
      expect(result.guidedMode).toBe(true);
      expect(result.steps).toBeDefined();
      expect(result.currentStep).toBe(0);
      
      // Should explain each step
      expect(result.stepExplanation).toBeDefined();
      expect(result.stepExplanation).toContain('first step');
      
      // Should provide next action
      expect(result.nextAction).toBeDefined();
      expect(result.nextAction.type).toBe('user-input-required');
    });

    test('should adapt explanations to user knowledge level', async () => {
      // Test beginner explanations
      const beginnerResult = await testUtils.simulateUserInput(
        'What is RSI?',
        undefined,
        { userLevel: 'beginner' }
      );
      
      expect(beginnerResult.explanation).toContain('Relative Strength Index');
      expect(beginnerResult.explanation).toContain('simple terms');
      expect(beginnerResult.explanation.length).toBeGreaterThan(200);
      
      // Test advanced explanations
      const advancedResult = await testUtils.simulateUserInput(
        'What is RSI?',
        undefined,
        { userLevel: 'advanced' }
      );
      
      expect(advancedResult.explanation).toContain('momentum oscillator');
      expect(advancedResult.explanation).toContain('mathematical formula');
      expect(advancedResult.explanation.length).toBeLessThan(beginnerResult.explanation.length);
    });
  });

  describe('Step-by-Step Animations', () => {
    test('should animate strategy construction process', async () => {
      const result = await testUtils.simulateAnimatedStrategyCreation(
        'Create RSI strategy with animation'
      );
      
      // Should enable animation mode
      expect(result.animationMode).toBe(true);
      expect(result.animationSteps).toBeDefined();
      expect(result.animationSteps.length).toBeGreaterThan(3);
      
      // Should provide animation controls
      expect(result.controls).toEqual(
        expect.objectContaining({
          play: expect.any(Function),
          pause: expect.any(Function),
          replay: expect.any(Function),
          setSpeed: expect.any(Function),
        })
      );
      
      // Should explain each animation step
      result.animationSteps.forEach(step => {
        expect(step.explanation).toBeDefined();
        expect(step.explanation.length).toBeGreaterThan(20);
      });
    });

    test('should allow users to control animation playback', async () => {
      const animation = await testUtils.createAnimatedStrategy();
      
      // Test play functionality
      await animation.play();
      expect(animation.isPlaying).toBe(true);
      
      // Test pause functionality
      await animation.pause();
      expect(animation.isPlaying).toBe(false);
      expect(animation.currentStep).toBeGreaterThan(0);
      
      // Test replay functionality
      await animation.replay();
      expect(animation.currentStep).toBe(0);
      
      // Test speed control
      await animation.setSpeed(2.0); // 2x speed
      expect(animation.playbackSpeed).toBe(2.0);
    });

    test('should highlight relevant components during animation', async () => {
      const animation = await testUtils.createAnimatedStrategy();
      
      await animation.play();
      
      // Should highlight current component
      expect(animation.highlightedComponent).toBeDefined();
      expect(animation.highlightedComponent.type).toBe('node');
      
      // Should provide contextual explanation
      expect(animation.currentExplanation).toBeDefined();
      expect(animation.currentExplanation).toContain(animation.highlightedComponent.name);
    });
  });

  describe('Interactive Learning Features', () => {
    test('should provide contextual help and tooltips', async () => {
      const result = await testUtils.simulateHelpRequest('RSI indicator');
      
      // Should provide comprehensive help
      expect(result.helpContent).toBeDefined();
      expect(result.helpContent.title).toBe('RSI Indicator');
      expect(result.helpContent.description).toContain('momentum');
      
      // Should include usage examples
      expect(result.helpContent.examples).toBeDefined();
      expect(result.helpContent.examples.length).toBeGreaterThan(0);
      
      // Should provide related topics
      expect(result.helpContent.relatedTopics).toBeDefined();
      expect(result.helpContent.relatedTopics).toContain('MACD');
    });

    test('should offer interactive quizzes and learning exercises', async () => {
      const quiz = await testUtils.startLearningQuiz('technical-indicators');
      
      // Should provide quiz structure
      expect(quiz.questions).toBeDefined();
      expect(quiz.questions.length).toBeGreaterThan(3);
      
      // Should track progress
      expect(quiz.progress).toBe(0);
      expect(quiz.totalQuestions).toBe(quiz.questions.length);
      
      // Test answering questions
      const answer = await quiz.answerQuestion(0, 'RSI');
      expect(answer.correct).toBeDefined();
      expect(answer.explanation).toBeDefined();
      
      if (answer.correct) {
        expect(quiz.progress).toBe(1);
      }
    });

    test('should provide learning path recommendations', async () => {
      const result = await testUtils.getLearningRecommendations('beginner');
      
      // Should provide structured learning path
      expect(result.learningPath).toBeDefined();
      expect(result.learningPath.length).toBeGreaterThan(3);
      
      // Should include estimated time
      result.learningPath.forEach(module => {
        expect(module.estimatedTime).toBeDefined();
        expect(module.difficulty).toBeDefined();
        expect(module.prerequisites).toBeDefined();
      });
      
      // Should adapt to user progress
      const progressResult = await testUtils.getLearningRecommendations('beginner', {
        completedModules: ['basic-concepts', 'indicators-intro']
      });
      
      expect(progressResult.learningPath[0].id).not.toBe('basic-concepts');
    });
  });

  describe('Educational Content Quality', () => {
    test('should provide accurate and up-to-date trading information', async () => {
      const concepts = [
        'moving average',
        'RSI',
        'MACD',
        'Bollinger Bands',
        'support and resistance',
        'risk management'
      ];
      
      for (const concept of concepts) {
        const result = await testUtils.getEducationalContent(concept);
        
        // Should provide accurate information
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(100);
        
        // Should include key concepts
        expect(result.keyPoints).toBeDefined();
        expect(result.keyPoints.length).toBeGreaterThan(2);
        
        // Should provide practical examples
        expect(result.examples).toBeDefined();
        expect(result.examples.length).toBeGreaterThan(0);
      }
    });

    test('should maintain consistent educational tone and style', async () => {
      const topics = ['RSI', 'MACD', 'Moving Averages'];
      const explanations = [];
      
      for (const topic of topics) {
        const result = await testUtils.getEducationalContent(topic);
        explanations.push(result.content);
      }
      
      // Should maintain consistent style
      explanations.forEach(explanation => {
        // Should be educational and friendly
        expect(explanation).toMatch(/learn|understand|help/i);
        
        // Should avoid overly technical jargon for beginners
        expect(explanation).not.toMatch(/stochastic process|fourier transform/i);
        
        // Should include practical context
        expect(explanation).toMatch(/trading|strategy|market/i);
      });
    });

    test('should provide multilingual support for educational content', async () => {
      const languages = ['en', 'es', 'fr', 'de'];
      
      for (const lang of languages) {
        const result = await testUtils.getEducationalContent('RSI', { language: lang });
        
        // Should provide content in requested language
        expect(result.language).toBe(lang);
        expect(result.content).toBeDefined();
        expect(result.content.length).toBeGreaterThan(50);
        
        // Should maintain educational quality across languages
        expect(result.keyPoints).toBeDefined();
        expect(result.examples).toBeDefined();
      }
    });
  });

  describe('Progress Tracking and Personalization', () => {
    test('should track user learning progress', async () => {
      const userId = 'test-user-123';
      
      // Simulate learning activities
      await testUtils.completeModule(userId, 'basic-concepts');
      await testUtils.completeModule(userId, 'indicators-intro');
      await testUtils.completeQuiz(userId, 'rsi-quiz', 0.8); // 80% score
      
      const progress = await testUtils.getUserProgress(userId);
      
      // Should track completed modules
      expect(progress.completedModules).toContain('basic-concepts');
      expect(progress.completedModules).toContain('indicators-intro');
      
      // Should track quiz scores
      expect(progress.quizScores['rsi-quiz']).toBe(0.8);
      
      // Should calculate overall progress
      expect(progress.overallProgress).toBeGreaterThan(0);
      expect(progress.overallProgress).toBeLessThanOrEqual(1);
    });

    test('should personalize content based on user preferences', async () => {
      const userPreferences = {
        learningStyle: 'visual',
        tradingExperience: 'intermediate',
        preferredMarkets: ['crypto', 'forex'],
        timeAvailable: 30 // minutes per session
      };
      
      const result = await testUtils.getPersonalizedContent(userPreferences);
      
      // Should adapt to learning style
      expect(result.visualElements).toBe(true);
      expect(result.animations).toBe(true);
      
      // Should match experience level
      expect(result.difficulty).toBe('intermediate');
      
      // Should include relevant market examples
      expect(result.examples.some(ex => ex.market === 'crypto')).toBe(true);
      
      // Should fit time constraints
      expect(result.estimatedTime).toBeLessThanOrEqual(30);
    });

    test('should provide achievement system and gamification', async () => {
      const userId = 'test-user-456';
      
      // Complete various learning activities
      await testUtils.completeModule(userId, 'basic-concepts');
      await testUtils.createFirstStrategy(userId);
      await testUtils.completeQuiz(userId, 'indicators-quiz', 1.0); // Perfect score
      
      const achievements = await testUtils.getUserAchievements(userId);
      
      // Should award appropriate achievements
      expect(achievements).toContain('first-strategy');
      expect(achievements).toContain('perfect-quiz');
      expect(achievements).toContain('learning-started');
      
      // Should provide achievement details
      const achievementDetails = await testUtils.getAchievementDetails('perfect-quiz');
      expect(achievementDetails.title).toBeDefined();
      expect(achievementDetails.description).toBeDefined();
      expect(achievementDetails.icon).toBeDefined();
    });
  });
});