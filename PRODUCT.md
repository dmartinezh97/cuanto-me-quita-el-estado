# PRODUCT.md

## Cuánto Me Quita el Estado

### Descripción

Calculadora fiscal interactiva que genera un "ticket fiscal" mostrando el desglose completo de lo que un trabajador español aporta al Estado: desde la Seguridad Social y el IRPF hasta los impuestos indirectos sobre cada euro que gasta.

### Problema que resuelve

La mayoría de trabajadores conocen su salario bruto y neto, pero desconocen la carga fiscal real que soportan. Esta herramienta hace visible:

- Lo que la empresa paga por ti (coste empresa)
- Lo que te retienen de la nómina (IRPF + SS)
- Los impuestos que pagas en cada compra (IVA, impuestos especiales)
- El porcentaje total que se queda el Estado vs. lo que realmente disfrutas

---

## Funcionalidades Principales

### Cálculo de IRPF

- **Tramos progresivos** actualizados para 2025
- **Régimen común**: 50% estatal + 50% autonómico (17 CCAA)
- **Régimen foral**: Escala unificada propia (Navarra, País Vasco)
- **Deducciones**: Mínimo personal (5.550€), por descendientes, menores de 3 años

### Cálculo de Seguridad Social

- **Cuota del empleado**: 6,47%
  - Contingencias comunes: 4,70%
  - Desempleo: 1,55%
  - Formación profesional: 0,10%
  - MEI: 0,12%
- **Cuota de la empresa**: 31,98%
  - Contingencias comunes: 23,60%
  - Desempleo: 5,50%
  - FOGASA: 0,20%
  - Formación: 0,60%
  - AT/EP: 1,80%
  - MEI: 0,28%

### Cálculo de IVA

- **Superreducido (4%)**: Pan, leche, frutas, medicamentos con receta, libros
- **Reducido (10%)**: Carne, pescado, restaurantes, transporte, hoteles
- **General (21%)**: Resto de bienes y servicios

### Impuestos Especiales

| Impuesto | Tasa/Cantidad |
|----------|---------------|
| Hidrocarburos (IEH) | 0,4007 €/litro |
| Electricidad (IEE) | 5,11% |
| Gas natural | 0,00234 €/kWh |
| Primas de seguros (IPS) | 6% |
| Alcohol | ~5% del PVP |
| Tabaco | ~57% de la base |

### Características de la Interfaz

- **Ticket fiscal visual** tipo recibo de compra
- **Validación de presupuesto** en tiempo real
- **Modo mensual/anual** para todos los cálculos
- **Modo simple/detallado** para impuestos indirectos
- **Tooltips informativos** con explicaciones fiscales

---

## Datos de Entrada

### Datos Económicos

- Salario bruto anual
- Número de pagas (12-14)

### Situación Personal

- Edad
- Comunidad Autónoma
- Estado civil
- Número de hijos
- Hijos menores de 3 años
- Grado de discapacidad

### Gastos Mensuales

Introduce el gasto en cada categoría para calcular los impuestos indirectos que pagas sobre tu consumo.

---

## Resultados que Muestra

### Parte Superior: Tu Sueldo

1. **Coste empresa** - Lo que la empresa paga en total por ti
2. **SS Empresa** - Seguridad Social a cargo de la empresa (~32%)
3. **Salario bruto** - Tu sueldo antes de deducciones
4. **IRPF** - Retención según tu CCAA y situación
5. **SS Empleado** - Tu cuota de Seguridad Social (~6,5%)
6. **Salario neto** - Lo que recibes en cuenta

### Parte Inferior: Tu Consumo

1. **Presupuesto disponible** - Salario neto para gastar
2. **IVA total** - Desglosado por tipos (4%, 10%, 21%)
3. **Impuestos especiales** - Por categoría
4. **Valor real** - Lo que realmente compras (sin impuestos)

### Resumen Final

- **% que se queda el Estado** - Suma de todas las cargas fiscales
- **% que disfrutas tú** - Tu capacidad real de compra

---

## Categorías de Gasto

### Transporte y Combustibles

- Gasolina/Gasóleo (IEH + IVA 21%)
- Transporte público (IVA 10%)
- Taxi/VTC (IVA 10%)
- Parking y peajes (IVA 21%)
- Mantenimiento vehículo (IVA 21%)
- Seguro de coche (IPS 6%)

### Hogar y Suministros

- Alquiler vivienda (Exento)
- Hipoteca (Sin IVA directo)
- Electricidad (IEE 5,11% + IVA 21%)
- Gas natural (IEH + IVA 21%)
- Agua (IVA 10%)
- Internet y teléfono (IVA 21%)
- Comunidad de vecinos (Sin IVA)
- Seguro de hogar (IPS 6%)
- Productos de limpieza (IVA 21%)

### Alimentación y Supermercado

- Básicos: pan, leche, fruta, aceite (IVA 4%)
- Carne, pescado, procesados (IVA 10%)
- Refrescos y alcohol (Imp. Alcohol + IVA 21%)
- Tabaco (Imp. Tabaco ~57% + IVA 21%)

### Ocio y Restauración

- Restaurantes y bares (IVA 10%)
- Comida a domicilio (IVA 10% + servicio 21%)
- Cine, teatro, conciertos (IVA 10%)
- Gimnasio/Deportes (IVA 21%)
- Streaming (IVA 21%)
- Libros (IVA 4%)
- Viajes y hoteles (IVA 10%)
- Lotería (Exento)

### Compras y Bienes

- Ropa y calzado (IVA 21%)
- Electrónica (IVA 21%)
- Electrodomésticos (IVA 21%)
- Muebles (IVA 21%)
- Farmacia con receta (IVA 4%)
- Farmacia sin receta (IVA 21%)

### Salud y Educación

- Seguro médico privado (IPS 6%)
- Dentista (Exento)
- Consultas médicas (Exento)
- Educación reglada (Exento)
- Academia/Clases particulares (IVA 21%)
- Guardería (Exento)

### Servicios y Otros

- Peluquería y estética (IVA 21%)
- Servicios profesionales (IVA 21%)
- Servicios domésticos (Sin IVA)
- Servicios bancarios (Exento)
- Donaciones (Sin IVA, deducible IRPF)

---

## Comunidades Autónomas Soportadas

### Régimen Común (17)

| Comunidad | Tipo marginal máximo |
|-----------|---------------------|
| Andalucía | 47,00% |
| Aragón | 50,00% |
| Principado de Asturias | 50,00% |
| Illes Balears | 49,25% |
| Canarias | 50,50% |
| Cantabria | 49,00% |
| Castilla-La Mancha | 47,00% |
| Castilla y León | 46,00% |
| Cataluña | 50,00% |
| Ceuta | 48,00% |
| Extremadura | 49,50% |
| Galicia | 47,00% |
| Comunidad de Madrid | 45,00% |
| Melilla | 48,00% |
| Región de Murcia | 47,00% |
| La Rioja | 51,50% |
| Comunitat Valenciana | 54,00% |

### Régimen Foral (2)

| Comunidad | Tipo marginal máximo |
|-----------|---------------------|
| Navarra | 52,00% |
| País Vasco | 49,00% |

---

## Notas Técnicas

- Los datos fiscales corresponden a la normativa vigente en 2025
- Los tipos de la Seguridad Social incluyen el MEI (Mecanismo de Equidad Intergeneracional)
- Los impuestos especiales sobre combustibles incluyen tipo estatal y autonómico
- El cálculo de IRPF aplica el mínimo personal y familiar automáticamente
