# Configuración SEO - Google Search Console

Este documento contiene los pasos para registrar tu sitio en Google Search Console y comenzar a monitorear tu rendimiento SEO.

## 📋 Pasos para Registrar en Google Search Console

### 1. Acceder a Google Search Console

Ve a: [https://search.google.com/search-console](https://search.google.com/search-console)

Inicia sesión con tu cuenta de Google.

### 2. Añadir Propiedad

Haz clic en "Añadir propiedad" y selecciona **"Prefijo de URL"**:
- URL: `https://cuantomequitaelestado.com`

### 3. Verificar Propiedad

Google te ofrecerá varios métodos de verificación. Los más recomendados son:

#### Opción A: Verificación mediante HTML tag (Recomendado para Astro)

1. Google te proporcionará un código HTML meta tag similar a:
   ```html
   <meta name="google-site-verification" content="TU_CODIGO_AQUI" />
   ```

2. Añade este tag en `src/layouts/BaseLayout.astro`, dentro del `<head>`:
   ```astro
   <!-- Google Search Console Verification -->
   <meta name="google-site-verification" content="TU_CODIGO_AQUI" />
   ```

3. Haz un deploy del sitio con el nuevo tag

4. Vuelve a Google Search Console y haz clic en "Verificar"

#### Opción B: Verificación mediante archivo HTML

1. Google te dará un archivo HTML para descargar (ej: `google1234567890abcdef.html`)

2. Coloca este archivo en la carpeta `/public/` de tu proyecto

3. Haz deploy del sitio

4. Verifica que puedes acceder a: `https://cuantomequitaelestado.com/google1234567890abcdef.html`

5. Vuelve a Google Search Console y haz clic en "Verificar"

#### Opción C: Verificación mediante DNS (Si controlas el DNS)

1. Google te proporcionará un registro TXT DNS

2. Añade ese registro TXT en la configuración DNS de tu dominio

3. Espera a que se propague (puede tardar hasta 48h)

4. Vuelve a Google Search Console y haz clic en "Verificar"

### 4. Enviar Sitemap

Una vez verificada la propiedad:

1. En el menú lateral, ve a **"Sitemaps"**

2. En el campo "Añadir un nuevo sitemap", introduce:
   ```
   sitemap.xml
   ```

3. Haz clic en "Enviar"

4. Google comenzará a rastrear tu sitio. La indexación puede tardar unos días.

### 5. Configurar Ajustes Básicos

#### País Objetivo

1. Ve a **Configuración** (icono de engranaje) en el menú lateral

2. En "Configuración del sitio", asegúrate de que el país objetivo sea **España**

#### Propietarios Adicionales (Opcional)

Si trabajas en equipo, puedes añadir más propietarios:

1. Ve a **Configuración** → **Usuarios y permisos**

2. Haz clic en "Añadir usuario" y asigna permisos

### 6. Monitorear Rendimiento

Una vez indexado, podrás ver:

#### Rendimiento
- **Clics**: Número de clics desde Google
- **Impresiones**: Veces que tu sitio apareció en resultados
- **CTR**: Porcentaje de clics/impresiones
- **Posición media**: Posición promedio en resultados

#### Cobertura
- **Páginas indexadas**: Páginas que Google ha indexado
- **Errores**: Problemas de indexación
- **Advertencias**: Mejoras sugeridas

#### Mejoras
- **Usabilidad móvil**: Problemas en dispositivos móviles
- **Core Web Vitals**: Métricas de experiencia de usuario
- **Breadcrumbs**: Validación de migas de pan

## 📊 Métricas Clave a Monitorear

### Semana 1-2 (Post-lanzamiento)
- [ ] Verificar que todas las páginas estén indexadas
- [ ] Comprobar que no hay errores de rastreo
- [ ] Confirmar que el sitemap se ha procesado correctamente

### Mensual
- [ ] Revisar páginas con mejor rendimiento
- [ ] Identificar keywords que generan tráfico
- [ ] Detectar páginas con baja CTR para optimizar meta descriptions
- [ ] Monitorear posición promedio por página

### Keywords Objetivo Inicial

Monitorea el rendimiento de estas keywords:

**Alta prioridad**:
- `calculadora IRPF 2026`
- `calculadora fiscal España`
- `impuestos por comunidad autónoma`
- `calculadora sueldo neto`

**Keywords long-tail** (cuando implementes páginas CCAA):
- `calculadora IRPF Madrid`
- `calculadora IRPF Cataluña`
- `diferencia fiscal Madrid Barcelona`
- `donde pagar menos impuestos España`

## 🎯 Objetivos SEO a 6 Meses

### Mes 1-2: Indexación
- ✅ 100% de páginas indexadas
- ✅ 0 errores de rastreo
- ✅ Meta tags optimizados funcionando

### Mes 3-4: Primeras Posiciones
- 🎯 Top 50 para "calculadora IRPF 2026"
- 🎯 Top 30 para keywords long-tail (CCAA específicas)
- 🎯 1,000-5,000 impresiones/mes

### Mes 5-6: Crecimiento
- 🎯 Top 20 para keywords principales
- 🎯 Top 10 para keywords long-tail
- 🎯 5,000-20,000 impresiones/mes
- 🎯 500-2,000 clics/mes

## 🔧 Troubleshooting

### "Mi sitio no aparece en Google"
- Espera 3-7 días después de enviar el sitemap
- Verifica que no haya un `noindex` en las páginas
- Comprueba que robots.txt no esté bloqueando Google

### "Tengo errores 404 en Search Console"
- Revisa que todas las rutas dinámicas funcionen correctamente
- Verifica que el sitemap.xml genere URLs válidas
- Añade redirects si has cambiado URLs

### "Mi CTR es muy bajo"
- Optimiza los meta descriptions para que sean más atractivos
- Revisa que los títulos incluyan las keywords objetivo
- Añade datos estructurados (Schema.org) si no los tienes

## 📚 Recursos Adicionales

- [Guía oficial de Google Search Console](https://support.google.com/webmasters/answer/9128668)
- [Centro de búsqueda de Google para desarrolladores](https://developers.google.com/search/docs)
- [Rich Results Test](https://search.google.com/test/rich-results) - Prueba tus datos estructurados

---

**Nota**: Este documento se actualizará conforme implementes las páginas programáticas (CCAA, comparadores, profesiones).
