import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { CDT } from '../models/cdt';

export interface CdtState {
  cdts: CDT[];
  selectedCdt: CDT | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CdtState = {
  cdts: [],
  selectedCdt: null,
  isLoading: false,
  error: null,
};

export const CdtStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ cdts }) => ({
    activeCdts: computed(() => cdts().filter((cdt) => cdt.status === 'active')),

    maturedCdts: computed(() => cdts().filter((cdt) => cdt.status === 'matured')),

    totalInvested: computed(() =>
      cdts()
        .filter((cdt) => cdt.status === 'active')
        .reduce((sum, cdt) => sum + cdt.amount, 0)
    ),

    cdtCount: computed(() => cdts().length),

    activeCdtCount: computed(() => cdts().filter((cdt) => cdt.status === 'active').length),

    upcomingMaturities: computed(() => {
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      return cdts()
        .filter(
          (cdt) =>
            cdt.status === 'active' &&
            cdt.maturityDate >= now &&
            cdt.maturityDate <= thirtyDaysFromNow
        )
        .sort((a, b) => a.maturityDate.getTime() - b.maturityDate.getTime());
    }),
  })),

  withMethods((store) => ({
    // Load all CDTs
    setCdts(cdts: CDT[]): void {
      patchState(store, { cdts, isLoading: false, error: null });
    },

    // Add a new CDT
    addCdt(cdt: CDT): void {
      patchState(store, (state) => ({
        cdts: [...state.cdts, cdt],
      }));
    },

    // Update existing CDT
    updateCdt(updatedCdt: CDT): void {
      patchState(store, (state) => ({
        cdts: state.cdts.map((cdt) => (cdt.id === updatedCdt.id ? updatedCdt : cdt)),
      }));
    },

    // Delete CDT
    deleteCdt(cdtId: string): void {
      patchState(store, (state) => ({
        cdts: state.cdts.filter((cdt) => cdt.id !== cdtId),
        selectedCdt: state.selectedCdt?.id === cdtId ? null : state.selectedCdt,
      }));
    },

    // Select CDT for editing
    selectCdt(cdt: CDT | null): void {
      patchState(store, { selectedCdt: cdt });
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

    // Clear all CDTs (logout)
    clearCdts(): void {
      patchState(store, initialState);
    },
  }))
);
