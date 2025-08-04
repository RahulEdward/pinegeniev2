/**
 * Optimization Algorithms
 * Advanced algorithms for strategy optimization and parameter tuning
 */

import { StrategyBlueprint, StrategyComponent, ParameterSet } from '../../types';

interface OptimizationResult {
  optimizedParameters: ParameterSet;
  score: number;
  improvements: string[];
  iterations: number;
  convergenceTime: number;
}

interface OptimizationConstraints {
  maxIterations: number;
  convergenceThreshold: number;
  timeLimit: number; // milliseconds
  parameterRanges: Map<string, [number, number]>;
}

interface GeneticAlgorithmConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitismRate: number;
}

export class StrategyOptimizer {
  private constraints: OptimizationConstraints;
  private fitnessCache = new Map<string, number>();

  constructor(constraints: Partial<OptimizationConstraints> = {}) {
    this.constraints = {
      maxIterations: constraints.maxIterations || 1000,
      convergenceThreshold: constraints.convergenceThreshold || 0.001,
      timeLimit: constraints.timeLimit || 30000, // 30 seconds
      parameterRanges: constraints.parameterRanges || new Map()
    };
  }

  /**
   * Optimize strategy parameters using genetic algorithm
   */
  async optimizeWithGeneticAlgorithm(
    blueprint: StrategyBlueprint,
    config: Partial<GeneticAlgorithmConfig> = {}
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    const gaConfig: GeneticAlgorithmConfig = {
      populationSize: config.populationSize || 50,
      generations: config.generations || 100,
      mutationRate: config.mutationRate || 0.1,
      crossoverRate: config.crossoverRate || 0.8,
      elitismRate: config.elitismRate || 0.2
    };

    // Initialize population
    let population = this.initializePopulation(blueprint, gaConfig.populationSize);
    let bestSolution = population[0];
    let bestFitness = await this.evaluateFitness(blueprint, bestSolution);

    const improvements: string[] = [];
    let generation = 0;

    while (generation < gaConfig.generations && Date.now() - startTime < this.constraints.timeLimit) {
      // Evaluate fitness for all individuals
      const fitnessScores = await Promise.all(
        population.map(individual => this.evaluateFitness(blueprint, individual))
      );

      // Find best individual in current generation
      const currentBestIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
      const currentBest = population[currentBestIndex];
      const currentBestFitness = fitnessScores[currentBestIndex];

      if (currentBestFitness > bestFitness) {
        bestSolution = currentBest;
        bestFitness = currentBestFitness;
        improvements.push(`Generation ${generation}: Improved fitness to ${bestFitness.toFixed(4)}`);
      }

      // Check convergence
      const avgFitness = fitnessScores.reduce((sum, score) => sum + score, 0) / fitnessScores.length;
      const fitnessVariance = fitnessScores.reduce((sum, score) => sum + Math.pow(score - avgFitness, 2), 0) / fitnessScores.length;
      
      if (fitnessVariance < this.constraints.convergenceThreshold) {
        improvements.push(`Converged at generation ${generation}`);
        break;
      }

      // Selection, crossover, and mutation
      population = this.evolvePopulation(population, fitnessScores, gaConfig);
      generation++;
    }

    return {
      optimizedParameters: bestSolution,
      score: bestFitness,
      improvements,
      iterations: generation,
      convergenceTime: Date.now() - startTime
    };
  }

  /**
   * Optimize using simulated annealing
   */
  async optimizeWithSimulatedAnnealing(
    blueprint: StrategyBlueprint,
    initialTemperature = 100,
    coolingRate = 0.95
  ): Promise<OptimizationResult> {
    const startTime = Date.now();
    let currentSolution = this.generateRandomParameters(blueprint);
    let currentFitness = await this.evaluateFitness(blueprint, currentSolution);
    
    let bestSolution = { ...currentSolution };
    let bestFitness = currentFitness;
    
    let temperature = initialTemperature;
    let iteration = 0;
    const improvements: string[] = [];

    while (temperature > 0.01 && iteration < this.constraints.maxIterations && Date.now() - startTime < this.constraints.timeLimit) {
      // Generate neighbor solution
      const neighborSolution = this.generateNeighborSolution(currentSolution, blueprint);
      const neighborFitness = await this.evaluateFitness(blueprint, neighborSolution);

      // Accept or reject the neighbor
      const deltaFitness = neighborFitness - currentFitness;
      const acceptanceProbability = deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature);

      if (Math.random() < acceptanceProbability) {
        currentSolution = neighborSolution;
        currentFitness = neighborFitness;

        if (neighborFitness > bestFitness) {
          bestSolution = { ...neighborSolution };
          bestFitness = neighborFitness;
          improvements.push(`Iteration ${iteration}: New best fitness ${bestFitness.toFixed(4)}`);
        }
      }

      temperature *= coolingRate;
      iteration++;
    }

