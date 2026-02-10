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
      'Salarios bajos (hasta ~19.747 €) tienen una reducción que puede dejarlos casi exentos',
    ],
  },

  ssEmpresa: {
    title: 'Cotización de la Empresa',
    content: 'Tu empresa paga aproximadamente un 32% adicional sobre tu salario bruto a la Seguridad Social. España usa un sistema de reparto: lo que se cotiza hoy paga las pensiones de los jubilados de hoy, no se ahorra para las tuyas. Es un coste "invisible" que no aparece en tu nómina pero forma parte de lo que cuestas.',
    details: [
      'Contingencias Comunes (23,60%): Paga las pensiones y sanidad actuales',
      'Desempleo (5,50%): Prestaciones por desempleo',
      'FOGASA (0,20%): Garantía salarial si la empresa quiebra',
      'Formación Profesional (0,60%): Formación de trabajadores',
      'AT/EP (~1,50%): Accidentes de trabajo',
      'MEI (0,67%): Mecanismo de Equidad Intergeneracional',
      'Tope: solo se cotiza hasta una base máxima de 4.909,50 €/mes (58.914 €/año)',
    ],
  },

  ssEmpleado: {
    title: 'Tu Cotización como Trabajador',
    content: 'Como empleado, cotizas un 6,48% de tu salario bruto a la Seguridad Social. Esta cantidad se descuenta directamente de tu nómina y paga las prestaciones de hoy: cuando te jubiles, serán los trabajadores de ese momento quienes financien tu pensión. Si ganas más de 58.914 €/año, la cotización se topa en esa cantidad.',
    details: [
      'Contingencias Comunes (4,70%): Financia las pensiones y sanidad actuales',
      'Desempleo (1,55%): Tu parte del seguro de desempleo',
      'Formación Profesional (0,10%): Derecho a formación bonificada',
      'MEI (0,13%): Recargo extra para cubrir el déficit futuro de pensiones',
    ],
  },

  iva: {
    title: 'IVA en tu Consumo',
    content: 'El IVA grava el consumo con tres tipos (4%, 10%, 21%). Pero algunos productos sufren doble imposición: pagan un impuesto especial Y además IVA sobre el precio que ya incluye ese impuesto.',
    details: [
      'IVA 4%: Alimentos básicos, libros, medicamentos',
      'IVA 10%: Alimentos, transporte, hostelería',
      'IVA 21%: Ropa, electrónica, servicios generales',
    ],
  },

  doblesImposiciones: {
    title: 'Dobles Imposiciones',
    content: 'Algunos productos pagan un impuesto especial ANTES del IVA, y luego el IVA se calcula sobre el precio que ya incluye ese impuesto. Es un "impuesto sobre impuesto".',
    details: [
      'Combustibles: IEH (0,40€/L fijo) + IVA 21%',
      'Electricidad: IEE (5,11%) + IVA 21%',
      'Gas Natural: Imp. Hidrocarburos + IVA 21%',
      'Alcohol: Imp. Especial (~5%) + IVA 21%',
      'Tabaco: Imp. Labores (~57%) + IVA 21%',
      'Seguros: IPS (6%) - exentos de IVA pero con impuesto propio',
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
