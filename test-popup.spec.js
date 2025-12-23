import { test, expect } from '@playwright/test';

test('verificar popup de sueldo disponible', async ({ page }) => {
  // Configurar viewport más grande
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Navegar a la aplicación
  await page.goto('http://localhost:3001');

  // Esperar a que la página cargue completamente
  await page.waitForLoadState('networkidle');

  // Buscar la sección "Servicios y Otros"
  const serviciosSection = page.locator('text=SERVICIOS Y OTROS').first();
  await expect(serviciosSection).toBeVisible();

  // Expandir la sección haciendo click en el summary
  const summary = page.locator('summary:has-text("SERVICIOS Y OTROS")').first();
  await summary.click();

  // Esperar a que se expanda
  await page.waitForTimeout(500);

  // Buscar todos los inputs dentro de la sección de gastos y tomar el primero visible
  const peluqueriaInput = page.locator('details:has-text("SERVICIOS Y OTROS") input[type="number"]').first();

  console.log('📍 Tomando captura ANTES del click...');
  await page.screenshot({ path: 'popup-before.png', fullPage: true });

  // Hacer click en el input para darle focus
  await peluqueriaInput.click();

  // Esperar más tiempo para que aparezca la transición
  await page.waitForTimeout(1000);

  // Verificar que el input tiene el focus
  const isFocused = await peluqueriaInput.evaluate(el => el === document.activeElement);
  console.log('🎯 ¿Input tiene focus?', isFocused);

  // Evaluar directamente el estado del tooltip en JavaScript
  const tooltipState = await page.evaluate(() => {
    return {
      elements: document.querySelectorAll('[data-tooltip]').length,
      bodyChildren: document.body.children.length,
      redElements: document.querySelectorAll('.bg-red-700').length,
    };
  });
  console.log('💡 Estado del tooltip:', tooltipState);

  console.log('📍 Tomando captura DESPUÉS del click...');
  await page.screenshot({ path: 'popup-after.png', fullPage: true });

  // Buscar el popup por el texto "SUELDO DISPONIBLE"
  const popup = page.locator('text=SUELDO DISPONIBLE').first();
  const popupCount = await popup.count();
  console.log('🔍 Número de popups en el DOM (por texto):', popupCount);

  // Buscar todos los divs con bg-red-700
  const redDivs = page.locator('.bg-red-700');
  const redCount = await redDivs.count();
  console.log('🔴 Número de divs rojos:', redCount);

  // Obtener estilos del popup si existe
  if (popupCount > 0) {
    const isVisible = await popup.isVisible();
    console.log('👁️ ¿Popup visible?', isVisible);

    const boundingBox = await popup.boundingBox();
    console.log('📦 Bounding box del popup:', boundingBox);

    //Buscar el contenedor padre
    const container = popup.locator('..').locator('..').locator('..');
    const containerCount = await container.count();
    if (containerCount > 0) {
      const containerStyles = await container.first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          position: computed.position,
          zIndex: computed.zIndex,
          left: computed.left,
          top: computed.top,
          className: el.className,
        };
      });
      console.log('🎨 Estilos del contenedor padre:', containerStyles);
    }
  }

  // Verificar que el popup es visible
  await expect(popup).toBeVisible();

  console.log('✅ Test pasado: El popup se muestra correctamente');
});
