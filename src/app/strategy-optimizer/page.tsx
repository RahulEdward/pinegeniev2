import ProfessionalStrategyOptimizer from '@/components/ProfessionalStrategyOptimizer';

export const metadata = {
  title: 'Professional Strategy Optimizer | Pine Genie',
  description: 'Advanced parameter optimization for Pine Script strategies using genetic algorithms, simulated annealing, and more.',
};

export default function StrategyOptimizerPage() {
  return (
    <div className="min-h-screen">
      <ProfessionalStrategyOptimizer />
    </div>
  );
}