    return {
      optimizedParameters: bestSolution,
      score: bestFitness,
      improvements,
      iterations: iteration,
      convergenceTime: Date.now() - startTime
    };
  }

  /**
   * Multi-objective optimization using NSGA-II
   */
  async optimizeMultiObjective(
    blueprint: StrategyBlueprint,
    objectives: string[] = ['profit', 'risk', 'drawdown']
  ): Promise<OptimizationResult[]> {
    const startTime = Date.now();
    const populationSize = 100;
    const generations = 50;

    // Initialize population
    let population = this.initializePopulation(blueprint, populationSize);
    const results: OptimizationResult[] = [];

    for (let generation = 0; generation < generations; generation++) {
      // Evaluate all objectives for each individual
      const objectiveScores = await Promise.all(
        population.map(async individual => {
          const scores: Record<string, number> = {};
          for (const objective of objectives) {
            scores[objective] = await this.evaluateObjective(blueprint, individual, objective);
          }
          return scores;
        })
      );

      // Non-dominated sorting and crowding distance
      const fronts = this.nonDominatedSort(population, objectiveScores);
      const newPopulation: ParameterSet[] = [];

      for (const front of fronts) {
        if (newPopulation.length + front.length <= populationSize) {
          newPopulation.push(...front.map(index => population[index]));
        } else {
          // Calculate crowding distance and select best individuals
          const crowdingDistances = this.calculateCrowdingDistance(front, objectiveScores, objectives);
          const sortedIndices = front
            .map((index, i) => ({ index, distance: crowdingDistances[i] }))
            .sort((a, b) => b.distance - a.distance)
            .slice(0, populationSize - newPopulation.length)
            .map(item => item.index);
          
          newPopulation.push(...sortedIndices.map(index => population[index]));
          break;
        }
      }

      population = newPopulation;

      // Evolve population
      population = this.evolvePopulation(population, 
        await Promise.all(population.map(individual => this.evaluateFitness(blueprint, individual))),
        { populationSize, generations, mutationRate: 0.1, crossoverRate: 0.8, elitismRate: 0.2 }
      );
    }

    // Return Pareto front solutions
    const finalObjectiveScores = await Promise.all(
      population.map(async individual => {
        const scores: Record<string, number> = {};
        for (const objective of objectives) {
          scores[objective] = await this.evaluateObjective(blueprint, individual, objective);
        }
        return scores;
      })
    );

    const fronts = this.nonDominatedSort(population, finalObjectiveScores);
    const paretoFront = fronts[0];

    for (const index of paretoFront) {
      const individual = population[index];
      const overallScore = objectives.reduce((sum, obj) => sum + finalObjectiveScores[index][obj], 0) / objectives.length;
      
      results.push({
        optimizedParameters: individual,
        score: overallScore,
        improvements: [`Multi-objective optimization completed`],
        iterations: generations,
        convergenceTime: Date.now() - startTime
      });
    }

    return results;
  }

  /**
   * Initialize random population
   */
  private initializePopulation(blueprint: StrategyBlueprint, size: number): ParameterSet[] {
    const population: ParameterSet[] = [];
    
    for (let i = 0; i < size; i++) {
      population.push(this.generateRandomParameters(blueprint));
    }
    
    return population;
  }

  /**
   * Generate random parameters within constraints
   */
  private generateRandomParameters(blueprint: StrategyBlueprint): ParameterSet {
    const parameters: ParameterSet = {};
    
    // Extract parameter definitions from blueprint components
    blueprint.components.forEach(component => {
      Object.entries(component.parameters).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const range = this.constraints.parameterRanges.get(key) || [value * 0.5, value * 2];
          parameters[key] = Math.random() * (range[1] - range[0]) + range[0];
        } else if (typeof value === 'boolean') {
          parameters[key] = Math.random() > 0.5;
        } else {
          parameters[key] = value; // Keep non-numeric values as is
        }
      });
    });
    
    return parameters;
  }

  /**
   * Generate neighbor solution for simulated annealing
   */
  private generateNeighborSolution(current: ParameterSet, blueprint: StrategyBlueprint): ParameterSet {
    const neighbor = { ...current };
    
    // Randomly select a parameter to modify
    const parameterKeys = Object.keys(neighbor).filter(key => typeof neighbor[key] === 'number');
    if (parameterKeys.length === 0) return neighbor;
    
    const randomKey = parameterKeys[Math.floor(Math.random() * parameterKeys.length)];
    const currentValue = neighbor[randomKey] as number;
    const range = this.constraints.parameterRanges.get(randomKey) || [currentValue * 0.5, currentValue * 2];
    
    // Add small random perturbation
    const perturbation = (Math.random() - 0.5) * (range[1] - range[0]) * 0.1;
    neighbor[randomKey] = Math.max(range[0], Math.min(range[1], currentValue + perturbation));
    
    return neighbor;
  }

  /**
   * Evaluate fitness of a parameter set
   */
  private async evaluateFitness(blueprint: StrategyBlueprint, parameters: ParameterSet): Promise<number> {
    const cacheKey = JSON.stringify(parameters);
    
    if (this.fitnessCache.has(cacheKey)) {
      return this.fitnessCache.get(cacheKey)!;
    }

    // Simulate strategy performance (in real implementation, this would run backtests)
    let fitness = 0;
    
    // Factor in parameter optimality
    Object.entries(parameters).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Penalize extreme values
        const range = this.constraints.parameterRanges.get(key) || [0, 100];
        const normalized = (value - range[0]) / (range[1] - range[0]);
        const penalty = Math.abs(normalized - 0.5) * 2; // 0 at center, 1 at extremes
        fitness += (1 - penalty) * 10;
      }
    });

    // Factor in strategy complexity (simpler is often better)
    const complexityPenalty = blueprint.components.length * 0.1;
    fitness -= complexityPenalty;

    // Add some randomness to simulate market variability
    fitness += (Math.random() - 0.5) * 5;

    // Ensure positive fitness
    fitness = Math.max(0, fitness);
    
    this.fitnessCache.set(cacheKey, fitness);
    return fitness;
  }

  /**
   * Evaluate specific objective
   */
  private async evaluateObjective(blueprint: StrategyBlueprint, parameters: ParameterSet, objective: string): Promise<number> {
    // This would integrate with actual backtesting system
    switch (objective) {
      case 'profit':
        return Math.random() * 100; // Simulated profit
      case 'risk':
        return Math.random() * 50; // Simulated risk score
      case 'drawdown':
        return Math.random() * 30; // Simulated max drawdown
      default:
        return Math.random() * 10;
    }
  }

  /**
   * Evolve population using genetic operators
   */
  private evolvePopulation(
    population: ParameterSet[],
    fitnessScores: number[],
    config: GeneticAlgorithmConfig
  ): ParameterSet[] {
    const newPopulation: ParameterSet[] = [];
    
    // Elitism - keep best individuals
    const eliteCount = Math.floor(population.length * config.elitismRate);
    const sortedIndices = fitnessScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .slice(0, eliteCount)
      .map(item => item.index);
    
    sortedIndices.forEach(index => {
      newPopulation.push({ ...population[index] });
    });

    // Generate offspring
    while (newPopulation.length < population.length) {
      const parent1 = this.tournamentSelection(population, fitnessScores);
      const parent2 = this.tournamentSelection(population, fitnessScores);
      
      let offspring1 = { ...parent1 };
      let offspring2 = { ...parent2 };
      
      // Crossover
      if (Math.random() < config.crossoverRate) {
        [offspring1, offspring2] = this.crossover(parent1, parent2);
      }
      
      // Mutation
      if (Math.random() < config.mutationRate) {
        offspring1 = this.mutate(offspring1);
      }
      if (Math.random() < config.mutationRate) {
        offspring2 = this.mutate(offspring2);
      }
      
      newPopulation.push(offspring1);
      if (newPopulation.length < population.length) {
        newPopulation.push(offspring2);
      }
    }
    
    return newPopulation;
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(population: ParameterSet[], fitnessScores: number[], tournamentSize = 3): ParameterSet {
    let bestIndex = Math.floor(Math.random() * population.length);
    let bestFitness = fitnessScores[bestIndex];
    
    for (let i = 1; i < tournamentSize; i++) {
      const candidateIndex = Math.floor(Math.random() * population.length);
      if (fitnessScores[candidateIndex] > bestFitness) {
        bestIndex = candidateIndex;
        bestFitness = fitnessScores[candidateIndex];
      }
    }
    
    return population[bestIndex];
  }

  /**
   * Crossover operation
   */
  private crossover(parent1: ParameterSet, parent2: ParameterSet): [ParameterSet, ParameterSet] {
    const offspring1: ParameterSet = {};
    const offspring2: ParameterSet = {};
    
    const keys = Object.keys(parent1);
    const crossoverPoint = Math.floor(Math.random() * keys.length);
    
    keys.forEach((key, index) => {
      if (index < crossoverPoint) {
        offspring1[key] = parent1[key];
        offspring2[key] = parent2[key];
      } else {
        offspring1[key] = parent2[key];
        offspring2[key] = parent1[key];
      }
    });
    
    return [offspring1, offspring2];
  }

  /**
   * Mutation operation
   */
  private mutate(individual: ParameterSet): ParameterSet {
    const mutated = { ...individual };
    const keys = Object.keys(mutated).filter(key => typeof mutated[key] === 'number');
    
    if (keys.length > 0) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const currentValue = mutated[randomKey] as number;
      const range = this.constraints.parameterRanges.get(randomKey) || [currentValue * 0.5, currentValue * 2];
      
      // Gaussian mutation
      const stdDev = (range[1] - range[0]) * 0.1;
      const mutation = this.gaussianRandom() * stdDev;
      mutated[randomKey] = Math.max(range[0], Math.min(range[1], currentValue + mutation));
    }
    
    return mutated;
  }

  /**
   * Generate Gaussian random number
   */
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Non-dominated sorting for multi-objective optimization
   */
  private nonDominatedSort(population: ParameterSet[], objectiveScores: Record<string, number>[]): number[][] {
    const fronts: number[][] = [];
    const dominationCount = new Array(population.length).fill(0);
    const dominatedSolutions: number[][] = Array.from({ length: population.length }, () => []);

    // Calculate domination relationships
    for (let i = 0; i < population.length; i++) {
      for (let j = 0; j < population.length; j++) {
        if (i !== j) {
          if (this.dominates(objectiveScores[i], objectiveScores[j])) {
            dominatedSolutions[i].push(j);
          } else if (this.dominates(objectiveScores[j], objectiveScores[i])) {
            dominationCount[i]++;
          }
        }
      }
    }

    // Find first front
    const firstFront: number[] = [];
    for (let i = 0; i < population.length; i++) {
      if (dominationCount[i] === 0) {
        firstFront.push(i);
      }
    }
    fronts.push(firstFront);

    // Find subsequent fronts
    let currentFront = 0;
    while (fronts[currentFront].length > 0) {
      const nextFront: number[] = [];
      for (const i of fronts[currentFront]) {
        for (const j of dominatedSolutions[i]) {
          dominationCount[j]--;
          if (dominationCount[j] === 0) {
            nextFront.push(j);
          }
        }
      }
      if (nextFront.length > 0) {
        fronts.push(nextFront);
      }
      currentFront++;
    }

    return fronts.filter(front => front.length > 0);
  }

  /**
   * Check if solution A dominates solution B
   */
  private dominates(scoresA: Record<string, number>, scoresB: Record<string, number>): boolean {
    let atLeastOneBetter = false;
    
    for (const objective in scoresA) {
      if (scoresA[objective] < scoresB[objective]) {
        return false; // A is worse in at least one objective
      }
      if (scoresA[objective] > scoresB[objective]) {
        atLeastOneBetter = true;
      }
    }
    
    return atLeastOneBetter;
  }

  /**
   * Calculate crowding distance for diversity preservation
   */
  private calculateCrowdingDistance(
    front: number[],
    objectiveScores: Record<string, number>[],
    objectives: string[]
  ): number[] {
    const distances = new Array(front.length).fill(0);
    
    for (const objective of objectives) {
      // Sort by objective value
      const sortedIndices = front
        .map((index, i) => ({ index, value: objectiveScores[index][objective], position: i }))
        .sort((a, b) => a.value - b.value);

      // Set boundary points to infinity
      distances[sortedIndices[0].position] = Infinity;
      distances[sortedIndices[sortedIndices.length - 1].position] = Infinity;

      // Calculate distances for intermediate points
      const range = sortedIndices[sortedIndices.length - 1].value - sortedIndices[0].value;
      if (range > 0) {
        for (let i = 1; i < sortedIndices.length - 1; i++) {
          const distance = (sortedIndices[i + 1].value - sortedIndices[i - 1].value) / range;
          distances[sortedIndices[i].position] += distance;
        }
      }
    }
    
    return distances;
  }

  /**
   * Clear fitness cache
   */
  clearCache(): void {
    this.fitnessCache.clear();
  }
}

// Singleton instance
export const strategyOptimizer = new StrategyOptimizer();