import { Injectable, inject } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type { Contribution, FPV, FPVCalculation } from '../models/fpv';
import { FpvStore } from '../store/fpv.store';
import { Authentication } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Fpv {
  private firestore = inject(Firestore);
  private authService = inject(Authentication);
  private fpvStore = inject(FpvStore);
  private fpvCollection = collection(this.firestore, 'fpv');

  // Colombian tax benefit limits (2025)
  private readonly MONTHLY_LIMIT_UVT = 100; // 100 UVT monthly
  private readonly ANNUAL_LIMIT_INCOME = 0.3; // 30% of net income
  private readonly UVT_2025 = 47065; // UVT value for 2025

  async createFPV(
    fpv: Omit<FPV, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    userId: string,
  ): Promise<string> {
    const fpvData = {
      ...fpv,
      userId,
      contributions: fpv.contributions.map((c) => ({
        ...c,
        date: Timestamp.fromDate(c.date),
        withdrawableDate: c.withdrawableDate ? Timestamp.fromDate(c.withdrawableDate) : null,
      })),
      lastUpdateDate: Timestamp.fromDate(fpv.lastUpdateDate),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(this.fpvCollection, fpvData);
    return docRef.id;
  }

  async updateFPV(id: string, updates: Partial<FPV>): Promise<void> {
    const fpvRef = doc(this.firestore, 'fpv', id);

    const updateData: Partial<FPV> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    // if (updates.contributions) {
    //   updateData.contributions = updates.contributions.map((c) => ({
    //     ...c,
    //     date: c.date ? Timestamp.fromDate(c.date) : serverTimestamp(),
    //     withdrawableDate: c.withdrawableDate ? Timestamp.fromDate(c.withdrawableDate) : null,
    //   }));
    // }

    // if (updates.lastUpdateDate) {
    //   updateData.lastUpdateDate = Timestamp.fromDate(updates.lastUpdateDate);
    // }

    await updateDoc(fpvRef, updateData);
  }

  async addContribution(
    fpvId: string,
    contribution: Omit<Contribution, 'withdrawable' | 'withdrawableDate'>,
  ): Promise<void> {
    const fpvRef = doc(this.firestore, 'fpv', fpvId);
    const fpvDoc = await getDocs(
      query(collection(this.firestore, 'fpv'), where('__name__', '==', fpvId)),
    );

    if (!fpvDoc.empty) {
      const fpvData = fpvDoc.docs[0].data() as FPV;

      // Calculate withdrawable date (10 years later)
      const withdrawableDate = new Date(contribution.date);
      withdrawableDate.setFullYear(withdrawableDate.getFullYear() + 10);

      const newContribution: Contribution = {
        ...contribution,
        withdrawable: false,
        withdrawableDate,
      };

      const contributions = [...(fpvData.contributions || []), newContribution];

      await updateDoc(fpvRef, {
        contributions: contributions.map((c) => ({
          ...c,
          date: Timestamp.fromDate(c.date),
          withdrawableDate: c.withdrawableDate ? Timestamp.fromDate(c.withdrawableDate) : null,
        })),
        updatedAt: serverTimestamp(),
      });
    }
  }

  async getFPVByUser(_: string) {
    // try {
    //   const q = query(this.fpvCollection, where('userId', '==', userId));
    //   const snapshot = await getDocs(q);
    //   const fpvAccounts = snapshot.docs.map((doc) => this.mapDocToFPV(doc));
    //   // Update store
    //   this.fpvStore.setFpvAccounts(fpvAccounts);
    //   return fpvAccounts;
    // } catch (error: unknown) {
    //   this.fpvStore.setError(error.message);
    //   return [];
    // }
  }

  calculateFPV(fpv: FPV): FPVCalculation {
    const totalContributions = fpv.contributions.reduce((sum, c) => sum + c.amount, 0);
    const currentValue = fpv.currentValue;
    const absoluteReturn = currentValue - totalContributions;
    const returnPercentage =
      totalContributions > 0 ? (absoluteReturn / totalContributions) * 100 : 0;

    const totalTaxBenefit = fpv.contributions.reduce((sum, c) => sum + c.taxBenefit, 0);

    // Calculate withdrawable contributions (more than 10 years)
    const now = new Date();
    const withdrawableContributionsList = fpv.contributions.filter((c) => {
      if (!c.withdrawableDate) return false;
      return c.withdrawableDate <= now;
    });

    const withdrawableAmount = withdrawableContributionsList.reduce((sum, c) => {
      // Calculate proportion of current value for this contribution
      const proportion = c.amount / totalContributions;
      return sum + currentValue * proportion;
    }, 0);

    const nonWithdrawableAmount = currentValue - withdrawableAmount;

    return {
      totalContributions,
      currentValue,
      absoluteReturn,
      returnPercentage,
      totalTaxBenefit,
      withdrawableAmount,
      nonWithdrawableAmount,
      withdrawableContributions: withdrawableContributionsList.length,
    };
  }

  calculateTaxBenefit(
    contributionAmount: number,
    monthlyIncome: number,
    contributionYear: number = new Date().getFullYear(),
  ): number {
    // Monthly limit: 100 UVT
    const monthlyLimit = this.MONTHLY_LIMIT_UVT * this.UVT_2025;

    // Income limit: 30% of income
    const incomeLimit = monthlyIncome * 0.3;

    // Benefit is the minimum between contribution and limits
    const benefit = Math.min(contributionAmount, monthlyLimit, incomeLimit);

    return benefit;
  }

  calculateAnnualTaxSavings(contributions: Contribution[], fiscalYear: number): number {
    const yearContributions = contributions.filter((c) => c.date.getFullYear() === fiscalYear);

    const totalBenefit = yearContributions.reduce((sum, c) => sum + c.taxBenefit, 0);

    // Average marginal rate in Colombia (varies by income)
    // Using 35% as example, this should be configurable
    const marginalRate = 0.35;

    return totalBenefit * marginalRate;
  }

  markWithdrawableContributions(fpv: FPV): FPV {
    const now = new Date();

    const updatedContributions = fpv.contributions.map((contribution) => ({
      ...contribution,
      withdrawable: contribution.withdrawableDate ? contribution.withdrawableDate <= now : false,
    }));

    return {
      ...fpv,
      contributions: updatedContributions,
    };
  }

  private mapDocToFPV(doc: any): FPV {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data['userId'],
      institutionName: data['institutionName'],
      contributions: (data['contributions'] || []).map((c: any) => ({
        date: c.date?.toDate() || new Date(),
        amount: c.amount,
        taxBenefit: c.taxBenefit,
        withdrawable: c.withdrawable,
        withdrawableDate: c.withdrawableDate?.toDate() || null,
      })),
      currentValue: data['currentValue'],
      lastUpdateDate: data['lastUpdateDate']?.toDate() || new Date(),
      createdAt: data['createdAt']?.toDate() || new Date(),
      updatedAt: data['updatedAt']?.toDate() || new Date(),
    };
  }
}
