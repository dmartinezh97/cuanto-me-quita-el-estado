/**
 * learn-content.ts - Educational content for Learn Mode.
 *
 * Centralized texts for each section's explanation boxes.
 */

export interface LearnContentSection {
  title: string;
  content: string;
  details?: string[];
}

export const LEARN_CONTENT = {
  irpf: {
    title: 'IRPF Progresivo',
    content: 'El IRPF es un impuesto progresivo: solo pagas el tipo más alto por la parte de tu salario que supera cada tramo. Por ejemplo, si ganas 30.000 €, los primeros 12.450 € tributan al 19%, los siguientes 7.750 € al 24%, y así sucesivamente.',
    details: [
      'Es un impuesto directo sobre tu renta',
      'Se divide 50% Estado / 50% Comunidad Autónoma (excepto regímenes forales)',
      'Tu tipo efectivo siempre será menor que tu tipo marginal máximo',
    ],
  },

  ssEmpresa: {
    title: 'Cotización de la Empresa',
    content: 'Tu empresa paga aproximadamente un 32% adicional sobre tu salario bruto a la Seguridad Social. Este dinero financia pensiones, desempleo y prestaciones sanitarias. Es un coste "invisible" que no aparece en tu nómina pero forma parte de lo que cuestas.',
    details: [
      'Contingencias Comunes (23,60%): Pensiones y sanidad',
      'Desempleo (5,50%): Prestaciones por desempleo',
      'FOGASA (0,20%): Garantía salarial si la empresa quiebra',
      'Formación Profesional (0,60%): Formación de trabajadores',
      'AT/EP (~1,50%): Accidentes de trabajo',
      'MEI (0,58%): Mecanismo de Equidad Intergeneracional',
    ],
  },

  ssEmpleado: {
    title: 'Tu Cotización como Trabajador',
    content: 'Como empleado, cotizas un 6,47% de tu salario bruto a la Seguridad Social. Esta cantidad se descuenta directamente de tu nómina. A cambio, generas derechos a pensión, desempleo y otras prestaciones.',
    details: [
      'Contingencias Comunes (4,70%): Tu aportación a pensiones y sanidad',
      'Desempleo (1,55%): Tu parte del seguro de desempleo',
      'Formación Profesional (0,10%): Derecho a formación bonificada',
      'MEI (0,12%): Para sostener el sistema de pensiones futuro',
    ],
  },

  iva: {
    title: 'IVA en tu Consumo',
    content: 'El IVA es un impuesto al consumo que pagas cada vez que compras algo. En España hay tres tipos: superreducido (4%) para alimentos básicos, reducido (10%) para alimentos, transporte y hostelería, y general (21%) para la mayoría de productos.',
    details: [
      'IVA 4%: Pan, leche, huevos, frutas, verduras, libros, medicamentos',
      'IVA 10%: Carne, pescado, transporte, hostelería, vivienda nueva',
      'IVA 21%: Ropa, electrónica, combustible, servicios generales',
    ],
  },

  presionFiscal: {
    title: 'Tu Presión Fiscal Real',
    content: 'La presión fiscal mide qué porcentaje del coste total de tu trabajo acaba en impuestos. Incluye no solo lo que ves en tu nómina (IRPF y SS empleado), sino también lo que paga tu empresa por ti y los impuestos indirectos de tu consumo.',
    details: [
      'IRPF: Impuesto sobre tu renta',
      'SS Empresa + Empleado: Cotizaciones sociales',
      'IVA e Impuestos Especiales: Impuestos al consumo',
    ],
  },
} as const;

export type LearnContentKey = keyof typeof LEARN_CONTENT;
