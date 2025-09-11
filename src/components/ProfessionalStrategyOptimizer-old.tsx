'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';

const ProfessionalStrategyOptimizer = () => {
  const [optimizationStatus, setOptimizationStatus] = useState('idle');
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('genetic');
  const [parameters, setParameters] = useState({
    // RSI Strategy Parameters
    rsiPeriod: { min: 5, max: 30, default: 14 },
    rsiOverbought: { min: 60, max: 90, default: 70 },
    rsiOversold: { min: 10, max: 40, default: 30 },
    
    // Moving Average Parameters
    fastMA: { min: 5, max: 50, default: 10 },
    slowMA: { min: 20, max: 200, default: 50 },
    
    // Bollinger Bands
    bbPeriod: { min: 10, max: 50, default: 20 },
    bbStdDev: { min: 1, max: 3, default: 2, step: 0.1 },
    
    // Stop Loss & Take Profit
    stopLoss: { min: 0.5, max: 10, default: 2, step: 0.1 },
    takeProfit: { min: 1, max: 20, default: 6, step: 0.1 },
    
    // Position Sizing
    riskPerTrade: { min: 0.5, max: 5, default: 1, step: 0.1 },
    maxPosition: { min: 0.1, max: 1, default: 0.5, step: 0.1 }
  });

  const algorithms = {
    genetic: {
      name: 'Genetic Algorithm',
      description: 'Evolutionary optimization using natural selection',
      icon: '🧬',
      pros: ['Best for complex parameter spaces', 'Global optimization', 'Robust results'],
      cons: ['Computationally intensive', 'Longer optimization time'],
      bestFor: 'Multi-parameter strategies'
    },
    simulated_annealing: {
      name: 'Simulated Annealing',
      description: 'Physics-inspired optimization avoiding local optima',
      icon: '🌡️',
      pros: ['Avoids local optima', 'Good convergence', 'Memory efficient'],
      cons: ['Slower than genetic', 'Parameter tuning needed'],
      bestFor: 'Strategies with many local optima'
    },
    particle_swarm: {
      name: 'Particle Swarm',
      description: 'Swarm intelligence optimization',
      icon: '🐝',
      pros: ['Fast convergence', 'Simple implementation', 'Good exploration'],
      cons: ['Can get trapped', 'Premature convergence'],
      bestFor: 'Real-time optimization'
    },
    bayesian: {
      name: 'Bayesian Optimization',
      description: 'Gaussian process-based smart optimization',
      icon: '🤖',
      pros: ['Sample efficient', 'Uncertainty quantification', 'Smart exploration'],
      cons: ['Limited to small dimensions', 'Complex implementation'],
      bestFor: 'Expensive function evaluations'
    },
    multi_objective: {
      name: 'Multi-Objective (NSGA-II)',
      description: 'Optimize multiple metrics simultaneously',
      icon: '🎯',
      pros: ['Pareto optimal solutions', 'Multiple objectives', 'Trade-off analysis'],
      cons: ['Complex results', 'Harder to interpret'],
      bestFor: 'Balancing return vs risk'
    }
  };

  const startOptimization = async () => {
    setOptimizationStatus('running');
    setProgress(0);
    
    try {
      // Simulate optimization process
      const totalSteps = 100;
      
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setProgress((i / totalSteps) * 100);
      }
      
      // Generate mock results
      const mockResults = generateMockResults(selectedAlgorithm);
      setResults(mockResults);
      setOptimizationStatus('completed');
      
    } catch (error) {
      console.error('Optimization failed:', error);
      setOptimizationStatus('error');
    }
  };

  const generateMockResults = (algorithm) => {
    const baseMetrics = {
      totalReturn: 0.45 + Math.random() * 0.3,
      sharpeRatio: 1.2 + Math.random() * 0.8,
      maxDrawdown: -(0.05 + Math.random() * 0.15),
      profitFactor: 1.5 + Math.random() * 0.8,
      winRate: 0.55 + Math.random() * 0.2,
      totalTrades: Math.floor(150 + Math.random() * 100),
      averageWin: 120 + Math.random() * 80,
      averageLoss: -(80 + Math.random() * 40)
    };

    const optimizedParams = {
      rsiPeriod: 14 + Math.floor(Math.random() * 6),
      rsiOverbought: 70 + Math.floor(Math.random() * 10),
      rsiOversold: 30 - Math.floor(Math.random() * 10),
      fastMA: 10 + Math.floor(Math.random() * 5),
      slowMA: 50 + Math.floor(Math.random() * 20),
      bbPeriod: 20 + Math.floor(Math.random() * 5),
      bbStdDev: 2 + Math.random() * 0.5,
      stopLoss: 2 + Math.random() * 1,
      takeProfit: 6 + Math.random() * 2,
      riskPerTrade: 1 + Math.random() * 0.5,
      maxPosition: 0.5 + Math.random() * 0.3
    };

    // Generate equity curve
    const equityCurve = [];
    let equity = 100000;
    for (let i = 0; i < 252; i++) {
      equity += equity * (Math.random() - 0.48) * 0.02;
      equityCurve.push({
        day: i,
        equity,
        drawdown: Math.random() * baseMetrics.maxDrawdown
      });
    }

    // Generate parameter heatmap data
    const heatmapData = [];
    for (let rsi = 10; rsi <= 20; rsi += 2) {
      for (let ma = 8; ma <= 16; ma += 2) {
        heatmapData.push({
          rsiPeriod: rsi,
          fastMA: ma,
          sharpeRatio: 0.5 + Math.random() * 1.5,
          returns: Math.random() * 0.6
        });
      }
    }

    return {
      algorithm,
      metrics: baseMetrics,
      optimizedParameters: optimizedParams,
      equityCurve,
      heatmapData,
      convergenceData: generateConvergenceData(algorithm),
      robustnessScore: 0.7 + Math.random() * 0.25,
      consistency: 0.65 + Math.random() * 0.3
    };
  };

  const generateConvergenceData = (algorithm) => {
    const data = [];
    let bestFitness = 0.5;
    
    for (let i = 0; i < 100; i++) {
      if (Math.random() > 0.7) {
        bestFitness += Math.random() * 0.05;
      }
      data.push({
        iteration: i + 1,
        fitness: bestFitness,
        diversity: Math.max(0.1, 1 - (i / 100)) + Math.random() * 0.1
      });
    }
    
    return data;
  };

  const ParameterCard = ({ name, param, value, onChange }) => (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">{name}</label>
          <span className="text-sm text-blue-600 font-mono">{value}</span>
        </div>
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step || 1}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{param.min}</span>
          <span>{param.max}</span>
        </div>
      </div>
    </Card>
  );

  const AlgorithmCard = ({ algorithm, data, isSelected, onSelect }) => (
    <Card 
      className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
      onClick={() => onSelect(algorithm)}
    >
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{data.icon}</span>
          <div>
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-sm text-gray-600">{data.description}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-green-600">Pros:</span>
            <ul className="text-xs text-gray-600 ml-2">
              {data.pros.map((pro, i) => <li key={i}>• {pro}</li>)}
            </ul>
          </div>
          <div>
            <span className="text-xs font-medium text-orange-600">Best for:</span>
            <span className="text-xs text-gray-600 ml-1">{data.bestFor}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Professional Strategy Optimizer
          </h1>
          <p className="text-gray-600">Advanced parameter optimization for Pine Script strategies</p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎛️ Strategy Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Object.entries(parameters).map(([key, param]) => (
                    <ParameterCard
                      key={key}
                      name={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      param={param}
                      value={param.default}
                      onChange={(value) => setParameters(prev => ({
                        ...prev,
                        [key]: { ...prev[key], default: value }
                      }))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithms Tab */}
          <TabsContent value="algorithms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(algorithms).map(([key, algorithm]) => (
                <AlgorithmCard
                  key={key}
                  algorithm={key}
                  data={algorithm}
                  isSelected={selectedAlgorithm === key}
                  onSelect={setSelectedAlgorithm}
                />
              ))}
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Run Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Selected Algorithm</h3>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl">{algorithms[selectedAlgorithm].icon}</span>
                      <span className="text-xl font-medium">{algorithms[selectedAlgorithm].name}</span>
                    </div>
                  </div>

                  {optimizationStatus === 'running' && (
                    <div className="space-y-3">
                      <Progress value={progress} className="w-full max-w-md mx-auto" />
                      <p className="text-sm text-gray-600">
                        Optimizing... {Math.round(progress)}% complete
                      </p>
                    </div>
                  )}

                  {optimizationStatus === 'idle' && (
                    <Button 
                      onClick={startOptimization}
                      size="lg"
                      className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      🚀 Start Optimization
                    </Button>
                  )}

                  {optimizationStatus === 'completed' && (
                    <div className="space-y-3">
                      <div className="text-green-600 text-lg font-semibold">✅ Optimization Complete!</div>
                      <Button onClick={() => setOptimizationStatus('idle')} variant="outline">
                        Run Again
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {results ? (
              <>
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(results.metrics.totalReturn * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Total Return</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.metrics.sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Sharpe Ratio</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(results.metrics.maxDrawdown * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Max Drawdown</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.metrics.profitFactor.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Profit Factor</div>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>📈 Equity Curve</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.equityCurve}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>🔥 Convergence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={results.convergenceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="iteration" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="fitness" stroke="#16a34a" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Optimized Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle>⚙️ Optimized Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(results.optimizedParameters).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">{key}</div>
                          <div className="text-lg font-semibold text-blue-600">{value.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Run an optimization to see results here
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalStrategyOptimizer;
