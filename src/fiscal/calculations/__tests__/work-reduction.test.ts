import { describe, it, expect } from 'vitest';
import { calculateWorkIncomeReduction } from '../irpf';
import { WORK_INCOME_REDUCTION } from '@fiscal/constants/irpf';

describe('calculateWorkIncomeReduction', () => {
  const { FULL_REDUCTION, THRESHOLD_1, THRESHOLD_2, MAX_NET_INCOME } = WORK_INCOME_REDUCTION;

  it('returns full reduction (7,302€) for income ≤ 14,852€', () => {
    expect(calculateWorkIncomeReduction(10000)).toBe(FULL_REDUCTION);
    expect(calculateWorkIncomeReduction(14852)).toBe(FULL_REDUCTION);
    expect(calculateWorkIncomeReduction(0)).toBe(FULL_REDUCTION);
  });

  it('returns gradual reduction between 14,852€ and 17,673.52€', () => {
    const income = 16000;
    // 7302 - 1.75 × (16000 - 14852) = 7302 - 2009 = 5293
    const expected = FULL_REDUCTION - 1.75 * (income - THRESHOLD_1);
    expect(calculateWorkIncomeReduction(income)).toBeCloseTo(expected, 2);
  });

  it('returns correct value at exactly threshold 2 (17,673.52€)', () => {
    // At THRESHOLD_2, the first formula gives REDUCTION_AT_T2
    const expected = FULL_REDUCTION - 1.75 * (THRESHOLD_2 - THRESHOLD_1);
    expect(calculateWorkIncomeReduction(THRESHOLD_2)).toBeCloseTo(expected, 2);
  });

  it('returns gradual reduction between 17,673.52€ and 19,747.50€', () => {
    const income = 18500;
    // 2364.34 - 1.14 × (18500 - 17673.52) = 2364.34 - 942.19 = 1422.15
    const expected = 2364.34 - 1.14 * (income - THRESHOLD_2);
    expect(calculateWorkIncomeReduction(income)).toBeCloseTo(expected, 2);
  });

  it('returns 0 for income > 19,747.50€', () => {
    expect(calculateWorkIncomeReduction(20000)).toBe(0);
    expect(calculateWorkIncomeReduction(30000)).toBe(0);
    expect(calculateWorkIncomeReduction(100000)).toBe(0);
  });

  it('returns 0 when hasOtherIncome is true', () => {
    expect(calculateWorkIncomeReduction(10000, true)).toBe(0);
    expect(calculateWorkIncomeReduction(15000, true)).toBe(0);
  });

  it('returns 0 at exactly MAX_NET_INCOME boundary', () => {
    // At MAX_NET_INCOME: 2364.34 - 1.14 × (19747.5 - 17673.52) = 2364.34 - 2364.34 = ~0
    const result = calculateWorkIncomeReduction(MAX_NET_INCOME);
    expect(result).toBeCloseTo(0, 1);
  });
});
