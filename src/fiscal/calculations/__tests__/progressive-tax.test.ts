import { describe, it, expect } from 'vitest';
import { calculateProgressiveTax } from '@fiscal/constants/ccaa';
import { STATE_IRPF_BRACKETS } from '@fiscal/constants/ccaa/common';

describe('calculateProgressiveTax', () => {
  it('returns 0 for income of 0€', () => {
    expect(calculateProgressiveTax(0, STATE_IRPF_BRACKETS)).toBe(0);
  });

  it('returns 0 for negative income', () => {
    expect(calculateProgressiveTax(-5000, STATE_IRPF_BRACKETS)).toBe(0);
  });

  it('calculates tax within first bracket only', () => {
    // 10,000€ × 9.5% = 950€
    expect(calculateProgressiveTax(10000, STATE_IRPF_BRACKETS)).toBeCloseTo(950, 2);
  });

  it('calculates tax at exact first bracket limit', () => {
    // 12,450€ × 9.5% = 1,182.75€
    expect(calculateProgressiveTax(12450, STATE_IRPF_BRACKETS)).toBeCloseTo(1182.75, 2);
  });

  it('calculates tax crossing into second bracket', () => {
    // 15,000€:
    // 12,450 × 9.5% = 1,182.75
    // 2,550 × 12% = 306
    // Total = 1,488.75
    expect(calculateProgressiveTax(15000, STATE_IRPF_BRACKETS)).toBeCloseTo(1488.75, 2);
  });

  it('calculates tax crossing multiple brackets', () => {
    // 40,000€:
    // 12,450 × 9.5% = 1,182.75
    // (20,200 - 12,450) × 12% = 930
    // (35,200 - 20,200) × 15% = 2,250
    // (40,000 - 35,200) × 18.5% = 888
    // Total = 5,250.75
    expect(calculateProgressiveTax(40000, STATE_IRPF_BRACKETS)).toBeCloseTo(5250.75, 2);
  });

  it('calculates tax for high income (>300,000€)', () => {
    // 400,000€:
    // 12,450 × 9.5% = 1,182.75
    // (20,200 - 12,450) × 12% = 930
    // (35,200 - 20,200) × 15% = 2,250
    // (60,000 - 35,200) × 18.5% = 4,588
    // (300,000 - 60,000) × 22.5% = 54,000
    // (400,000 - 300,000) × 24.5% = 24,500
    // Total = 87,450.75
    expect(calculateProgressiveTax(400000, STATE_IRPF_BRACKETS)).toBeCloseTo(87450.75, 2);
  });

  it('handles empty brackets', () => {
    expect(calculateProgressiveTax(10000, [])).toBe(0);
  });

  it('handles single bracket', () => {
    const singleBracket = [{ limit: Infinity, rate: 0.10 }];
    expect(calculateProgressiveTax(50000, singleBracket)).toBeCloseTo(5000, 2);
  });
});
