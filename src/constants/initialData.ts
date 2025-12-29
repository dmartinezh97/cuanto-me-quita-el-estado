/**
 * Initial data configuration for the fiscal calculator.
 *
 * Contains default expense categories with their IVA rates, special taxes,
 * and display configurations for the UI.
 *
 * Why this file exists:
 * - Centralizes all default values in one place
 * - Separates data from logic (calculations.ts)
 * - Makes it easy to modify initial values without touching business logic
 * - Contains display configuration to make templates data-driven
 *
 * Display Configuration:
 * Each SubItem now has a `display` property that controls:
 * - taxDisplayType: Type of tax calculation and default label
 * - taxLabel: Custom override for the tax label
 * - taxNote: Additional note shown below the label
 * - labelColor: 'red' for taxed items, 'green' for exempt
 * - inputType: 'currency' for single input, 'dual-input' for two inputs
 * - secondInputLabel: Label for second input (when inputType is 'dual-input')
 */

import type { CategoryExpense, AppState, SubItem } from '@/types';
import { IEH_PER_LITER } from '@/constants/taxes';

/**
 * Helper to create a standard IVA display config.
 */
const standardDisplay = (ivaRate: number): SubItem['display'] => ({
  taxDisplayType: 'standard',
  taxLabel: ivaRate > 0 ? `IVA ${ivaRate}%` : undefined,
  labelColor: ivaRate > 0 ? 'red' : 'green',
  inputType: 'currency',
});

/**
 * Helper to create an exempt display config.
 */
const exemptDisplay = (note?: string): SubItem['display'] => ({
  taxDisplayType: 'exempt',
  taxLabel: note ?? 'Exento',
  labelColor: 'green',
  inputType: 'currency',
});

/**
 * Helper to create an insurance (IPS) display config.
 */
const insuranceDisplay = (rate: number): SubItem['display'] => ({
  taxDisplayType: 'insurance',
  taxLabel: `IPS ${Math.round(rate * 100)}%`,
  labelColor: 'red',
  inputType: 'currency',
});

/**
 * Default expense categories with subcategories.
 *
 * Each category contains:
 * - Metadata: id, name, icon, color
 * - IVA distribution sliders (iva4, iva10, iva21) - used when no subItems
 * - subItems: Detailed breakdown with specific IVA rates, special taxes, and display config
 */
