# ARVEX mobile demo implementation plan

Goal: siete pantallas conectadas y un punto de venta funcional con vista móvil y despliegue estático de prueba.
Architecture: React/Vite, estado demo versionado en localStorage, cálculos en centavos y separación estricta por sucursal dentro de la simulación. Sin servidor, pagos o autenticación.

- [x] Revisar main, instrucciones y Skills; crear rama feat/mobile-web-demo.
- [x] Escribir pruebas de cantidades, totales, stock y coherencia; implementar data.js y domain.js y comprobarlas.
- [x] Implementar shell accesible, login, gráficos y pantallas con componentes reutilizables; navegación móvil y escritorio.
- [x] Probar ventas, inventario, filtros, clientes, configuración, persistencia y cambio de sucursal con Playwright, además de accesibilidad y overflow en móvil/tablet/escritorio.
- [x] Compilar y ejecutar el detector de Impeccable, revisar capturas y corregir defectos.
- [x] Publicar rama y preparar texto/enlace de PR. Creación automática bloqueada por API GitHub Forbidden. Vercel sin conexión/credencial: configuración Preview y pasos exactos listos en docs/DEMO.md; despliegue HTTPS pendiente externo.

Review focus: cantidades fuera de stock; carrito al cambiar sucursal; localStorage no disponible o corrupto; teclado y foco en móvil; dobles pulsaciones al vender. El alcance es una demo, no seguridad multiempresa real.
