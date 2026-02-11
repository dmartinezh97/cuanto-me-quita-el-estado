/**
 * Calculation result types.
 */

// =============================================================================
// Social Security Breakdown
// =============================================================================

/**
 * Social Security breakdown for display in the ticket.
 */
export interface SSBreakdown {
  contingenciasComunes: number;
  desempleo: number;
  formacion: number;
  mei: number;
  fogasa?: number;  // Only for employer
  atEp?: number;    // Only for employer
}

// =============================================================================
// IVA Breakdown
// =============================================================================

/**
 * Detailed item in IVA breakdown.
 */
export interface IVADetailedItem {
  name: string;
  iva: number;
  special: number;
  type: string;
}

/**
 * IVA breakdown from calculateIVABreakdown.
 */
export interface IVABreakdown {
  iva4: number;
  iva10: number;
  iva21: number;
  ieh: number;
  ips: number;
  iee: number;
  specialOthers: number;
  directTaxes: number;
  totalIndirect: number;
  detailedItems: IVADetailedItem[];
}
