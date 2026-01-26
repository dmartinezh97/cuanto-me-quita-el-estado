/**
 * Type definitions for the results panel components.
 *
 * These interfaces define the props for all components in the
 * visual results panel, ensuring type safety and documentation.
 */

/** Props for HeroCard component */
export interface HeroCardProps {
  /** Label text (e.g., "COSTE TOTAL EMPRESA") */
  label: string;
  /** Monetary value to display */
  value: number;
  /** Description text below the value */
  description: string;
  /** Visual variant - primary (teal) or dark (black) */
  variant: 'primary' | 'dark';
}

/** Props for PresionFiscalCard component */
export interface PresionFiscalCardProps {
  /** Percentage going to state (0-100) */
  statePercent: number;
  /** Percentage kept by user (0-100) */
  userPercent: number;
  /** Total taxes amount */
  totalTaxes: number;
}

/** Props for TramoBar component (IRPF bracket) */
export interface TramoBarProps {
  /** Range label (e.g., "0 - 12.450 €") */
  rangeLabel: string;
  /** Tax rate percentage */
  rate: number;
  /** Tax amount for this bracket */
  amount: number;
  /** Percentage of bracket filled (0-100) */
  fillPercent: number;
  /** Whether this bracket applies to current income */
  isActive: boolean;
}

/** Props for SSBreakdownCard component */
export interface SSBreakdownCardProps {
  /** Card title (e.g., "S.S. Empresa") */
  title: string;
  /** Total SS contribution */
  total: number;
  /** Visual variant - employer (teal) or employee (purple) */
  variant: 'employer' | 'employee';
  /** Breakdown items */
  items: SSBreakdownItem[];
}

/** Individual SS breakdown item */
export interface SSBreakdownItem {
  /** Label (e.g., "Contingencias Comunes") */
  label: string;
  /** Rate as string (e.g., "23,60%") */
  rate: string;
  /** Monetary value */
  value: number;
}

/** Props for IVACategoryCard component */
export interface IVACategoryCardProps {
  /** Lucide icon name (e.g., "car", "home") */
  icon: string;
  /** Category name (e.g., "Transporte") */
  name: string;
  /** Tax amount */
  amount: number;
  /** IVA rate (4, 10, or 21) */
  rate: number;
}

/** Props for DonutChart component */
export interface DonutChartProps {
  /** Percentage to fill (0-100) */
  percentage: number;
  /** Size in pixels */
  size?: number;
  /** Primary color for filled portion */
  fillColor?: string;
  /** Background color for unfilled portion */
  bgColor?: string;
}

/** Props for SectionHeader component */
export interface SectionHeaderProps {
  /** Lucide icon name */
  icon: string;
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Total value to display on right */
  totalValue?: number;
  /** Secondary value (e.g., effective rate) */
  secondaryValue?: string;
  /** Icon color variant */
  iconVariant?: 'accent' | 'warning' | 'primary';
}

/** Props for Badge component */
export interface BadgeProps {
  /** Text to display */
  text: string;
  /** Color variant */
  variant: 'warning' | 'success' | 'primary' | 'accent';
}

/** Props for ResumenFinal component */
export interface ResumenFinalProps {
  /** Total taxes going to state */
  stateShareAnnual: number;
  /** Monthly net with 12 payments */
  netMonthly12: number;
  /** Monthly net with 14 payments */
  netMonthly14: number;
}

/** IRPF bracket for display */
export interface IRPFTramoDisplay {
  /** Lower bound of bracket */
  from: number;
  /** Upper bound of bracket (or Infinity) */
  to: number;
  /** Tax rate as decimal (e.g., 0.19) */
  rate: number;
  /** Tax amount paid in this bracket */
  amount: number;
  /** Whether income reaches this bracket */
  isActive: boolean;
  /** Percentage of bracket used (0-100) */
  fillPercent: number;
}

/** Category with calculated IVA for display */
export interface IVACategoryDisplay {
  /** Category ID */
  id: string;
  /** Category name */
  name: string;
  /** Lucide icon name */
  icon: string;
  /** Total IVA amount */
  ivaAmount: number;
  /** Dominant IVA rate */
  dominantRate: number;
}
