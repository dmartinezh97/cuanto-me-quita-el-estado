# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desarrollo

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (localhost:4321)
npm run build        # Build de producción (astro check + astro build)
npm run preview      # Servir build de producción
npm run check        # Type-check completo (astro check + vue-tsc --noEmit)
npm run test         # Tests unitarios (vitest run)
npx vitest run src/fiscal/calculations/__tests__/irpf.test.ts  # Test individual
```

## Stack Tecnológico

- **Framework:** Astro 5 + Vue 3 con Composition API (`<script setup>`)
- **Build:** Vite 6 (via Astro)
- **Lenguaje:** TypeScript 5.8
- **Estilos:** Tailwind CSS 4
- **Testing:** Vitest (unitarios), Playwright (E2E en `test-popup.spec.js`)
- **Path aliases:** `@/` → `src/`, `@fiscal/` → `src/fiscal/`

## Arquitectura

### Descripción del Proyecto

Calculadora fiscal interactiva que genera un "ticket fiscal" mostrando el desglose de salario, Seguridad Social, IRPF e impuestos indirectos (IVA, impuestos especiales) en España.

### Estructura Principal

```
src/
├── assets/          # Fuentes e imágenes
├── components/
│   ├── astro/       # Componentes Astro (Header, Footer, CookieBanner)
│   └── vue/         # Componentes Vue organizados por dominio
│       ├── calculator/  # FiscalCalculator, PersonalDataForm, ExpenseCategories
│       ├── results/     # ResultsPanel, IRPFSection, SSSection, IVASection
│       ├── ticket/      # Componentes de ticket fiscal
│       └── ui/          # Componentes reutilizables (Badge, DataRow, DonutChart)
├── composables/     # Lógica reactiva reutilizable
├── constants/       # Constantes de aplicación (learn-content.ts)
├── data/            # Datos estáticos JSON (salarios, profesiones, comparaciones)
├── fiscal/          # ⭐ Módulo core de cálculos fiscales (ver sección dedicada)
├── layouts/         # BaseLayout.astro
├── pages/           # Rutas Astro (index, [ccaa], profesion/[slug], blog/, comparador/)
├── styles/          # Estilos globales
└── types/           # Interfaces TypeScript (calculations, expenses, fiscal, results, state)
```

### Módulo Fiscal (`src/fiscal/`)

Módulo autocontenido con toda la lógica fiscal. Tiene su propio path alias `@fiscal/`.

```
fiscal/
├── calculations/           # Funciones puras de cálculo
│   ├── __tests__/          # Tests unitarios (Vitest)
│   ├── irpf.ts             # Cálculo IRPF (progresivo, reducciones, deducciones)
│   ├── social-security.ts  # Cotizaciones SS con tope de base máxima
│   ├── indirect-taxes.ts   # IVA + impuestos especiales
│   └── formatters.ts       # Formato moneda/porcentaje
├── constants/              # Datos fiscales oficiales
│   ├── irpf.ts             # Tramos IRPF estatales y deducciones
│   ├── social-security.ts  # Tipos de cotización (empleado/empresa)
│   ├── iva.ts              # Tipos IVA por categoría
│   ├── special-taxes.ts    # IEH, IEE, IPS, alcohol, tabaco
│   └── ccaa/               # Datos autonómicos
│       ├── common.ts       # Tramos de 17 CCAA régimen común
│       └── foral.ts        # Navarra y País Vasco
└── data/                   # Estado inicial de la app
    ├── initial-expenses.ts # Categorías de gasto por defecto
    └── initial-state.ts    # Estado inicial del formulario
```

**IRPF** soporta dos regímenes:
- **Régimen común** (mayoría de CCAA): 50% estatal + 50% autonómico
- **Régimen foral** (Navarra, País Vasco): Escala unificada propia

**Seguridad Social** (datos 2025):
- **Empleado:** 6.48% (contingencias 4.70% + desempleo 1.55% + formación 0.10% + MEI 0.13%)
- **Empresa:** 32.07% (contingencias 23.60% + desempleo 5.50% + FOGASA 0.20% + formación 0.60% + AT/EP 1.50% + MEI 0.67%)
- **Base máxima:** 58.914 €/año (4.909,50 €/mes). `calculateSSContribution()` aplica el tope automáticamente.

### Patrón de UI Data-Driven

La UI se configura mediante datos, no con `v-if` hardcodeados. Cada sub-item de gasto tiene una propiedad `display` con:

- `taxDisplayType`: Tipo de impuesto (standard, exempt, fuel, electricity, gas, insurance, alcohol, tobacco)
- `labelColor`: 'red' para gravados, 'green' para exentos
- `inputType`: 'currency' o 'dual-input'

Para añadir nuevos tipos de visualización, extender `SubItemDisplayConfig` en `types/index.ts` y añadir el caso en `calculations.ts`.

### Composables

- **`useFiscalCalculations()`**: Puente entre cálculos fiscales puros y reactividad Vue
- **`useExpenses()`**: Estado de categorías de gastos, `updateExpense()`, `updateSubItem()`
- **`useLearnMode()`**: Toggle y estado del modo aprendizaje
- **`useTooltip()`**: Posicionamiento de popups informativos
- **`useBoundedInput()`**: Validación de inputs con límites de presupuesto

### Constantes Fiscales

Todas las tasas impositivas están centralizadas en `src/fiscal/constants/`. Para actualizar tipos:
1. Modificar la constante correspondiente en el archivo adecuado
2. Los cálculos se actualizan automáticamente vía imports
3. Actualizar tests si cambian los valores esperados

### Testing

- **Unitarios:** `npm run test` ejecuta Vitest sobre `src/fiscal/calculations/__tests__/`
- **E2E:** `test-popup.spec.js` en raíz (Playwright). Excluido de Vitest en `vitest.config.ts`
- Los tests cubren: impuesto progresivo, reducción por rendimientos de trabajo, IRPF completo, SS con tope, impuestos indirectos

## Convenciones de Código

- Usar `<script setup>` con Composition API
- Preferir `reactive()` + `computed()` sobre watchers
- Templates data-driven: configurar display en `initial-expenses.ts`, no hardcodear `v-if`
- Tipos en PascalCase, composables/funciones en camelCase, constantes en SCREAMING_SNAKE_CASE
- Contenido educativo (learn mode) centralizado en `src/constants/learn-content.ts`
