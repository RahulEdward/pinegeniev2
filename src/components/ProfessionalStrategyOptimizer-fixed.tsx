'use client';

import React, { useState } from 'react';

// Type definitions
interface OptimizationMetrics {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  winRate: number;
  totalTrades: number;
  averageWin: number;
  averageLoss: number;
}

interface OptimizationResults {
  algorithm: string;
  metrics: OptimizationMetrics;
  optimizedParameters: Record<string, number>;
  equityCurve: Array<{ day: number; equity: number }>;
  convergenceData: Array<{ generation: number; fitness: number }>;
  robustness: number;
  consistency: number;
}

interface ParameterConfig {
  min: number;
  max: number;
  default: number;
}

interface AlgorithmInfo {
  name: string;
  description: string;
  icon: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

interface ParameterCardProps {
  name: string;
  param: ParameterConfig;
  value: number;
  onChange: (value: number) => void;
}

interface AlgorithmCardProps {
  algorithm: string;
  data: AlgorithmInfo;
  isSelected: boolean;
  onSelect: () => void;
}

const ProfessionalStrategyOptimizer: React.FC = () => {
  const [optimizationStatus, setOptimizationStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [results, setResults] = useState<OptimizationResults | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('genetic');
  const [parameters, setParameters] = useState<Record<string, ParameterConfig>>({
    // RSI Strategy Parameters
    rsiPeriod: { min: 5, max: 30, default: 14 },
    rsiOverbought: { min: 60, max: 90, default: 70 },
    rsiOversold: { min: 10, max: 40, default: 30 },
    
    // Moving Average Parameters
    fastMA: { min: 5, max: 50, default: 12 },
    slowMA: { min: 20, max: 200, default: 26 },
    
    // Bollinger Bands
    bbPeriod: { min: 10, max: 50, default: 20 },
    bbStdDev: { min: 1.0, max: 3.0, default: 2.0 },
    
    // Risk Management
    stopLoss: { min: 0.5, max: 10.0, default: 2.0 },
    takeProfit: { min: 1.0, max: 20.0, default: 4.0 },
    maxPosition: { min: 10, max: 100, default: 50 }
  });

  // Algorithm configurations
  const algorithms: Record<string, AlgorithmInfo> = {
    genetic: {
      name: 'Genetic Algorithm',
      description: 'Evolutionary optimization mimicking natural selection',
      icon: '🧬',
      pros: ['Global optimization', 'Handles complex landscapes', 'Multiple solutions'],
      cons: ['Computationally intensive', 'Requires tuning'],
      bestFor: 'Complex multi-parameter optimization'
    },
    simulated_annealing: {
      name: 'Simulated Annealing',
      description: 'Probabilistic optimization avoiding local minima',
      icon: '🔥',
      pros: ['Escapes local minima', 'Simple implementation', 'Good convergence'],
      cons: ['Slower convergence', 'Temperature scheduling'],
      bestFor: 'Avoiding local optima'
    },
    particle_swarm: {
      name: 'Particle Swarm',
      description: 'Swarm intelligence optimization',
      icon: '🐝',
      pros: ['Fast convergence', 'Few parameters', 'Social learning'],
      cons: ['Premature convergence', 'Parameter dependent'],
      bestFor: 'Continuous parameter spaces'
    },
    bayesian: {
      name: 'Bayesian Optimization',
      description: 'Model-based optimization with uncertainty',
      icon: '🧠',
      pros: ['Sample efficient', 'Uncertainty quantification', 'Smart exploration'],
      cons: ['Complex implementation', 'Gaussian process overhead'],
      bestFor: 'Expensive function evaluations'
    },
    multi_objective: {
      name: 'Multi-Objective NSGA-II',
      description: 'Pareto-optimal solution finding',
      icon: '🎯',
      pros: ['Multiple objectives', 'Pareto frontier', 'Diverse solutions'],
      cons: ['Complex selection', 'Computational overhead'],
      bestFor: 'Trading off multiple metrics'
    }
  };

  const generateMockResults = (algorithm: string): OptimizationResults => {
    const baseReturn = Math.random() * 0.3 + 0.15; // 15-45% return
    const volatility = Math.random() * 0.15 + 0.1;  // 10-25% volatility
    
    return {
      algorithm,
      metrics: {
        totalReturn: baseReturn,
        sharpeRatio: baseReturn / volatility,
        maxDrawdown: Math.random() * 0.15 + 0.05,
        profitFactor: Math.random() * 1.5 + 1.2,
        winRate: Math.random() * 0.3 + 0.45,
        totalTrades: Math.floor(Math.random() * 200 + 50),
        averageWin: Math.random() * 2 + 1,
        averageLoss: Math.random() * 1.5 + 0.5
      },
      optimizedParameters: {
        rsiPeriod: Math.floor(Math.random() * 20 + 10),
        rsiOverbought: Math.floor(Math.random() * 20 + 70),
        rsiOversold: Math.floor(Math.random() * 20 + 20),
        fastMA: Math.floor(Math.random() * 30 + 10),
        slowMA: Math.floor(Math.random() * 100 + 50),
        bbPeriod: Math.floor(Math.random() * 30 + 15),
        bbStdDev: Math.random() * 1.5 + 1.5,
        stopLoss: Math.random() * 5 + 1,
        takeProfit: Math.random() * 10 + 2,
        maxPosition: Math.floor(Math.random() * 50 + 25)
      },
      equityCurve: Array.from({ length: 252 }, (_, i) => ({
        day: i,
        equity: 10000 * (1 + baseReturn * (i / 252) + (Math.random() - 0.5) * 0.1)
      })),
      convergenceData: generateConvergenceData(algorithm),
      robustness: Math.random() * 0.3 + 0.7,
      consistency: Math.random() * 0.2 + 0.8
    };
  };

  const generateConvergenceData = (algorithm: string) => {
    const generations = algorithm === 'bayesian' ? 50 : 100;
    const data = [];
    let fitness = Math.random() * 0.5 + 0.5;
    
    for (let i = 0; i < generations; i++) {
      fitness += (Math.random() - 0.3) * 0.05;
      fitness = Math.min(fitness, 2.5);
      data.push({ generation: i, fitness });
    }
    
    return data;
  };

  const runOptimization = () => {
    setOptimizationStatus('running');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setOptimizationStatus('completed');
          const mockResults = generateMockResults(selectedAlgorithm);
          setResults(mockResults);
          return 100;
        }
        return prev + Math.random() * 10 + 5;
      });
    }, 500);
  };

  const ParameterCard: React.FC<ParameterCardProps> = ({ name, param, value, onChange }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {name}
      </label>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={name.includes('Std') ? 0.1 : 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{param.min}</span>
        <span className="font-semibold text-blue-600">{value}</span>
        <span>{param.max}</span>
      </div>
    </div>
  );

  const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ algorithm, data, isSelected, onSelect }) => (
    <div 
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900">{data.name}</h3>
          <p className="text-sm text-gray-600">{data.description}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-1">Advantages:</h4>
          <ul className="text-xs text-green-600">
            {data.pros.map((pro: string, i: number) => <li key={i}>• {pro}</li>)}
          </ul>
        </div>
        
        <div className="text-xs">
          <span className="font-medium text-blue-700">Best for:</span>
          <span className="text-blue-600 ml-1">{data.bestFor}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 Pine Genie Pro Strategy Optimizer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional-grade strategy optimization using advanced algorithms. 
            Maximize your Pine Script strategy performance with multi-objective optimization.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Algorithm Selection */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🔬 Select Algorithm
              </h2>
              <div className="space-y-3">
                {Object.entries(algorithms).map(([key, data]) => (
                  <AlgorithmCard
                    key={key}
                    algorithm={key}
                    data={data}
                    isSelected={selectedAlgorithm === key}
                    onSelect={() => setSelectedAlgorithm(key)}
                  />
                ))}
              </div>
            </div>

            {/* Parameter Configuration */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ⚙️ Strategy Parameters
              </h2>
              <div className="space-y-4">
                {Object.entries(parameters).map(([key, param]) => (
                  <ParameterCard
                    key={key}
                    name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    param={param}
                    value={param.default}
                    onChange={(value: number) => setParameters(prev => ({
                      ...prev,
                      [key]: { ...prev[key], default: value }
                    }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Optimization & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Control Panel */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{algorithms[selectedAlgorithm as keyof typeof algorithms].icon}</span>
                  <span className="text-xl font-medium">{algorithms[selectedAlgorithm as keyof typeof algorithms].name}</span>
                </div>
                <button
                  onClick={runOptimization}
                  disabled={optimizationStatus === 'running'}
                  className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                    optimizationStatus === 'running'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {optimizationStatus === 'running' ? '🔄 Optimizing...' : '🚀 Start Optimization'}
                </button>
              </div>

              {optimizationStatus === 'running' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Optimization Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Panel */}
            {results && (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    📊 Optimization Results
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(results.metrics.totalReturn * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Total Return</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.metrics.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {(results.metrics.maxDrawdown * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Max Drawdown</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.metrics.profitFactor.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Profit Factor</div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Equity Curve */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Equity Curve</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">📈</div>
                        <div>Equity curve visualization</div>
                        <div className="text-sm">(Chart component needed)</div>
                      </div>
                    </div>
                  </div>

                  {/* Convergence */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Algorithm Convergence</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎯</div>
                        <div>Convergence visualization</div>
                        <div className="text-sm">(Chart component needed)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimized Parameters */}
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Optimized Parameters</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(results.optimizedParameters).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="text-lg font-semibold text-blue-600">{(value as number).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalStrategyOptimizer;
