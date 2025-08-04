# Educational Animations API

The Educational Animations module provides step-by-step visual animations and explanations for strategy construction. It helps users understand how strategies are built and learn trading concepts through interactive visualizations.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Animation Types](#animation-types)
- [Customization](#customization)

## 🏗 **Core Classes**

### `StepAnimator`

Main class for creating and controlling step-by-step animations.

```typescript
class StepAnimator {
  constructor(config?: AnimationConfig);
  
  // Animation control
  async playAnimation(steps: AnimationStep[]): Promise<void>;
  pauseAnimation(): void;
  resumeAnimation(): void;
  stopAnimation(): void;
  replayAnimation(): Promise<void>;
  
  // Speed control
  setSpeed(speed: number): void;
  getSpeed(): number;
  
  // Step navigation
  goToStep(stepNumber: number): Promise<void>;
  nextStep(): Promise<void>;
  previousStep(): Promise<void>;
  
  // State management
  getCurrentStep(): number;
  getTotalSteps(): number;
  isPlaying(): boolean;
  isPaused(): boolean;
}
```

### `ExplanationGenerator`

Generates contextual explanations for each animation step.

```typescript
class ExplanationGenerator {
  constructor(knowledgeBase?: TradingKnowledgeBase);
  
  // Explanation generation
  generateStepExplanation(step: AnimationStep, context: AnimationContext): StepExplanation;
  generateConceptExplanation(concept: TradingConcept, level: ExplanationLevel): ConceptExplanation;
  
  // Interactive explanations
  generateInteractiveExplanation(step: AnimationStep): InteractiveExplanation;
  generateQuizQuestion(concept: TradingConcept): QuizQuestion;
  
  // Personalization
  personalizeExplanation(explanation: StepExplanation, userProfile: UserProfile): StepExplanation;
  adaptToUserLevel(explanation: StepExplanation, level: UserLevel): StepExplanation;
}
```

### `ReplaySystem`

Manages animation replay and learning features.

```typescript
class ReplaySystem {
  constructor(config?: ReplayConfig);
  
  // Replay management
  saveAnimationSession(session: AnimationSession): Promise<string>;
  loadAnimationSession(sessionId: string): Promise<AnimationSession>;
  
  // Bookmarking
  addBookmark(stepNumber: number, note?: string): Bookmark;
  removeBookmark(bookmarkId: string): void;
  getBookmarks(): Bookmark[];
  
  // Progress tracking
  trackProgress(userId: string, stepNumber: number): void;
  getProgress(userId: string): ProgressData;
  
  // Learning analytics
  getStepAnalytics(stepNumber: number): StepAnalytics;
  getUserAnalytics(userId: string): UserAnalytics;
}
```

### `HighlightController`

Controls visual highlights and focus indicators during animations.

```typescript
class HighlightController {
  constructor(config?: HighlightConfig);
  
  // Highlight management
  highlightElement(elementId: string, style?: HighlightStyle): void;
  removeHighlight(elementId: string): void;
  clearAllHighlights(): void;
  
  // Focus management
  focusOnElement(elementId: string, options?: FocusOptions): void;
  unfocusElement(elementId: string): void;
  
  // Visual effects
  pulseElement(elementId: string, duration?: number): void;
  glowElement(elementId: string, color?: string): void;
  bounceElement(elementId: string): void;
  
  // Spotlight effects
  createSpotlight(position: Position, radius?: number): void;
  moveSpotlight(position: Position, duration?: number): void;
  removeSpotlight(): void;
}
```

### `TimingManager`

Manages animation timing, sequencing, and synchronization.

```typescript
class TimingManager {
  constructor(config?: TimingConfig);
  
  // Timing control
  setGlobalTiming(timing: TimingSettings): void;
  setStepTiming(stepNumber: number, timing: StepTiming): void;
  
  // Sequencing
  createSequence(steps: AnimationStep[]): AnimationSequence;
  addToSequence(sequence: AnimationSequence, step: AnimationStep): void;
  
  // Synchronization
  synchronizeAnimations(animations: Animation[]): Promise<void>;
  waitForAnimations(animations: Animation[]): Promise<void>;
  
  // Easing functions
  registerEasingFunction(name: string, fn: EasingFunction): void;
  getEasingFunction(name: string): EasingFunction;
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface AnimationStep {
  stepNumber: number;
  type: AnimationType;
  elementId?: string;
  duration: number;
  delay: number;
  easing: string;
  explanation: string;
  highlight: boolean;
  interactive: boolean;
  metadata: StepMetadata;
}

interface StepExplanation {
  title: string;
  description: string;
  reasoning: string;
  concepts: TradingConcept[];
  tips: string[];
  warnings: string[];
  relatedSteps: number[];
  interactiveElements: InteractiveElement[];
}

interface AnimationSession {
  id: string;
  userId: string;
  strategyId: string;
  steps: AnimationStep[];
  currentStep: number;
  bookmarks: Bookmark[];
  progress: ProgressData;
  settings: AnimationSettings;
  createdAt: Date;
  updatedAt: Date;
}

interface InteractiveExplanation {
  content: string;
  interactions: Interaction[];
  quiz: QuizQuestion[];
  examples: CodeExample[];
  visualizations: Visualization[];
}
```

### Configuration Types

```typescript
interface AnimationConfig {
  defaultDuration: number;
  defaultDelay: number;
  defaultEasing: string;
  enableHighlights: boolean;
  enableExplanations: boolean;
  enableInteractivity: boolean;
  autoPlay: boolean;
  loop: boolean;
  showControls: boolean;
  showProgress: boolean;
}

interface HighlightStyle {
  color: string;
  opacity: number;
  borderWidth: number;
  borderStyle: string;
  backgroundColor: string;
  animation: string;
  zIndex: number;
}

interface TimingSettings {
  globalSpeed: number;
  pauseBetweenSteps: number;
  highlightDuration: number;
  explanationDelay: number;
  interactionTimeout: number;
}
```

### Animation Types

```typescript
enum AnimationType {
  NODE_CREATION = 'node-creation',
  NODE_PLACEMENT = 'node-placement',
  CONNECTION_CREATION = 'connection-creation',
  PARAMETER_UPDATE = 'parameter-update',
  HIGHLIGHT = 'highlight',
  EXPLANATION = 'explanation',
  INTERACTION = 'interaction',
  VALIDATION = 'validation'
}

enum ExplanationLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

enum UserLevel {
  NOVICE = 'novice',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}
```

## 📖 **Methods**

### `playAnimation(steps: AnimationStep[]): Promise<void>`

Plays a sequence of animation steps with explanations and highlights.

**Parameters:**
- `steps` (AnimationStep[]): Array of animation steps to play

**Returns:**
- `Promise<void>`: Resolves when animation completes

**Example:**
```typescript
const animator = new StepAnimator({
  defaultDuration: 1000,
  enableHighlights: true,
  enableExplanations: true
});

const steps: AnimationStep[] = [
  {
    stepNumber: 1,
    type: AnimationType.NODE_CREATION,
    elementId: 'data-source-1',
    duration: 800,
    delay: 0,
    easing: 'ease-out',
    explanation: 'First, we create a data source to get market data',
    highlight: true,
    interactive: false,
    metadata: { nodeType: 'data-source', category: 'input' }
  },
  {
    stepNumber: 2,
    type: AnimationType.NODE_PLACEMENT,
    elementId: 'data-source-1',
    duration: 600,
    delay: 200,
    easing: 'ease-in-out',
    explanation: 'The data source is placed at the top of our strategy',
    highlight: true,
    interactive: true,
    metadata: { position: { x: 100, y: 50 } }
  }
];

await animator.playAnimation(steps);
```

### `generateStepExplanation(step: AnimationStep, context: AnimationContext): StepExplanation`

Generates detailed explanations for animation steps.

**Parameters:**
- `step` (AnimationStep): The animation step to explain
- `context` (AnimationContext): Current animation context

**Returns:**
- `StepExplanation`: Detailed explanation with educational content

**Example:**
```typescript
const explanationGenerator = new ExplanationGenerator();

const step: AnimationStep = {
  stepNumber: 3,
  type: AnimationType.CONNECTION_CREATION,
  elementId: 'connection-1',
  duration: 500,
  delay: 0,
  easing: 'ease-out',
  explanation: 'Connecting data source to RSI indicator',
  highlight: true,
  interactive: false,
  metadata: { source: 'data-source-1', target: 'rsi-1' }
};

const context: AnimationContext = {
  strategyType: 'mean-reversion',
  userLevel: UserLevel.BEGINNER,
  currentNodes: ['data-source-1', 'rsi-1'],
  previousSteps: [1, 2]
};

const explanation = explanationGenerator.generateStepExplanation(step, context);

console.log(explanation.title); // "Creating Data Connection"
console.log(explanation.description); // Detailed explanation
console.log(explanation.concepts); // Related trading concepts
console.log(explanation.tips); // Helpful tips
```

### `addBookmark(stepNumber: number, note?: string): Bookmark`

Adds a bookmark to a specific animation step for later reference.

**Parameters:**
- `stepNumber` (number): Step number to bookmark
- `note` (string, optional): User note for the bookmark

**Returns:**
- `Bookmark`: Created bookmark object

**Example:**
```typescript
const replaySystem = new ReplaySystem();

// Add bookmark with note
const bookmark = replaySystem.addBookmark(5, "Important: This is where we add risk management");

console.log(bookmark.id); // Unique bookmark ID
console.log(bookmark.stepNumber); // 5
console.log(bookmark.note); // User's note
console.log(bookmark.timestamp); // When bookmark was created

// Get all bookmarks
const allBookmarks = replaySystem.getBookmarks();
console.log(`Total bookmarks: ${allBookmarks.length}`);
```

## 💡 **Usage Examples**

### Basic Animation Setup

```typescript
import { StepAnimator, ExplanationGenerator, HighlightController } from '@/agents/pinegenie-ai/animations';

const createEducationalAnimation = async (blueprint: StrategyBlueprint) => {
  // Initialize animation components
  const animator = new StepAnimator({
    defaultDuration: 1000,
    enableHighlights: true,
    enableExplanations: true,
    showControls: true
  });

  const explanationGenerator = new ExplanationGenerator();
  const highlightController = new HighlightController();

  // Generate animation steps from blueprint
  const steps = generateAnimationSteps(blueprint);

  // Add explanations to each step
  const enhancedSteps = steps.map(step => {
    const explanation = explanationGenerator.generateStepExplanation(step, {
      strategyType: blueprint.strategyType,
      userLevel: UserLevel.BEGINNER,
      currentNodes: [],
      previousSteps: []
    });

    return {
      ...step,
      explanation: explanation.description,
      interactiveElements: explanation.interactiveElements
    };
  });

  // Play the animation
  await animator.playAnimation(enhancedSteps);
};

const generateAnimationSteps = (blueprint: StrategyBlueprint): AnimationStep[] => {
  const steps: AnimationStep[] = [];
  let stepNumber = 1;

  // Create steps for each component
  blueprint.components.forEach(component => {
    // Node creation step
    steps.push({
      stepNumber: stepNumber++,
      type: AnimationType.NODE_CREATION,
      elementId: component.id,
      duration: 800,
      delay: 0,
      easing: 'ease-out',
      explanation: `Creating ${component.label}`,
      highlight: true,
      interactive: false,
      metadata: { component }
    });

    // Node placement step
    steps.push({
      stepNumber: stepNumber++,
      type: AnimationType.NODE_PLACEMENT,
      elementId: component.id,
      duration: 600,
      delay: 200,
      easing: 'ease-in-out',
      explanation: `Placing ${component.label} in the strategy`,
      highlight: true,
      interactive: true,
      metadata: { component }
    });
  });

  // Create connection steps
  blueprint.flow.forEach(connection => {
    steps.push({
      stepNumber: stepNumber++,
      type: AnimationType.CONNECTION_CREATION,
      elementId: connection.id,
      duration: 500,
      delay: 100,
      easing: 'ease-out',
      explanation: `Connecting ${connection.from} to ${connection.to}`,
      highlight: true,
      interactive: false,
      metadata: { connection }
    });
  });

  return steps;
};
```

### Interactive Learning Experience

```typescript
import { StepAnimator, ExplanationGenerator, ReplaySystem } from '@/agents/pinegenie-ai/animations';

const createInteractiveLearningSession = async (userId: string, blueprint: StrategyBlueprint) => {
  const animator = new StepAnimator();
  const explanationGenerator = new ExplanationGenerator();
  const replaySystem = new ReplaySystem();

  // Create animation session
  const session: AnimationSession = {
    id: generateId(),
    userId,
    strategyId: blueprint.id,
    steps: generateAnimationSteps(blueprint),
    currentStep: 0,
    bookmarks: [],
    progress: { completedSteps: [], totalSteps: 0, score: 0 },
    settings: { speed: 1.0, showExplanations: true },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Save session
  const sessionId = await replaySystem.saveAnimationSession(session);

  // Create interactive controls
  const controls = {
    play: () => animator.playAnimation(session.steps),
    pause: () => animator.pauseAnimation(),
    resume: () => animator.resumeAnimation(),
    stop: () => animator.stopAnimation(),
    replay: () => animator.replayAnimation(),
    
    goToStep: (stepNumber: number) => {
      animator.goToStep(stepNumber);
      replaySystem.trackProgress(userId, stepNumber);
    },
    
    addBookmark: (note?: string) => {
      const currentStep = animator.getCurrentStep();
      return replaySystem.addBookmark(currentStep, note);
    },
    
    takeQuiz: async (stepNumber: number) => {
      const step = session.steps[stepNumber - 1];
      const explanation = explanationGenerator.generateStepExplanation(step, {
        strategyType: blueprint.strategyType,
        userLevel: UserLevel.BEGINNER,
        currentNodes: [],
        previousSteps: []
      });
      
      if (explanation.interactiveElements.length > 0) {
        return showQuizModal(explanation.interactiveElements);
      }
    }
  };

  // Set up event handlers
  animator.onStepStart = (stepNumber: number) => {
    const step = session.steps[stepNumber - 1];
    const explanation = explanationGenerator.generateStepExplanation(step, {
      strategyType: blueprint.strategyType,
      userLevel: UserLevel.BEGINNER,
      currentNodes: [],
      previousSteps: []
    });
    
    showStepExplanation(explanation);
    replaySystem.trackProgress(userId, stepNumber);
  };

  animator.onStepComplete = (stepNumber: number) => {
    updateProgressIndicator(stepNumber, session.steps.length);
  };

  animator.onAnimationComplete = () => {
    showCompletionCertificate(userId, sessionId);
  };

  return {
    sessionId,
    controls,
    session
  };
};

const showStepExplanation = (explanation: StepExplanation) => {
  // Display explanation in UI
  const explanationModal = document.createElement('div');
  explanationModal.className = 'explanation-modal';
  explanationModal.innerHTML = `
    <div class="explanation-content">
      <h3>${explanation.title}</h3>
      <p>${explanation.description}</p>
      <div class="reasoning">
        <strong>Why this step:</strong> ${explanation.reasoning}
      </div>
      ${explanation.tips.length > 0 ? `
        <div class="tips">
          <strong>Tips:</strong>
          <ul>${explanation.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
        </div>
      ` : ''}
      ${explanation.warnings.length > 0 ? `
        <div class="warnings">
          <strong>Important:</strong>
          <ul>${explanation.warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
        </div>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(explanationModal);
  
  // Auto-remove after delay
  setTimeout(() => {
    document.body.removeChild(explanationModal);
  }, 5000);
};
```

### Advanced Animation Customization

```typescript
import { StepAnimator, HighlightController, TimingManager } from '@/agents/pinegenie-ai/animations';

const createCustomAnimationExperience = () => {
  // Custom timing manager with easing functions
  const timingManager = new TimingManager();
  
  // Register custom easing functions
  timingManager.registerEasingFunction('bounce', (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  });

  // Custom highlight controller with advanced effects
  const highlightController = new HighlightController({
    defaultStyle: {
      color: '#007bff',
      opacity: 0.8,
      borderWidth: 3,
      borderStyle: 'solid',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      animation: 'pulse 2s infinite',
      zIndex: 1000
    }
  });

  // Custom animator with advanced features
  const animator = new StepAnimator({
    defaultDuration: 1200,
    defaultEasing: 'bounce',
    enableHighlights: true,
    showControls: true
  });

  // Create custom animation sequence
  const createAdvancedSequence = (blueprint: StrategyBlueprint) => {
    const sequence = timingManager.createSequence([]);
    
    blueprint.components.forEach((component, index) => {
      // Staggered node creation with custom timing
      const nodeCreationStep: AnimationStep = {
        stepNumber: index * 2 + 1,
        type: AnimationType.NODE_CREATION,
        elementId: component.id,
        duration: 1000 + (index * 200), // Increasing duration
        delay: index * 300, // Staggered delay
        easing: 'bounce',
        explanation: `Creating ${component.label} with advanced animation`,
        highlight: true,
        interactive: true,
        metadata: { 
          component,
          customEffects: ['glow', 'pulse', 'bounce']
        }
      };

      timingManager.addToSequence(sequence, nodeCreationStep);

      // Custom highlight effects
      const highlightStep: AnimationStep = {
        stepNumber: index * 2 + 2,
        type: AnimationType.HIGHLIGHT,
        elementId: component.id,
        duration: 2000,
        delay: 500,
        easing: 'ease-in-out',
        explanation: `Highlighting ${component.label} with special effects`,
        highlight: true,
        interactive: false,
        metadata: {
          highlightStyle: {
            color: component.category === 'input' ? '#28a745' : '#ffc107',
            animation: 'rainbow 3s infinite',
            borderWidth: 5
          }
        }
      };

      timingManager.addToSequence(sequence, highlightStep);
    });

    return sequence;
  };

  // Advanced event handling
  animator.onStepStart = (stepNumber: number) => {
    const step = animator.getCurrentStepData();
    
    if (step.metadata.customEffects) {
      step.metadata.customEffects.forEach((effect: string) => {
        switch (effect) {
          case 'glow':
            highlightController.glowElement(step.elementId!, '#007bff');
            break;
          case 'pulse':
            highlightController.pulseElement(step.elementId!, 2000);
            break;
          case 'bounce':
            highlightController.bounceElement(step.elementId!);
            break;
        }
      });
    }

    // Create spotlight effect
    const elementPosition = getElementPosition(step.elementId!);
    highlightController.createSpotlight(elementPosition, 150);
  };

  animator.onStepComplete = (stepNumber: number) => {
    // Clean up effects
    highlightController.clearAllHighlights();
    highlightController.removeSpotlight();
  };

  return {
    animator,
    highlightController,
    timingManager,
    createAdvancedSequence
  };
};

// Utility function to get element position
const getElementPosition = (elementId: string): Position => {
  const element = document.getElementById(elementId);
  if (element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }
  return { x: 0, y: 0 };
};
```

## 🎬 **Animation Types**

### Node Animations

```typescript
// Node creation with fade-in effect
const nodeCreationAnimation: AnimationStep = {
  stepNumber: 1,
  type: AnimationType.NODE_CREATION,
  elementId: 'rsi-indicator',
  duration: 800,
  delay: 0,
  easing: 'ease-out',
  explanation: 'Creating RSI indicator node',
  highlight: true,
  interactive: false,
  metadata: {
    effects: ['fade-in', 'scale-up'],
    startOpacity: 0,
    endOpacity: 1,
    startScale: 0.5,
    endScale: 1.0
  }
};

// Node placement with slide animation
const nodePlacementAnimation: AnimationStep = {
  stepNumber: 2,
  type: AnimationType.NODE_PLACEMENT,
  elementId: 'rsi-indicator',
  duration: 600,
  delay: 200,
  easing: 'ease-in-out',
  explanation: 'Positioning RSI indicator in the strategy flow',
  highlight: true,
  interactive: true,
  metadata: {
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 300, y: 150 },
    path: 'curved'
  }
};
```

### Connection Animations

```typescript
// Connection drawing with path animation
const connectionAnimation: AnimationStep = {
  stepNumber: 3,
  type: AnimationType.CONNECTION_CREATION,
  elementId: 'connection-data-to-rsi',
  duration: 1000,
  delay: 0,
  easing: 'ease-out',
  explanation: 'Connecting data source to RSI indicator',
  highlight: true,
  interactive: false,
  metadata: {
    pathType: 'bezier',
    strokeDasharray: '5,5',
    animateStroke: true,
    showArrow: true,
    dataFlow: true
  }
};
```

### Interactive Animations

```typescript
// Interactive parameter adjustment
const parameterAnimation: AnimationStep = {
  stepNumber: 4,
  type: AnimationType.PARAMETER_UPDATE,
  elementId: 'rsi-period-input',
  duration: 500,
  delay: 0,
  easing: 'ease-in-out',
  explanation: 'Adjusting RSI period parameter',
  highlight: true,
  interactive: true,
  metadata: {
    parameterName: 'period',
    oldValue: 14,
    newValue: 21,
    showValueChange: true,
    allowUserInput: true,
    validationRules: {
      min: 2,
      max: 50,
      step: 1
    }
  }
};
```

## 🎨 **Customization**

### Custom Animation Themes

```typescript
interface AnimationTheme {
  colors: {
    primary: string;
    secondary: string;
    highlight: string;
    success: string;
    warning: string;
    error: string;
  };
  timing: {
    fast: number;
    normal: number;
    slow: number;
  };
  effects: {
    fadeIn: string;
    slideIn: string;
    bounce: string;
    pulse: string;
  };
}

const darkAnimationTheme: AnimationTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    highlight: '#ffc107',
    success: '#28a745',
    warning: '#fd7e14',
    error: '#dc3545'
  },
  timing: {
    fast: 300,
    normal: 600,
    slow: 1200
  },
  effects: {
    fadeIn: 'opacity 0.6s ease-out',
    slideIn: 'transform 0.6s ease-out',
    bounce: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    pulse: 'transform 2s ease-in-out infinite alternate'
  }
};
```

### Custom Explanation Templates

```typescript
interface ExplanationTemplate {
  title: (step: AnimationStep) => string;
  description: (step: AnimationStep, context: AnimationContext) => string;
  tips: (step: AnimationStep) => string[];
  warnings: (step: AnimationStep) => string[];
}

const beginnerExplanationTemplate: ExplanationTemplate = {
  title: (step) => {
    switch (step.type) {
      case AnimationType.NODE_CREATION:
        return `Creating ${step.metadata.component?.label || 'Component'}`;
      case AnimationType.CONNECTION_CREATION:
        return 'Connecting Components';
      default:
        return 'Strategy Building Step';
    }
  },
  
  description: (step, context) => {
    const baseDescription = step.explanation;
    const conceptExplanation = generateConceptExplanation(step, context.userLevel);
    return `${baseDescription}\n\n${conceptExplanation}`;
  },
  
  tips: (step) => {
    switch (step.type) {
      case AnimationType.NODE_CREATION:
        return [
          'Each component serves a specific purpose in your strategy',
          'Components are connected to create the strategy flow',
          'You can modify component parameters later'
        ];
      case AnimationType.CONNECTION_CREATION:
        return [
          'Connections show how data flows through your strategy',
          'The order of connections matters for strategy execution',
          'Invalid connections will be highlighted in red'
        ];
      default:
        return [];
    }
  },
  
  warnings: (step) => {
    if (step.metadata.component?.category === 'risk-management') {
      return ['Always include risk management in your strategies'];
    }
    return [];
  }
};
```

---

**Next**: [Strategy Optimization API](./optimization.md)  
**Previous**: [Chat Interface API](./chat.md)