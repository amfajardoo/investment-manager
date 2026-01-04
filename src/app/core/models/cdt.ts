import type { FieldValue, Timestamp } from '@angular/fire/firestore';

export interface CDT {
  id?: string;
  userId: string;
  bankName: string;
  amount: number;
  annualRate: number; // Tasa Efectiva Anual
  startDate: Date;
  maturityDate: Date; // Fecha de vencimiento
  withholdingTax: number; // % retención en la fuente
  status: 'active' | 'matured' | 'renewed'; // Estado del CDT -> activo, vencido, renovado
  alertSent: boolean;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface CDTCalculation {
  initialAmount: number;
  grossEarnings: number; // Ganancia bruta
  withholdingTax: number;
  netEarnings: number;
  finalAmount: number;
  daysElapsed: number;
  totalDays: number;
  effectiveRate: number;
}
