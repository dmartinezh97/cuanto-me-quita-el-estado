import { describe, it, expect } from 'vitest';
import {
  calculateSSContribution,
  SOCIAL_SECURITY_EMPLOYEE_RATE,
  SOCIAL_SECURITY_EMPLOYER_RATE,
  RATES_SS_EMPLOYEE,
  RATES_SS_EMPLOYER,
  SS_BASE_MAX_ANNUAL,
} from '../social-security';

describe('Social Security rates', () => {
  it('employee rate components sum to total (6.48%)', () => {
    const sum =
      RATES_SS_EMPLOYEE.CONTINGENCIAS_COMUNES +
      RATES_SS_EMPLOYEE.DESEMPLEO +
      RATES_SS_EMPLOYEE.FORMACION +
      RATES_SS_EMPLOYEE.MEI;
    expect(sum).toBeCloseTo(SOCIAL_SECURITY_EMPLOYEE_RATE, 4);
  });

  it('employer rate components sum to total (32.07%)', () => {
    const sum =
      RATES_SS_EMPLOYER.CONTINGENCIAS_COMUNES +
      RATES_SS_EMPLOYER.DESEMPLEO +
      RATES_SS_EMPLOYER.FOGASA +
      RATES_SS_EMPLOYER.FORMACION +
      RATES_SS_EMPLOYER.MEI +
      RATES_SS_EMPLOYER.AT_EP;
    expect(sum).toBeCloseTo(SOCIAL_SECURITY_EMPLOYER_RATE, 4);
  });

  it('MEI 2025 rates are correct (BOE Orden PJC/178/2025)', () => {
    expect(RATES_SS_EMPLOYEE.MEI).toBe(0.0013);
    expect(RATES_SS_EMPLOYER.MEI).toBe(0.0067);
  });

  it('total MEI rate is 0.80%', () => {
    const totalMEI = RATES_SS_EMPLOYEE.MEI + RATES_SS_EMPLOYER.MEI;
    expect(totalMEI).toBeCloseTo(0.008, 4);
  });

  it('base máxima annual is 58,914€ (4,909.50 × 12)', () => {
    expect(SS_BASE_MAX_ANNUAL).toBe(58914);
  });
});

describe('calculateSSContribution', () => {
  it('calculates employee contribution for salary below cap', () => {
    // 30,000€ × 6.48% = 1,944€
    const contribution = calculateSSContribution(30000, SOCIAL_SECURITY_EMPLOYEE_RATE);
    expect(contribution).toBeCloseTo(30000 * SOCIAL_SECURITY_EMPLOYEE_RATE, 2);
  });

  it('caps contribution for salary above maximum base', () => {
    // 80,000€ gross, but capped at 58,914€
    // 58,914 × 6.48% = 3,817.63€
    const contribution = calculateSSContribution(80000, SOCIAL_SECURITY_EMPLOYEE_RATE);
    expect(contribution).toBeCloseTo(SS_BASE_MAX_ANNUAL * SOCIAL_SECURITY_EMPLOYEE_RATE, 2);
  });

  it('caps contribution at exactly the maximum base', () => {
    const atCap = calculateSSContribution(SS_BASE_MAX_ANNUAL, SOCIAL_SECURITY_EMPLOYEE_RATE);
    const aboveCap = calculateSSContribution(SS_BASE_MAX_ANNUAL + 10000, SOCIAL_SECURITY_EMPLOYEE_RATE);
    expect(atCap).toBeCloseTo(aboveCap, 2);
  });

  it('returns 0 for 0 salary', () => {
    expect(calculateSSContribution(0, SOCIAL_SECURITY_EMPLOYEE_RATE)).toBe(0);
  });

  it('employer contribution is capped too', () => {
    // 100,000€ gross, capped at 58,914€
    const contribution = calculateSSContribution(100000, SOCIAL_SECURITY_EMPLOYER_RATE);
    expect(contribution).toBeCloseTo(SS_BASE_MAX_ANNUAL * SOCIAL_SECURITY_EMPLOYER_RATE, 2);
    // Must be less than uncapped
    expect(contribution).toBeLessThan(100000 * SOCIAL_SECURITY_EMPLOYER_RATE);
  });

  it('salary below cap uses full salary', () => {
    const salary = 25000;
    const contribution = calculateSSContribution(salary, SOCIAL_SECURITY_EMPLOYEE_RATE);
    expect(contribution).toBe(salary * SOCIAL_SECURITY_EMPLOYEE_RATE);
  });

  describe('real-world examples', () => {
    it('30,000€ gross: employee SS ≈ 1,944€', () => {
      const contribution = calculateSSContribution(30000, SOCIAL_SECURITY_EMPLOYEE_RATE);
      expect(contribution).toBeCloseTo(1944, 0);
    });

    it('30,000€ gross: employer SS ≈ 9,621€', () => {
      const contribution = calculateSSContribution(30000, SOCIAL_SECURITY_EMPLOYER_RATE);
      expect(contribution).toBeCloseTo(9621, 0);
    });

    it('80,000€ gross (capped): employee SS ≈ 3,818€', () => {
      const contribution = calculateSSContribution(80000, SOCIAL_SECURITY_EMPLOYEE_RATE);
      const expected = SS_BASE_MAX_ANNUAL * SOCIAL_SECURITY_EMPLOYEE_RATE;
      expect(contribution).toBeCloseTo(expected, 0);
      // Verify it's less than uncapped
      expect(contribution).toBeLessThan(80000 * SOCIAL_SECURITY_EMPLOYEE_RATE);
    });
  });
});
