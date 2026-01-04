export interface ReinvestmentSimulation {
  termMonths: number;
  rate: number;
  initialAmount: number;
  strategy: 'simple' | 'compound';
  projection: {
    date: Date;
    value: number;
    interest: number;
  }[];
}
