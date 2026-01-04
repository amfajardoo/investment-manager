import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type { CDT, CDTCalculation } from '../models/cdt';

@Injectable({
  providedIn: 'root',
})
export class Cdt {
  private firestore = inject(Firestore);

  private cdtsCollection = collection(this.firestore, 'cdts');

  async createCDT(
    cdt: Omit<CDT, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    userId: string,
  ): Promise<string> {
    const cdtData = {
      ...cdt,
      userId,
      startDate: Timestamp.fromDate(cdt.startDate),
      maturityDate: Timestamp.fromDate(cdt.maturityDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(this.cdtsCollection, cdtData);
    return docRef.id;
  }

  async updateCDT(id: string, updates: Partial<CDT>): Promise<void> {
    const cdtRef = doc(this.firestore, 'cdts', id);

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate);
    }
    if (updates.maturityDate) {
      updateData.maturityDate = Timestamp.fromDate(updates.maturityDate);
    }

    await updateDoc(cdtRef, updateData);
  }

  async deleteCDT(id: string): Promise<void> {
    const cdtRef = doc(this.firestore, 'cdts', id);
    await deleteDoc(cdtRef);
  }

  async getCDTsByUser(userId: string): Promise<CDT[]> {
    const q = query(
      this.cdtsCollection,
      where('userId', '==', userId),
      orderBy('maturityDate', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.mapDocToCDT(doc));
  }

  async getActiveCDTs(userId: string): Promise<CDT[]> {
    const q = query(
      this.cdtsCollection,
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('maturityDate', 'asc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.mapDocToCDT(doc));
  }

  calculateCDT(cdt: CDT, currentDate?: Date): CDTCalculation {
    const start = cdt.startDate.getTime();
    const maturity = cdt.maturityDate.getTime();
    const current = currentDate ? currentDate.getTime() : Date.now();

    const totalDays = Math.ceil((maturity - start) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.min(Math.ceil((current - start) / (1000 * 60 * 60 * 24)), totalDays);

    // Calculate effective rate for the period
    const periodRate = (1 + cdt.annualRate / 100) ** (daysElapsed / 365) - 1;
    const grossEarnings = cdt.amount * periodRate;
    const withholdingTax = grossEarnings * (cdt.withholdingTax / 100);
    const netEarnings = grossEarnings - withholdingTax;
    const finalAmount = cdt.amount + netEarnings;

    return {
      initialAmount: cdt.amount,
      grossEarnings,
      withholdingTax,
      netEarnings,
      finalAmount,
      daysElapsed,
      totalDays,
      effectiveRate: periodRate * 100,
    };
  }

  getDaysUntilExpiration(cdt: CDT): number {
    const now = Date.now();
    const expiration = cdt.maturityDate.getTime();
    return Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
  }

  shouldSendAlert(cdt: CDT, daysInAdvance: number = 30): boolean {
    const daysUntil = this.getDaysUntilExpiration(cdt);
    return !cdt.alertSent && daysUntil <= daysInAdvance && daysUntil > 0;
  }

  // Rate conversions
  convertEAtoEM(annualRate: number): number {
    // Effective Annual to Effective Monthly
    return ((1 + annualRate / 100) ** (1 / 12) - 1) * 100;
  }

  convertEMtoEA(monthlyRate: number): number {
    // Effective Monthly to Effective Annual
    return ((1 + monthlyRate / 100) ** 12 - 1) * 100;
  }

  convertNVtoEA(nominalRate: number, periods: number): number {
    // Nominal Rate to Effective Annual
    return ((1 + nominalRate / (100 * periods)) ** periods - 1) * 100;
  }

  private mapDocToCDT(doc: any): CDT {
    const data = doc.data();

    return {
      id: doc.id,
      userId: data['userId'],
      bankName: data['bankName'],
      amount: data['amount'],
      annualRate: data['annualRate'],
      startDate: data['startDate']?.toDate() || new Date(),
      maturityDate: data['maturityDate']?.toDate() || new Date(),
      withholdingTax: data['withholdingTax'],
      status: data['status'],
      alertSent: data['alertSent'],
      createdAt: data['createdAt']?.toDate() || new Date(),
      updatedAt: data['updatedAt']?.toDate() || new Date(),
    };
  }
}
