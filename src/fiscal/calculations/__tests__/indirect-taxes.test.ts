import { describe, it, expect } from 'vitest';
import { calculateIVABreakdown } from '../indirect-taxes';
import type { AppState } from '@/types';
import type { SubItem, CategoryExpense } from '@/types';

/**
 * Helper to create a minimal AppState with expenses for testing.
 */
function makeState(expenses: CategoryExpense[]): AppState {
  return {
    grossSalary: 30000,
    numPayments: 12,
    age: 30,
    region: 'madrid',
    maritalStatus: 'single',
    numChildren: 0,
    numChildrenUnder3: 0,
    disability: 'none',
    expenses,
    viewMode: 'Anual',
    consumptionDetailMode: 'Detallado',
    learnMode: false,
  };
}

function makeCategory(overrides: Partial<CategoryExpense> = {}): CategoryExpense {
  return {
    id: 'test',
    name: 'Test',
    icon: '🔧',
    color: 'gray',
    total: 0,
    iva4: 0,
    iva10: 0,
    iva21: 100,
    open: false,
    ...overrides,
  };
}

function makeSubItem(overrides: Partial<SubItem> = {}): SubItem {
  return {
    id: 'test-item',
    name: 'Test Item',
    amount: 100,
    ivaRate: 21,
    display: {
      taxDisplayType: 'standard',
      labelColor: 'red',
      inputType: 'currency',
    },
    ...overrides,
  };
}

