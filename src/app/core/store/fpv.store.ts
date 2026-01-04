import { computed, inject } from '@angular/core';
import { collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import type { Contribution, FPV } from '../models/fpv';
import { AuthStore } from './auth.store';

export interface FpvState {
  fpvAccounts: FPV[];
  selectedFpv: FPV | null;
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

const initialState: FpvState = {
  fpvAccounts: [],
  selectedFpv: null,
  isLoading: false,
  error: null,
  lastSync: null,
};

export const FpvStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withProps(() => ({
    firestore: inject(Firestore),
    authStore: inject(AuthStore),
  })),

  withComputed(({ fpvAccounts }) => ({
    totalFpvValue: computed(() => fpvAccounts().reduce((sum, fpv) => sum + fpv.currentValue, 0)),

    totalContributions: computed(() =>
      fpvAccounts().reduce((sum, fpv) => {
        const accountTotal = fpv.contributions.reduce((acc, c) => acc + c.amount, 0);
        return sum + accountTotal;
      }, 0),
    ),

    totalEarnings: computed(() => {
      const total = fpvAccounts().reduce((sum, fpv) => {
        const contributions = fpv.contributions.reduce((acc, c) => acc + c.amount, 0);
        return sum + (fpv.currentValue - contributions);
      }, 0);
      return total;
    }),

    totalReturnPercentage: computed(() => {
      const contributions = fpvAccounts().reduce((sum, fpv) => {
        return sum + fpv.contributions.reduce((acc, c) => acc + c.amount, 0);
      }, 0);

      const currentValue = fpvAccounts().reduce((sum, fpv) => sum + fpv.currentValue, 0);

      if (contributions === 0) return 0;
      return ((currentValue - contributions) / contributions) * 100;
    }),

    totalTaxBenefits: computed(() =>
      fpvAccounts().reduce((sum, fpv) => {
        const accountBenefits = fpv.contributions.reduce((acc, c) => acc + c.taxBenefit, 0);
        return sum + accountBenefits;
      }, 0),
    ),

    totalWithdrawable: computed(() => {
      const now = new Date();
      return fpvAccounts().reduce((sum, fpv) => {
        const totalContributions = fpv.contributions.reduce((acc, c) => acc + c.amount, 0);
        const withdrawableContributions = fpv.contributions.filter(
          (c) => c.withdrawableDate && c.withdrawableDate <= now,
        );

        const withdrawableAmount = withdrawableContributions.reduce((acc, c) => {
          const proportion = totalContributions > 0 ? c.amount / totalContributions : 0;
          return acc + fpv.currentValue * proportion;
        }, 0);

        return sum + withdrawableAmount;
      }, 0);
    }),

    totalNonWithdrawable: computed(() => {
      const totalValue = fpvAccounts().reduce((sum, fpv) => sum + fpv.currentValue, 0);
      const withdrawable = fpvAccounts().reduce((sum, fpv) => {
        const now = new Date();
        const totalContributions = fpv.contributions.reduce((acc, c) => acc + c.amount, 0);
        const withdrawableContributions = fpv.contributions.filter(
          (c) => c.withdrawableDate && c.withdrawableDate <= now,
        );

        const withdrawableAmount = withdrawableContributions.reduce((acc, c) => {
          const proportion = totalContributions > 0 ? c.amount / totalContributions : 0;
          return acc + fpv.currentValue * proportion;
        }, 0);

        return sum + withdrawableAmount;
      }, 0);

      return totalValue - withdrawable;
    }),

    fpvCount: computed(() => fpvAccounts().length),

    hasWithdrawableFunds: computed(() => {
      const now = new Date();
      return fpvAccounts().some((fpv) =>
        fpv.contributions.some((c) => c.withdrawableDate && c.withdrawableDate <= now),
      );
    }),
  })),

  withMethods((store) => ({
    // Load all FPV accounts from Firestore
    async loadFpvAccounts(): Promise<void> {
      const userId = store.authStore.user()?.uid;
      if (!userId) {
        console.warn('Cannot load FPV accounts: User not authenticated');
        return;
      }

      patchState(store, { isLoading: true, error: null });

      try {
        const fpvCollection = collection(store.firestore, 'fpv');
        const q = query(fpvCollection, where('userId', '==', userId));

        const snapshot = await getDocs(q);
        const fpvAccounts: FPV[] = snapshot.docs.map((doc) => {
          // biome-ignore-start lint/complexity/useLiteralKeys: no type inference

          const data = doc.data();
          return {
            id: doc.id,
            userId: data['userId'],
            institutionName: data['institutionName'],
            contributions: (data['contributions'] || []).map((c: Contribution) => ({
              date: c.date || new Date(),
              amount: c.amount,
              taxBenefit: c.taxBenefit,
              withdrawable: c.withdrawable,
              withdrawableDate: c.withdrawableDate || null,
            })),
            currentValue: data['currentValue'],
            lastUpdateDate: data['lastUpdateDate']?.toDate() || new Date(),
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
          };
          // biome-ignore-end lint/complexity/useLiteralKeys: no type inference
        });

        patchState(store, {
          fpvAccounts,
          isLoading: false,
          lastSync: new Date(),
        });

        console.log(`Loaded ${fpvAccounts.length} FPV accounts`);
      } catch (error: unknown) {
        console.error('Error loading FPV accounts:', error);
        patchState(store, {
          error: 'Error loading FPV accounts:',
          isLoading: false,
        });
      }
    },

    // Set FPV accounts (used by service)
    setFpvAccounts(fpvAccounts: FPV[]): void {
      patchState(store, {
        fpvAccounts,
        isLoading: false,
        error: null,
        lastSync: new Date(),
      });
    },

    // Add a new FPV account
    addFpv(fpv: FPV): void {
      patchState(store, (state) => ({
        fpvAccounts: [...state.fpvAccounts, fpv],
      }));
    },

    // Update existing FPV account
    updateFpv(updatedFpv: FPV): void {
      patchState(store, (state) => ({
        fpvAccounts: state.fpvAccounts.map((fpv) => (fpv.id === updatedFpv.id ? updatedFpv : fpv)),
      }));
    },

    // Delete FPV account
    deleteFpv(fpvId: string): void {
      patchState(store, (state) => ({
        fpvAccounts: state.fpvAccounts.filter((fpv) => fpv.id !== fpvId),
        selectedFpv: state.selectedFpv?.id === fpvId ? null : state.selectedFpv,
      }));
    },

    // Select FPV for editing
    selectFpv(fpv: FPV | null): void {
      patchState(store, { selectedFpv: fpv });
    },

    // Set loading state
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    // Set error
    setError(error: string): void {
      patchState(store, { error, isLoading: false });
    },

    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    },

    // Clear all FPV accounts (logout)
    clearFpv(): void {
      patchState(store, initialState);
    },
  })),

  withHooks({
    onInit(store) {
      console.log('FpvStore initialized');

      // Auto-load FPV accounts when user is authenticated
      if (store.authStore.isAuthenticated()) {
        store.loadFpvAccounts();
      }
    },

    onDestroy() {
      console.log('FpvStore destroyed');
    },
  }),
);
