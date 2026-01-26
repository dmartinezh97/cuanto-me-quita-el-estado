# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos de Desarrollo

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (localhost:3000)
npm run build        # Build de producción (incluye vue-tsc)
npm run preview      # Servir build de producción
npx vue-tsc --noEmit # Type-check rápido sin build
```

## Stack Tecnológico

- **Framework:** Vue 3 con Composition API (`<script setup>`)
- **Build:** Vite 6
- **Lenguaje:** TypeScript 5.8
- **Estilos:** Tailwind CSS 3.4
- **Testing:** Playwright (E2E)
- **Path alias:** `@/` → `src/`

## Arquitectura

### Descripción del Proyecto

Calculadora fiscal interactiva que genera un "ticket fiscal" mostrando el desglose de salario, Seguridad Social, IRPF e impuestos indirectos (IVA, impuestos especiales) en España.

### Estructura Principal

```
src/
├── composables/     # Lógica reactiva reutilizable
├── components/      # Componentes Vue
├── constants/       # Tasas impositivas y datos de CCAA
├── utils/           # Funciones puras de cálculo
└── types/           # Interfaces TypeScript
```

### Patrón de UI Data-Driven

La UI se configura mediante datos, no con `v-if` hardcodeados. Cada sub-item de gasto tiene una propiedad `display` con:

- `taxDisplayType`: Tipo de impuesto (standard, exempt, fuel, electricity, gas, insurance, alcohol, tobacco)
- `labelColor`: 'red' para gravados, 'green' para exentos
- `inputType`: 'currency' o 'dual-input'

Para añadir nuevos tipos de visualización, extender `SubItemDisplayConfig` en `types/index.ts` y añadir el caso en `calculations.ts`.

### Composables Principales

- **`useExpenses()`**: Estado de categorías de gastos, `updateExpense()`, `updateSubItem()`
- **`useFiscalCalculations()`**: Valores derivados (IRPF, SS, IVA, impuestos especiales)
- **`useTooltip()`**: Posicionamiento de popups informativos
- **`useBoundedInput()`**: Validación de inputs con límites de presupuesto

### Cálculos Fiscales

El IRPF soporta dos regímenes:
- **Régimen común** (mayoría de CCAA): 50% estatal + 50% autonómico
- **Régimen foral** (Navarra, País Vasco): Escala unificada propia

La Seguridad Social tiene dos componentes:
- **Empleado:** 6.47% (contingencias + desempleo + formación + MEI)
- **Empresa:** 31.98% (contingencias + desempleo + FOGASA + formación + AT/EP + MEI)

### Constantes

Todas las tasas impositivas están centralizadas en `constants/taxes.ts`. Para actualizar tipos:
1. Modificar la constante correspondiente
2. Los cálculos se actualizan automáticamente vía imports

## Convenciones de Código

- Usar `<script setup>` con Composition API
- Preferir `reactive()` + `computed()` sobre watchers
- Templates data-driven: configurar display en `initialData.ts`, no hardcodear `v-if`
- Tipos en PascalCase, composables/funciones en camelCase, constantes en SCREAMING_SNAKE_CASE