describe('calculateIVABreakdown', () => {
  // =========================================================================
  // Standard IVA
  // =========================================================================

  describe('standard IVA', () => {
    it('calculates 21% IVA correctly', () => {
      const expenses = [makeCategory({
        subItems: [makeSubItem({ amount: 121, ivaRate: 21 })],
      })];
      const result = calculateIVABreakdown(makeState(expenses));
      // 121 / 1.21 = 100 base, IVA = 21
      expect(result.iva21).toBeCloseTo(21, 1);
      expect(result.iva4).toBe(0);
      expect(result.iva10).toBe(0);
    });

    it('calculates 10% IVA correctly', () => {
      const expenses = [makeCategory({
        subItems: [makeSubItem({ amount: 110, ivaRate: 10, display: { taxDisplayType: 'standard', labelColor: 'red', inputType: 'currency' } })],
      })];
      const result = calculateIVABreakdown(makeState(expenses));
      expect(result.iva10).toBeCloseTo(10, 1);
    });

    it('calculates 4% IVA correctly', () => {
      const expenses = [makeCategory({
        subItems: [makeSubItem({ amount: 104, ivaRate: 4, display: { taxDisplayType: 'standard', labelColor: 'red', inputType: 'currency' } })],
      })];
      const result = calculateIVABreakdown(makeState(expenses));
      expect(result.iva4).toBeCloseTo(4, 1);
    });

    it('skips items with 0 amount', () => {
      const expenses = [makeCategory({
        subItems: [makeSubItem({ amount: 0 })],
      })];
      const result = calculateIVABreakdown(makeState(expenses));
      expect(result.totalIndirect).toBe(0);
    });
  });

  // =========================================================================
  // Fuel (IEH)
  // =========================================================================

  describe('fuel (IEH)', () => {
    it('calculates fuel tax with IEH per liter', () => {
      const fuelItem = makeSubItem({
        amount: 160,
        ivaRate: 21,
        pricePerUnit: 1.60,
        display: { taxDisplayType: 'fuel', labelColor: 'red', inputType: 'dual-input' },
      });
      const expenses = [makeCategory({ subItems: [fuelItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      // 100 liters × 0.4007€/L = 40.07€ IEH
      expect(result.ieh).toBeCloseTo(40.07, 1);
      // IVA 21%: 160 / 1.21 = 132.23 base, IVA = 27.77
      expect(result.iva21).toBeCloseTo(27.77, 0);
      expect(result.totalIndirect).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Electricity (IEE)
  // =========================================================================

  describe('electricity (IEE)', () => {
    it('calculates electricity tax', () => {
      const elecItem = makeSubItem({
        amount: 100,
        ivaRate: 21,
        specialTaxRate: 0.0511,
        display: { taxDisplayType: 'electricity', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [elecItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      // base = 100 / ((1 + 0.0511) × 1.21) = 100 / 1.271831 ≈ 78.63
      // IEE = 78.63 × 0.0511 ≈ 4.02
      expect(result.iee).toBeCloseTo(4.02, 0);
      expect(result.totalIndirect).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Insurance (IPS)
  // =========================================================================

  describe('insurance (IPS)', () => {
    it('calculates insurance premium tax (no IVA)', () => {
      const insuranceItem = makeSubItem({
        amount: 106,
        ivaRate: 0,
        specialTaxRate: 0.06,
        display: { taxDisplayType: 'insurance', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [insuranceItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      // base = 106 / 1.06 = 100, IPS = 6
      expect(result.ips).toBeCloseTo(6, 1);
      expect(result.iva21).toBe(0);
      expect(result.iva10).toBe(0);
      expect(result.iva4).toBe(0);
    });
  });

  // =========================================================================
  // Exempt
  // =========================================================================

  describe('exempt items', () => {
    it('returns 0 taxes for exempt items', () => {
      const exemptItem = makeSubItem({
        amount: 500,
        ivaRate: 0,
        display: { taxDisplayType: 'exempt', labelColor: 'green', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [exemptItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      expect(result.totalIndirect).toBe(0);
    });
  });

  // =========================================================================
  // Tobacco
  // =========================================================================

  describe('tobacco', () => {
    it('calculates tobacco tax as ~57% of PVP sin IVA', () => {
      const tobaccoItem = makeSubItem({
        amount: 121,
        ivaRate: 21,
        display: { taxDisplayType: 'tobacco', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [tobaccoItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      // PVP sin IVA = 121 / 1.21 = 100
      // Tobacco tax = 100 × 0.57 = 57
      expect(result.specialOthers).toBeCloseTo(57, 1);
    });
  });

  // =========================================================================
  // Alcohol
  // =========================================================================

  describe('alcohol', () => {
    it('calculates alcohol tax as ~5% of PVP', () => {
      const alcoholItem = makeSubItem({
        amount: 100,
        ivaRate: 21,
        display: { taxDisplayType: 'alcohol', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [alcoholItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      // Alcohol tax = 100 × 0.05 = 5
      expect(result.specialOthers).toBeCloseTo(5, 1);
    });
  });

  // =========================================================================
  // Direct Tax (municipal taxes)
  // =========================================================================

  describe('direct-tax (municipal taxes)', () => {
    it('treats 100% of amount as tax', () => {
      const directTaxItem = makeSubItem({
        amount: 50,
        ivaRate: 0,
        display: { taxDisplayType: 'direct-tax', taxLabel: 'IBI', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [directTaxItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      expect(result.directTaxes).toBeCloseTo(50, 1);
      expect(result.iva21).toBe(0);
      expect(result.iva10).toBe(0);
      expect(result.iva4).toBe(0);
    });

    it('includes direct taxes in totalIndirect', () => {
      const directTaxItem = makeSubItem({
        amount: 30,
        ivaRate: 0,
        display: { taxDisplayType: 'direct-tax', taxLabel: 'Tasa basuras', labelColor: 'red', inputType: 'currency' },
      });
      const expenses = [makeCategory({ subItems: [directTaxItem] })];
      const result = calculateIVABreakdown(makeState(expenses));

      expect(result.totalIndirect).toBeCloseTo(30, 1);
    });

    it('aggregates multiple direct taxes', () => {
      const expenses = [makeCategory({
        subItems: [
          makeSubItem({
            id: 'ibi',
            amount: 60,
            ivaRate: 0,
            display: { taxDisplayType: 'direct-tax', taxLabel: 'IBI', labelColor: 'red', inputType: 'currency' },
          }),
          makeSubItem({
            id: 'ivtm',
            amount: 15,
            ivaRate: 0,
            display: { taxDisplayType: 'direct-tax', taxLabel: 'IVTM', labelColor: 'red', inputType: 'currency' },
          }),
        ],
      })];
      const result = calculateIVABreakdown(makeState(expenses));

      expect(result.directTaxes).toBeCloseTo(75, 1);
      expect(result.totalIndirect).toBeCloseTo(75, 1);
    });
  });

  // =========================================================================
  // Simple mode (no subItems)
  // =========================================================================

  describe('simple mode (no subItems)', () => {
    it('distributes IVA based on percentages', () => {
      const expenses = [makeCategory({
        total: 1000,
        iva4: 20,   // 20% at 4%
        iva10: 30,  // 30% at 10%
        iva21: 50,  // 50% at 21%
      })];
      const result = calculateIVABreakdown(makeState(expenses));

      // IVA 4%: 1000 × 0.20 × (4/104) ≈ 7.69
      expect(result.iva4).toBeCloseTo(7.69, 1);
      // IVA 10%: 1000 × 0.30 × (10/110) ≈ 27.27
      expect(result.iva10).toBeCloseTo(27.27, 1);
      // IVA 21%: 1000 × 0.50 × (21/121) ≈ 86.78
      expect(result.iva21).toBeCloseTo(86.78, 1);
    });
  });

  // =========================================================================
  // Multiple items aggregation
  // =========================================================================

  describe('aggregation', () => {
    it('sums taxes from multiple categories', () => {
      const expenses = [
        makeCategory({
          id: 'cat1',
          subItems: [makeSubItem({ amount: 121, ivaRate: 21 })],
        }),
        makeCategory({
          id: 'cat2',
          subItems: [makeSubItem({ id: 'item2', amount: 121, ivaRate: 21 })],
        }),
      ];
      const result = calculateIVABreakdown(makeState(expenses));
      // 2 × 21 = 42€ total IVA 21%
      expect(result.iva21).toBeCloseTo(42, 1);
    });

    it('totalIndirect equals sum of all tax components', () => {
      const expenses = [makeCategory({
        subItems: [
          makeSubItem({ amount: 121, ivaRate: 21 }),
          makeSubItem({
            id: 'insurance',
            amount: 106,
            ivaRate: 0,
            specialTaxRate: 0.06,
            display: { taxDisplayType: 'insurance', labelColor: 'red', inputType: 'currency' },
          }),
        ],
      })];
      const result = calculateIVABreakdown(makeState(expenses));

      const expectedTotal =
        result.iva4 + result.iva10 + result.iva21 +
        result.ieh + result.ips + result.iee + result.specialOthers + result.directTaxes;
      expect(result.totalIndirect).toBeCloseTo(expectedTotal, 2);
    });
  });
});
