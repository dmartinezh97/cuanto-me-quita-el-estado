
import { CategoryExpense, AppState } from './types';

export const INITIAL_EXPENSES: CategoryExpense[] = [
  {
    id: 'transport',
    name: 'Transporte y Combustibles',
    icon: 'directions_car',
    color: 'blue',
    total: 160,
    iva4: 0,
    iva10: 0,
    iva21: 0,
    open: false,
    subItems: [
      { id: 'fuel', name: 'Gasolina/Gasóleo (vehículo propio)', amount: 100, ivaRate: 21, isExciseDuty: true, pricePerUnit: 1.60 },
      { id: 'public', name: 'Transporte público (metro, bus, cercanías)', amount: 30, ivaRate: 10 },
      { id: 'taxi', name: 'Taxi / VTC', amount: 0, ivaRate: 10 },
      { id: 'parking', name: 'Parking y peajes', amount: 10, ivaRate: 21 },
      { id: 'maintenance', name: 'Mantenimiento vehículo (taller, ITV)', amount: 0, ivaRate: 21 },
      { id: 'insurance_car', name: 'Seguro de coche', amount: 20, ivaRate: 0, specialTaxRate: 0.06 }
    ]
  },
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
      { id: 'rent', name: 'Alquiler vivienda', amount: 600, ivaRate: 0, note: 'Exento (casero paga IRPF)' },
      { id: 'mortgage', name: 'Hipoteca (intereses)', amount: 0, ivaRate: 0, note: 'Sin IVA directo' },
      { id: 'electricity', name: 'Electricidad', amount: 60, ivaRate: 21, isElectricityTax: true, specialTaxRate: 0.0511 },
      { id: 'gas', name: 'Gas natural', amount: 40, ivaRate: 21, isExciseDuty: true, note: '+ Imp. Hidrocarburos' },
      { id: 'water', name: 'Agua', amount: 20, ivaRate: 10 },
      { id: 'internet', name: 'Internet y teléfono', amount: 40, ivaRate: 21 },
      { id: 'community', name: 'Comunidad de vecinos', amount: 0, ivaRate: 0, note: 'Sin IVA' },
      { id: 'insurance_home', name: 'Seguro de hogar', amount: 20, ivaRate: 0, specialTaxRate: 0.06, note: 'IPS (~6%)' },
      { id: 'cleaning', name: 'Productos de limpieza', amount: 20, ivaRate: 21 }
    ]
  },
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
        note: 'IVA Superreducido' 
      },
      { 
        id: 'food_10', 
        name: 'Carne, Pescado y Procesados', 
        amount: 120, 
        ivaRate: 10, 
        note: 'IVA Reducido' 
      },
      { 
        id: 'food_21', 
        name: 'Refrescos y Alcohol', 
        amount: 40, 
        ivaRate: 21, 
        isExciseDuty: true,
        note: 'IVA 21% + Imp. Alcohol' 
      },
      { 
        id: 'tobacco', 
        name: 'Tabaco', 
        amount: 40, 
        ivaRate: 21, 
        isExciseDuty: true, 
        note: 'Imp. Labores del Tabaco' 
      }
    ]
  },
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
      { id: 'restaurantes', name: 'Restaurantes y bares', amount: 60, ivaRate: 10 },
      { id: 'delivery', name: 'Comida a domicilio (Glovo, etc.)', amount: 0, ivaRate: 10, note: '+ IVA 21% en servicio' },
      { id: 'cine', name: 'Cine', amount: 0, ivaRate: 10 },
      { id: 'espectaculos', name: 'Teatro, conciertos, eventos', amount: 0, ivaRate: 10 },
      { id: 'gimnasio', name: 'Gimnasio / Deportes', amount: 40, ivaRate: 21, note: 'IVA 21% (General)' },
      { id: 'streaming', name: 'Netflix, Spotify, etc.', amount: 0, ivaRate: 21 },
      { id: 'videojuegos', name: 'Videojuegos', amount: 0, ivaRate: 21 },
      { id: 'libros', name: 'Libros (físicos y e-books)', amount: 0, ivaRate: 4, note: 'IVA Superreducido' },
      { id: 'prensa', name: 'Prensa y suscripciones digitales', amount: 0, ivaRate: 4 },
      { id: 'viajes', name: 'Viajes y hoteles', amount: 0, ivaRate: 10 },
      { id: 'loteria', name: 'Lotería y apuestas', amount: 0, ivaRate: 0, note: 'Exento (Imp. especial premios)' }
    ]
  },
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
      { id: 'clothing', name: 'Ropa y calzado', amount: 0, ivaRate: 21 },
      { id: 'electronics', name: 'Electrónica (móvil, PC, TV)', amount: 0, ivaRate: 21 },
      { id: 'appliances', name: 'Electrodomésticos', amount: 0, ivaRate: 21 },
      { id: 'furniture', name: 'Muebles y decoración', amount: 0, ivaRate: 21 },
      { id: 'hygiene', name: 'Higiene personal', amount: 0, ivaRate: 21, note: 'IVA 21% (compresas al 10%)' },
      { id: 'optical', name: 'Gafas graduadas y lentillas', amount: 0, ivaRate: 21 },
      { id: 'pharmacy_rx', name: 'Farmacia (medicamentos con receta)', amount: 0, ivaRate: 4, note: 'IVA Superreducido' },
      { id: 'pharmacy_otc', name: 'Farmacia (sin receta) / Parafarmacia', amount: 0, ivaRate: 21, note: 'IVA 21% o 10%' },
      { id: 'pets', name: 'Productos para mascotas', amount: 0, ivaRate: 21, note: 'Comida al 10%' },
      { id: 'plants', name: 'Flores and plantas', amount: 0, ivaRate: 10, note: 'Flores 10% / Plantas 21%' }
    ]
  },
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
      { id: 'health_ins', name: 'Seguro médico privado', amount: 50, ivaRate: 0, specialTaxRate: 0.06, note: 'IPS (~6%)' },
      { id: 'dentist', name: 'Dentista', amount: 0, ivaRate: 0, note: 'Exento de IVA' },
      { id: 'doctor', name: 'Consultas médicas privadas', amount: 0, ivaRate: 0, note: 'Exento de IVA' },
      { id: 'education', name: 'Educación reglada (colegio, univ.)', amount: 0, ivaRate: 0, note: 'Exento de IVA' },
      { id: 'academy', name: 'Academia / Clases particulares', amount: 0, ivaRate: 21 },
      { id: 'school_supplies', name: 'Material escolar', amount: 0, ivaRate: 21 },
      { id: 'nursery', name: 'Guardería', amount: 0, ivaRate: 0, note: 'Exento de IVA' }
    ]
  },
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
      { id: 'hairdresser', name: 'Peluquería y estética', amount: 0, ivaRate: 21 },
      { id: 'pro_services', name: 'Servicios profesionales (abogado, etc.)', amount: 0, ivaRate: 21 },
      { id: 'domestic_help', name: 'Servicios domésticos', amount: 0, ivaRate: 0, note: 'Sin IVA (empleo hogar)' },
      { id: 'banking', name: 'Servicios bancarios', amount: 0, ivaRate: 0, note: 'Exento de IVA' },
      { id: 'parcel', name: 'Envíos y paquetería', amount: 0, ivaRate: 21 },
      { id: 'donations', name: 'Donaciones a ONG', amount: 0, ivaRate: 0, note: 'Sin IVA (deducible IRPF)' }
    ]
  }
];

export const INITIAL_STATE: AppState = {
  grossSalary: 35000,
  numPayments: 14,
  age: '',
  region: 'Comunidad de Madrid',
  maritalStatus: 'single',
  numChildren: 0,
  numChildrenUnder3: 0,
  disability: 'none',
  expenses: INITIAL_EXPENSES,
  viewMode: 'Mensual',
  consumptionDetailMode: 'Sencillo'
};
