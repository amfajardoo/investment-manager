export interface ReinvestmentSimulation {
  termMonths: number;
  rate: number;
  initialAmount: number;
  strategy: 'simple' | 'compound';
  projection: Projection[];
}

export interface Projection {
  date: Date;
  value: number;
  interest: number;
}
