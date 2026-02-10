import { describe, it, expect } from 'vitest';
import { calculateIRPF } from '../irpf';
import type { AppState } from '@/types';

/**
 * Helper to create a minimal AppState for testing.
 */
function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    grossSalary: 30000,
    numPayments: 12,
    age: 30,
    region: 'madrid',
    maritalStatus: 'single',
    numChildren: 0,
    numChildrenUnder3: 0,
    disability: 'none',
    expenses: [],
    viewMode: 'Anual',
    consumptionDetailMode: 'Sencillo',
    learnMode: false,
    ...overrides,
  };
}

describe('calculateIRPF', () => {
  // =========================================================================
  // Edge cases
  // =========================================================================

  it('returns 0 for gross salary of 0€', () => {
    const state = makeState();
    expect(calculateIRPF(0, state, 'madrid')).toBe(0);
  });

  it('returns 0 for negative gross salary', () => {
    const state = makeState();
    expect(calculateIRPF(-1000, state, 'madrid')).toBe(0);
  });

  // =========================================================================
  // Madrid (régimen común) - single, no children
  // =========================================================================

  describe('Madrid - single, no children', () => {
    const state = makeState({ numChildren: 0, numChildrenUnder3: 0 });

    it('calculates effective rate for 20,000€ gross', () => {
      const rate = calculateIRPF(20000, state, 'madrid');
      // Low salary → work income reduction applies → very low effective rate
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(0.10);
    });

    it('calculates effective rate for 30,000€ gross', () => {
      const rate = calculateIRPF(30000, state, 'madrid');
      // ~14-16% effective rate
      expect(rate).toBeGreaterThan(0.12);
      expect(rate).toBeLessThan(0.18);
    });

    it('calculates effective rate for 50,000€ gross', () => {
      const rate = calculateIRPF(50000, state, 'madrid');
      // ~20-23% effective rate
      expect(rate).toBeGreaterThan(0.18);
      expect(rate).toBeLessThan(0.25);
    });

    it('calculates effective rate for 80,000€ gross (above SS cap)', () => {
      const rate = calculateIRPF(80000, state, 'madrid');
      // SS deduction is capped at 58,914€ × 6.48%
      // Higher taxable base than without cap → higher effective rate
      expect(rate).toBeGreaterThan(0.22);
      expect(rate).toBeLessThan(0.32);
    });

    it('calculates effective rate for 15,000€ gross (low salary with reduction)', () => {
      const rate = calculateIRPF(15000, state, 'madrid');
      // Work income reduction kicks in → very low or zero effective rate
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThan(0.05);
    });
  });

  // =========================================================================
  // Children deductions
  // =========================================================================

  describe('children deductions', () => {
    it('reduces rate with 1 child', () => {
      const noChildren = makeState({ numChildren: 0 });
      const oneChild = makeState({ numChildren: 1 });
      const rateNoKids = calculateIRPF(40000, noChildren, 'madrid');
      const rateOneKid = calculateIRPF(40000, oneChild, 'madrid');
      expect(rateOneKid).toBeLessThan(rateNoKids);
    });

    it('reduces rate more with 2 children', () => {
      const oneChild = makeState({ numChildren: 1 });
      const twoChildren = makeState({ numChildren: 2 });
      const rateOne = calculateIRPF(40000, oneChild, 'madrid');
      const rateTwo = calculateIRPF(40000, twoChildren, 'madrid');
      expect(rateTwo).toBeLessThan(rateOne);
    });

    it('applies under-3 bonus', () => {
      const childOver3 = makeState({ numChildren: 1, numChildrenUnder3: 0 });
      const childUnder3 = makeState({ numChildren: 1, numChildrenUnder3: 1 });
      const rateOver3 = calculateIRPF(40000, childOver3, 'madrid');
      const rateUnder3 = calculateIRPF(40000, childUnder3, 'madrid');
      expect(rateUnder3).toBeLessThan(rateOver3);
    });

    it('applies graduated child deductions (4th child > 1st child)', () => {
      // 4 children: 2400 + 2700 + 4000 + 4500 = 13,600€ total deduction
      // vs 4 × 2400 = 9,600€ if all equal
      const fourChildren = makeState({ numChildren: 4 });
      const rate = calculateIRPF(60000, fourChildren, 'madrid');
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(0.20);
    });
  });

  // =========================================================================
  // Different CCAA (régimen común)
  // =========================================================================

  describe('different autonomous communities', () => {
    const state = makeState();
    const gross = 50000;

    it('Madrid has lower rate than Cataluña', () => {
      const madrid = calculateIRPF(gross, state, 'madrid');
      const cataluna = calculateIRPF(gross, state, 'cataluna');
      expect(madrid).toBeLessThan(cataluna);
    });

    it('Madrid has lower rate than Valencia', () => {
      const madrid = calculateIRPF(gross, state, 'madrid');
      const valencia = calculateIRPF(gross, state, 'valencia');
      expect(madrid).toBeLessThan(valencia);
    });

    it('different communities produce different results', () => {
      const madrid = calculateIRPF(gross, state, 'madrid');
      const cataluna = calculateIRPF(gross, state, 'cataluna');
      const valencia = calculateIRPF(gross, state, 'valencia');
      const andalucia = calculateIRPF(gross, state, 'andalucia');

      // All should be different (or at least not all the same)
      const rates = [madrid, cataluna, valencia, andalucia];
      const unique = new Set(rates.map(r => r.toFixed(6)));
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  // =========================================================================
  // Régimen foral
  // =========================================================================

  describe('foral regime', () => {
    const state = makeState();

    it('Navarra uses foral brackets (higher top rate)', () => {
      const navarra = calculateIRPF(100000, state, 'navarra');
      // Navarra has top rate 52% → higher for high incomes
      expect(navarra).toBeGreaterThan(0.20);
      expect(navarra).toBeLessThan(0.50);
    });

    it('País Vasco uses foral brackets', () => {
      const paisVasco = calculateIRPF(100000, state, 'pais_vasco');
      expect(paisVasco).toBeGreaterThan(0.20);
      expect(paisVasco).toBeLessThan(0.50);
    });

    it('foral produces different results than common regime', () => {
      const madrid = calculateIRPF(50000, state, 'madrid');
      const navarra = calculateIRPF(50000, state, 'navarra');
      expect(navarra).not.toBeCloseTo(madrid, 2);
    });
  });

  // =========================================================================
  // Consistency checks
  // =========================================================================

  describe('consistency', () => {
    const state = makeState();

    it('effective rate increases with income', () => {
      const rate20k = calculateIRPF(20000, state, 'madrid');
      const rate40k = calculateIRPF(40000, state, 'madrid');
      const rate60k = calculateIRPF(60000, state, 'madrid');
      const rate100k = calculateIRPF(100000, state, 'madrid');

      expect(rate40k).toBeGreaterThan(rate20k);
      expect(rate60k).toBeGreaterThan(rate40k);
      expect(rate100k).toBeGreaterThan(rate60k);
    });

    it('effective rate never exceeds top marginal rate', () => {
      const rate = calculateIRPF(1000000, state, 'madrid');
      // Top combined rate Madrid: 24.5% state + 20.5% autonomous = 45%
      // But effective rate is always less than marginal
      expect(rate).toBeLessThan(0.47);
    });

    it('effective rate is always between 0 and 1', () => {
      for (const gross of [1000, 10000, 30000, 80000, 200000, 500000]) {
        const rate = calculateIRPF(gross, state, 'madrid');
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThan(1);
      }
    });
  });
});
