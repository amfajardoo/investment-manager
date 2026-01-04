import type { CDT } from './cdt';

export interface DashboardMetrics {
  totalInvested: number;
  portfolioValue: number;
  totalEarnings: number;
  annualizedReturn: number;
  realReturn: number;
  distribution: {
    cdts: number;
    fpv: number;
  };
  upcomingMaturities: CDT[];
}