export const INITIAL_EXPENSES: CategoryExpense[] = [
  // ===========================================================================
  // Transporte y Combustibles
  // ===========================================================================
  {
    id: 'transport',
    name: 'Transporte y Combustibles',
    icon: 'directions_car',
    color: 'blue',
    total: 0,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'fuel',
        name: 'Gasolina/Gasóleo (vehículo propio)',
        amount: 150,
        ivaRate: 21,
        isExciseDuty: true,
        pricePerUnit: 1.60,
        display: {
          taxDisplayType: 'fuel',
          taxLabel: `IEH (€${IEH_PER_LITER}/L) + IVA 21%`,
          taxNote: 'se calcula al precio medio de la gasolina',
          labelColor: 'red',
          inputType: 'dual-input',
          secondInputLabel: 'Precio medio €/L',
        },
      },
      {
        id: 'public',
        name: 'Transporte público (metro, bus, cercanías)',
        amount: 0,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'taxi',
        name: 'Taxi / VTC',
        amount: 0,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'parking',
        name: 'Parking y peajes',
        amount: 75,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'maintenance',
        name: 'Mantenimiento vehículo (taller, ITV)',
        amount: 3.38,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'insurance_car',
        name: 'Seguro de coche',
        amount: 50,
        ivaRate: 0,
        specialTaxRate: 0.06,
        display: {
          taxDisplayType: 'insurance',
          taxLabel: 'IPS 6% + recargos',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
    ],
  },

  // ===========================================================================
  // Hogar y Suministros
  // ===========================================================================
  {
    id: 'home',
    name: 'Hogar y Suministros',
    icon: 'home',
    color: 'orange',
    total: 800,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'rent',
        name: 'Alquiler vivienda',
        amount: 600,
        ivaRate: 0,
        note: 'Exento (casero paga IRPF)',
        display: exemptDisplay('Exento (casero paga IRPF)'),
      },
      {
        id: 'mortgage',
        name: 'Hipoteca (intereses)',
        amount: 0,
        ivaRate: 0,
        note: 'Sin IVA directo',
        display: exemptDisplay('Sin IVA directo'),
      },
      {
        id: 'electricity',
        name: 'Electricidad',
        amount: 60,
        ivaRate: 21,
        isElectricityTax: true,
        specialTaxRate: 0.0511,
        display: {
          taxDisplayType: 'electricity',
          taxLabel: 'IVA 21% + IEE',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'gas',
        name: 'Gas natural',
        amount: 40,
        ivaRate: 21,
        isExciseDuty: true,
        note: '+ Imp. Hidrocarburos',
        display: {
          taxDisplayType: 'gas',
          taxLabel: 'IVA 21% + Imp. Hidrocarburos (0,00234 €/kWh)',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'water',
        name: 'Agua',
        amount: 20,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'internet',
        name: 'Internet y teléfono',
        amount: 40,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'community',
        name: 'Comunidad de vecinos',
        amount: 0,
        ivaRate: 0,
        note: 'Sin IVA',
        display: exemptDisplay('Sin IVA'),
      },
      {
        id: 'insurance_home',
        name: 'Seguro de hogar',
        amount: 20,
        ivaRate: 0,
        specialTaxRate: 0.06,
        note: 'IPS (~6%)',
        display: insuranceDisplay(0.06),
      },
      {
        id: 'cleaning',
        name: 'Productos de limpieza',
        amount: 20,
        ivaRate: 21,
        display: standardDisplay(21),
      },
    ],
  },

  // ===========================================================================
  // Alimentación y Supermercado
  // ===========================================================================
  {
    id: 'food',
    name: 'Alimentación y Supermercado',
    icon: 'shopping_cart',
    color: 'yellow',
    total: 350,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'food_4',
        name: 'Básicos (Pan, leche, fruta, aceite...)',
        amount: 150,
        ivaRate: 4,
        note: 'IVA Superreducido',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 4%',
          taxNote: 'Superreducido',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'food_10',
        name: 'Carne, Pescado y Procesados',
        amount: 120,
        ivaRate: 10,
        note: 'IVA Reducido',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 10%',
          taxNote: 'Reducido',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'food_21',
        name: 'Refrescos y Alcohol',
        amount: 40,
        ivaRate: 21,
        isExciseDuty: true,
        note: 'IVA 21% + Imp. Alcohol',
        display: {
          taxDisplayType: 'alcohol',
          taxLabel: 'IVA 21% + Imp. Alcohol',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'tobacco',
        name: 'Tabaco',
        amount: 40,
        ivaRate: 21,
        isExciseDuty: true,
        note: 'Imp. Labores del Tabaco + IVA 21%',
        display: {
          taxDisplayType: 'tobacco',
          taxLabel: 'Imp. Tabaco (~57%) + IVA 21%',
          taxNote: 'sobre base+imp.especial',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
    ],
  },

  // ===========================================================================
  // Ocio y Restauración
  // ===========================================================================
  {
    id: 'leisure',
    name: 'Ocio y Restauración',
    icon: 'restaurant',
    color: 'pink',
    total: 100,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'restaurantes',
        name: 'Restaurantes y bares',
        amount: 60,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'delivery',
        name: 'Comida a domicilio (Glovo, etc.)',
        amount: 0,
        ivaRate: 10,
        note: '+ IVA 21% en servicio',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 10%',
          taxNote: '+ IVA 21% en servicio',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'cine',
        name: 'Cine',
        amount: 0,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'espectaculos',
        name: 'Teatro, conciertos, eventos',
        amount: 0,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'gimnasio',
        name: 'Gimnasio / Deportes',
        amount: 40,
        ivaRate: 21,
        note: 'IVA 21% (General)',
        display: standardDisplay(21),
      },
      {
        id: 'streaming',
        name: 'Netflix, Spotify, etc.',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'videojuegos',
        name: 'Videojuegos',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'libros',
        name: 'Libros (físicos y e-books)',
        amount: 0,
        ivaRate: 4,
        note: 'IVA Superreducido',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 4%',
          taxNote: 'Superreducido',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'prensa',
        name: 'Prensa y suscripciones digitales',
        amount: 0,
        ivaRate: 4,
        display: standardDisplay(4),
      },
      {
        id: 'viajes',
        name: 'Viajes y hoteles',
        amount: 0,
        ivaRate: 10,
        display: standardDisplay(10),
      },
      {
        id: 'loteria',
        name: 'Lotería y apuestas',
        amount: 0,
        ivaRate: 0,
        note: 'Exento (Imp. especial premios)',
        display: exemptDisplay('Exento (Imp. especial premios)'),
      },
    ],
  },

  // ===========================================================================
  // Compras y Bienes
  // ===========================================================================
  {
    id: 'shopping',
    name: 'Compras y Bienes',
    icon: 'shopping_bag',
    color: 'purple',
    total: 0,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'clothing',
        name: 'Ropa y calzado',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'electronics',
        name: 'Electrónica (móvil, PC, TV)',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'appliances',
        name: 'Electrodomésticos',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'furniture',
        name: 'Muebles y decoración',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'hygiene',
        name: 'Higiene personal',
        amount: 0,
        ivaRate: 21,
        note: 'IVA 21% (compresas al 10%)',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 21%',
          taxNote: 'compresas al 10%',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'optical',
        name: 'Gafas graduadas y lentillas',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'pharmacy_rx',
        name: 'Farmacia (medicamentos con receta)',
        amount: 0,
        ivaRate: 4,
        note: 'IVA Superreducido',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 4%',
          taxNote: 'Superreducido',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'pharmacy_otc',
        name: 'Farmacia (sin receta) / Parafarmacia',
        amount: 0,
        ivaRate: 21,
        note: 'IVA 21% o 10%',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 21%',
          taxNote: 'o 10%',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'pets',
        name: 'Productos para mascotas',
        amount: 0,
        ivaRate: 21,
        note: 'Comida al 10%',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 21%',
          taxNote: 'Comida al 10%',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
      {
        id: 'plants',
        name: 'Flores and plantas',
        amount: 0,
        ivaRate: 10,
        note: 'Flores 10% / Plantas 21%',
        display: {
          taxDisplayType: 'standard',
          taxLabel: 'IVA 10%',
          taxNote: 'Plantas 21%',
          labelColor: 'red',
          inputType: 'currency',
        },
      },
    ],
  },

  // ===========================================================================
  // Salud y Educación
  // ===========================================================================
  {
    id: 'health',
    name: 'Salud y Educación',
    icon: 'health_and_safety',
    color: 'emerald',
    total: 50,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      {
        id: 'health_ins',
        name: 'Seguro médico privado',
        amount: 50,
        ivaRate: 0,
        specialTaxRate: 0.06,
        note: 'IPS (~6%)',
        display: insuranceDisplay(0.06),
      },
      {
        id: 'dentist',
        name: 'Dentista',
        amount: 0,
        ivaRate: 0,
        note: 'Exento de IVA',
        display: exemptDisplay('Exento de IVA'),
      },
      {
        id: 'doctor',
        name: 'Consultas médicas privadas',
        amount: 0,
        ivaRate: 0,
        note: 'Exento de IVA',
        display: exemptDisplay('Exento de IVA'),
      },
      {
        id: 'education',
        name: 'Educación reglada (colegio, univ.)',
        amount: 0,
        ivaRate: 0,
        note: 'Exento de IVA',
        display: exemptDisplay('Exento de IVA'),
      },
      {
        id: 'academy',
        name: 'Academia / Clases particulares',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'school_supplies',
        name: 'Material escolar',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'nursery',
        name: 'Guardería',
        amount: 0,
        ivaRate: 0,
        note: 'Exento de IVA',
        display: exemptDisplay('Exento de IVA'),
      },
    ],
  },

  // ===========================================================================
  // Servicios y Otros
  // ===========================================================================
  {
    id: 'services',
    name: 'Servicios y Otros',
    icon: 'more_horiz',
    color: 'gray',
    total: 0,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: true,
    subItems: [
      {
        id: 'hairdresser',
        name: 'Peluquería y estética',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'pro_services',
        name: 'Servicios profesionales (abogado, etc.)',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'domestic_help',
        name: 'Servicios domésticos',
        amount: 0,
        ivaRate: 0,
        note: 'Sin IVA (empleo hogar)',
        display: exemptDisplay('Sin IVA (empleo hogar)'),
      },
      {
        id: 'banking',
        name: 'Servicios bancarios',
        amount: 0,
        ivaRate: 0,
        note: 'Exento de IVA',
        display: exemptDisplay('Exento de IVA'),
      },
      {
        id: 'parcel',
        name: 'Envíos y paquetería',
        amount: 0,
        ivaRate: 21,
        display: standardDisplay(21),
      },
      {
        id: 'donations',
        name: 'Donaciones a ONG',
        amount: 0,
        ivaRate: 0,
        note: 'Sin IVA (deducible IRPF)',
        display: {
          taxDisplayType: 'exempt',
          taxLabel: 'Sin IVA',
          taxNote: 'deducible IRPF',
          labelColor: 'green',
          inputType: 'currency',
        },
      },
    ],
  },
];

/**
 * Default application state.
 *
 * Represents a typical Spanish worker profile:
 * - Average salary: 28,000 EUR/year
 * - 12 payments (no extra pagas)
 * - Single, no children
 * - Living in Madrid
 */
export const INITIAL_STATE: AppState = {
  grossSalary: 28000,
  numPayments: 12,
  age: '',
  region: 'madrid', // Changed to ID format for lookup
  maritalStatus: 'single',
  numChildren: 0,
  numChildrenUnder3: 0,
  disability: 'none',
  expenses: INITIAL_EXPENSES,
  viewMode: 'Mensual',
  consumptionDetailMode: 'Sencillo',
};
