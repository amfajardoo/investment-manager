import type { FieldValue, Timestamp } from '@angular/fire/firestore';

export interface Contribution {
  date: Date;
  amount: number;
  taxBenefit: number;
  withdrawable: boolean; // Retirable
  withdrawableDate?: Date;
}

export interface FPV {
  id?: string;
  userId: string;
  institutionName: string;
  contributions: Contribution[];
  currentValue: number;
  lastUpdateDate: Date;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface FPVCalculation {
  totalContributions: number;
  currentValue: number;
  absoluteReturn: number;
  returnPercentage: number;
  totalTaxBenefit: number;
  withdrawableAmount: number;
  nonWithdrawableAmount: number;
  withdrawableContributions: number;
}
