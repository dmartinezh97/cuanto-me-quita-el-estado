/**
 * Fiscal/tax-related type definitions.
 */

// =============================================================================
// IRPF Types (Autonomous Communities)
// =============================================================================

/**
 * A single IRPF tax bracket.
 *
 * Tax is applied progressively: each bracket's rate applies only to
 * the portion of income within that bracket's range.
 */
export interface IRPFBracket {
  /** Upper limit of this bracket (use Infinity for the last bracket) */
  limit: number;
  /** Tax rate as decimal (e.g., 0.095 for 9.5%) */
  rate: number;
}

/**
 * An autonomous community with its IRPF brackets.
 *
 * Spain's IRPF is split ~50% state + ~50% autonomous community.
 * Each community can set its own brackets for its portion.
 */
export interface AutonomousCommunity {
  /** Unique identifier (e.g., 'madrid', 'cataluna') */
  id: string;
  /** Display name (e.g., 'Comunidad de Madrid') */
  name: string;
  /** Autonomous IRPF brackets for 2025 */
  brackets: IRPFBracket[];
}
