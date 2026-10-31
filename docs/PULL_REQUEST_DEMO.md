# feat: add mobile-first ARVEX web demo

ARVEX pasa de un repositorio de configuración a una demo administrativa navegable, con acceso sin autenticación, resumen, productos, inventario, punto de venta, clientes y configuración por sucursal. Una venta demo actualiza el stock, el historial y las cifras del resumen; el estado persiste localmente en el navegador.

La interfaz prioriza iPhone con navegación inferior, controles táctiles, carrito móvil, safe areas y tipografía autoalojada. Incluye dos sucursales, ocho productos y perfiles ficticios. No contiene backend, pagos, integración fiscal ni seguridad multiempresa de producción.

Validación: pruebas de dominio, suite Playwright con ventas/stock/sucursales/persistencia/teclado, análisis axe y overflow en 320/390/768/1440 px, compilación Vite y auditoría de dependencias de ejecución. Consultar docs/DEMO-VALIDATION.md para resultados exactos.

Despliegue: lista para Vercel Preview con vercel.json. No se ha generado una vista HTTPS porque no hay conexión/credencial Vercel autorizada disponible. docs/DEMO.md contiene los pasos para desplegar esta rama sin --prod. Se requiere validación final en Safari de un iPhone físico.

## Apertura del PR

La rama se publicó correctamente por Git HTTPS. La creación automática del PR mediante `gh pr create` fue rechazada con `Post https://api.github.com/graphql: Forbidden`. No se creó un PR en esa operación. Abrir https://github.com/DeluxeRoss-r/ARVEX-SOLUTIONS/compare/main...feat/mobile-web-demo?expand=1 y usar este título/texto. Para crearlo desde el entorno habría que habilitar acceso autorizado a la API de GitHub; no hace falta volver a subir la rama ni proporcionar secretos en chat.
