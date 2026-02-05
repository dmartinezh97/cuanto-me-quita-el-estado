# Cuánto Me Quita el Estado

Calculadora fiscal interactiva que genera un "ticket fiscal" mostrando el desglose de impuestos en España: IRPF, Seguridad Social, IVA e impuestos especiales.

**Producción:** https://cuantomequitaelestado.com

## Stack Tecnológico

- **Framework:** Vue 3 + Astro 5
- **Build:** Vite 6
- **Lenguaje:** TypeScript 5.8
- **Estilos:** Tailwind CSS 4
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/dmartinezh97/cuanto-me-quita-el-estado.git
cd cuanto-me-quita-el-estado

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Comandos

| Comando           | Descripción                                      |
|-------------------|--------------------------------------------------|
| `npm install`     | Instalar dependencias                            |
| `npm run dev`     | Servidor de desarrollo (localhost:4321)          |
| `npm run build`   | Build de producción (incluye type-check)         |
| `npm run preview` | Preview del build                                |
| `npm run check`   | Type-check (astro check + vue-tsc)               |

## Estructura del Proyecto

```
src/
├── assets/            # Assets estáticos
├── components/        # Componentes Vue
├── composables/       # Lógica reactiva reutilizable
│   ├── useExpenses.ts         # Estado de gastos
│   ├── useFiscalCalculations.ts   # Cálculos fiscales
│   ├── useTooltip.ts          # Posicionamiento tooltips
│   └── useBoundedInput.ts     # Validación inputs
├── constants/         # Tasas impositivas y datos CCAA
├── data/              # Datos estáticos (profesiones, CCAA)
├── fiscal/            # Lógica de cálculos fiscales
├── layouts/           # Layouts Astro
├── pages/
│   ├── index.astro            # Página principal
│   ├── [ccaa].astro           # Páginas por comunidad autónoma
│   ├── profesion/[slug].astro # Páginas por profesión
│   ├── blog/                  # Artículos
│   └── comparador/            # Comparador entre CCAA
├── styles/            # Estilos globales
└── types/             # Interfaces TypeScript
```

## Arquitectura

### Composables Principales

- **`useExpenses()`**: Estado de categorías de gastos con `updateExpense()` y `updateSubItem()`
- **`useFiscalCalculations()`**: Valores derivados (IRPF, SS, IVA, impuestos especiales)
- **`useTooltip()`**: Posicionamiento de popups informativos
- **`useBoundedInput()`**: Validación de inputs con límites de presupuesto

### Patrón Data-Driven UI

La UI se configura mediante datos en lugar de `v-if` hardcodeados. Cada sub-item tiene una propiedad `display` con:

- `taxDisplayType`: Tipo de impuesto (standard, exempt, fuel, electricity, etc.)
- `labelColor`: 'red' para gravados, 'green' para exentos
- `inputType`: 'currency' o 'dual-input'

## Cálculos Fiscales

### IRPF

Dos regímenes soportados:
- **Régimen común** (mayoría de CCAA): 50% estatal + 50% autonómico
- **Régimen foral** (Navarra, País Vasco): Escala unificada propia

### Seguridad Social

- **Empleado:** 6.47% (contingencias + desempleo + formación + MEI)
- **Empresa:** 31.98% (contingencias + desempleo + FOGASA + formación + AT/EP + MEI)

### Impuestos Indirectos

- IVA (21%, 10%, 4%)
- Impuestos especiales (combustibles, electricidad, alcohol, tabaco)

## Páginas Dinámicas

- **`/[ccaa]`**: Página específica para cada comunidad autónoma con sus tramos IRPF
- **`/profesion/[slug]`**: Páginas optimizadas para SEO por profesión
- **`/comparador`**: Comparativa fiscal entre comunidades autónomas

## Variables de Entorno

Crear archivo `.env.local`:

```
GEMINI_API_KEY=tu_api_key  # Solo si se usa funcionalidad AI
```

## Licencia

Código privado.
