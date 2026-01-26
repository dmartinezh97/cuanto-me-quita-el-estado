# Lógica Fiscal

Este directorio contiene toda la lógica fiscal del proyecto, organizada de forma auditable y mantenible.

## Estructura

```
fiscal/
├── constants/           # Constantes fiscales
│   ├── index.ts         # Re-exporta todo
│   ├── irpf.ts          # Tramos y deducciones IRPF
│   ├── social-security.ts # Cotizaciones SS
│   ├── iva.ts           # Tipos de IVA
│   ├── special-taxes.ts # Impuestos especiales
│   └── ccaa/            # Comunidades Autónomas
│       ├── index.ts     # Re-exporta + helpers
│       ├── common.ts    # Régimen común (17 CCAA)
│       └── foral.ts     # Régimen foral (Navarra, País Vasco)
│
├── calculations/        # Funciones de cálculo
│   ├── index.ts         # Re-exporta todo
│   ├── irpf.ts          # Cálculo IRPF
│   ├── social-security.ts # Cálculo SS
│   ├── indirect-taxes.ts # IVA e impuestos especiales
│   └── formatters.ts    # Formateo de moneda/porcentajes
│
├── data/                # Datos iniciales
│   ├── initial-expenses.ts # Categorías de gastos por defecto
│   └── initial-state.ts    # Estado inicial de la app
│
└── README.md            # Este archivo
```

## Fuentes Oficiales

### IRPF (Impuesto sobre la Renta de las Personas Físicas)

- **AEAT**: https://sede.agenciatributaria.gob.es
- **Manual IRPF 2024**: https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2024.html

### Seguridad Social

- **Seg-Social**: https://www.seg-social.es
- **Bases y tipos de cotización**: https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores

### IVA

- **AEAT - IVA**: https://sede.agenciatributaria.gob.es/Sede/iva.html
- **Tipos impositivos**: 4% (superreducido), 10% (reducido), 21% (general)

### Impuestos Especiales

- **Ley 38/1992**: Ley de Impuestos Especiales
- **BOE**: Boletín Oficial del Estado para actualizaciones

### Comunidades Autónomas

- **Ministerio de Hacienda**: https://www.hacienda.gob.es/
- **Agencias tributarias autonómicas**:
  - Cataluña: https://atc.gencat.cat/es/tributs/irpf/
  - Madrid: https://www.comunidad.madrid/
  - Navarra: https://hacienda.navarra.es/
  - País Vasco: Diputaciones Forales

## Metodología de Cálculo

### IRPF

1. **Rendimiento neto del trabajo** = Bruto - Cotizaciones SS - 2.000€ (gastos deducibles)
2. **Reducción por rendimientos del trabajo** (para rentas bajas, art. 20 LIRPF)
3. **Mínimo personal y familiar** = 5.550€ + deducciones por hijos
4. **Base liquidable** = Rendimiento neto - Reducciones - Mínimo
5. **Cuota íntegra** = Aplicación de tramos (50% estatal + 50% autonómico)

### Seguridad Social

- **Empleado**: 6,47% del salario bruto
  - Contingencias comunes: 4,70%
  - Desempleo: 1,55%
  - Formación profesional: 0,10%
  - MEI: 0,12%

- **Empresa**: 31,98% del salario bruto
  - Contingencias comunes: 23,60%
  - Desempleo: 5,50%
  - FOGASA: 0,20%
  - Formación profesional: 0,60%
  - AT y EP: ~1,50%
  - MEI: 0,58%

### IVA e Impuestos Especiales

- **IVA**: Se calcula sobre el PVP → Base = PVP / (1 + tipo)
- **Hidrocarburos**: 0,4007 €/litro (gasolina/diésel)
- **Electricidad**: 5,11% sobre base antes de IVA
- **Seguros**: 6% IPS (sin IVA)
- **Tabaco**: ~57% del precio antes de IVA
- **Alcohol**: ~5% aproximado

## Actualización de Datos

Para actualizar los tipos impositivos:

1. Verificar la fuente oficial (BOE, AEAT, etc.)
2. Actualizar el archivo correspondiente en `constants/`
3. Documentar el cambio con fecha y fuente
4. Los cálculos se actualizan automáticamente

## Notas Importantes

- **Régimen foral**: Navarra y País Vasco tienen escalas unificadas (no se suman estatal + autonómico)
- **Aproximaciones**: Algunos impuestos especiales usan aproximaciones razonables del % efectivo
- **Fecha de datos**: Actualizados a 2025
