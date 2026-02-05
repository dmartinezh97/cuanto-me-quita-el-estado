/**
 * Types for salary data structure
 */

export interface SalaryData {
  meta: {
    source: string;
    year: number;
    lastUpdated: string;
    notes: string;
  };
  national: NationalSalary;
  byCCAA: Record<string, CCAASalary>;
  byProfession: Record<string, ProfessionSalary>;
  costOfLiving: Record<string, CostOfLiving>;
}

export interface NationalSalary {
  avgMonthly: number;
  avgAnnual: number;
  medianMonthly: number;
  medianAnnual: number;
}

export interface CCAASalary {
  name: string;
  avgMonthly: number;
  avgAnnual: number;
  rank: number;
  vsNational: number; // Percentage difference vs national average
  population: number;
}

export interface ProfessionSalary {
  name: string;
  avgMonthly: number;
  avgAnnual: number;
  minMonthly: number;
  maxMonthly: number;
  topCCAA: string[]; // Array of CCAA IDs
  demand: 'very-high' | 'high' | 'medium' | 'low' | 'variable';
  growth: 'very-high' | 'high' | 'medium' | 'low';
  notes?: string;
}

export interface CostOfLiving {
  city: string;
  ccaa: string;
  vsAverage: number; // Percentage difference vs national average
  rentMonthly1BR: number; // Average rent for 1 bedroom apartment
  notes?: string;
}
