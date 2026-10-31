# Probar ARVEX desde el teléfono

Esta rama contiene una demo web React/Vite completa, estática y adaptable. No requiere base de datos, claves ni servicios de pago. En el acceso, pulsa **Explorar demo**.

## Lo que puedes probar

- Resumen con ventas de hoy, ticket promedio, stock, gráficas por día y categoría, actividad y productos más vendidos. Los importes se derivan de las ventas, no están escritos a mano.
- Productos: buscar por nombre o SKU, elegir categoría y ver precios/existencias o filtrar stock bajo.
- Vender: agregar productos, aumentar/disminuir cantidades, eliminar líneas, elegir cliente y simular venta. Recibirás un comprobante demo; se descuenta stock y se registran movimientos.
- Inventario: registrar entradas/salidas enteras con motivo y filtrar el historial. Las salidas no pueden superar el saldo.
- Clientes: buscar perfiles ficticios y consultar compras de la sucursal.
- Configuración: cambiar nombre ficticio de empresa/sucursal o restablecer datos con confirmación.
- Sucursal: alternar Centro y Norte. Cada una conserva sus ventas y existencias; cambiar con un carrito pendiente requiere confirmación.

En móvil, Clientes y Configuración están en **Más**. El carrito se abre con la barra fija **Ver carrito**; en escritorio aparece a la derecha.

Los datos se guardan en este navegador; no se comparten entre dispositivos, ni equivalen a una base de datos. Se sincronizan cambios locales entre pestañas y se detectan versiones obsoletas antes de guardar, pero no se ofrece concurrencia transaccional de un sistema real. Si el navegador bloquea almacenamiento, se informa y se puede seguir probando en memoria. No introducir datos personales o empresariales reales. No hay autenticación, pagos, impuestos ni documentos con valor fiscal.

## Iniciar o compilar

Node.js 22.20+ (validado con 24.19.0).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`dist/` es la salida desplegable; las fuentes tipográficas y recursos son locales, sin CDNs de ejecución. La URL local sirve para desarrollo, no es un enlace HTTPS accesible desde otro dispositivo.

## Vista previa HTTPS en Vercel (sin producción)

La app incluye `vercel.json`: preset Vite, comando `npm run build`, salida `dist`, y cabeceras noindex. Las rutas usan hash, por lo que no necesitan redirecciones de servidor.

En esta sesión no había conexión, credencial ni proyecto de Vercel disponible. Por ello **no se generó una URL pública** ni se publicó el producto. El paso pendiente es autenticar una cuenta de Vercel autorizada y ejecutar un despliegue Preview de esta rama.

Desde una computadora con Node y acceso a esa cuenta:

```sh
git clone --branch feat/mobile-web-demo https://github.com/DeluxeRoss-r/ARVEX-SOLUTIONS.git
cd ARVEX-SOLUTIONS
npm ci
npx vercel login
npx vercel deploy
```

Selecciona la cuenta/equipo autorizado y vincula un proyecto de prueba (o crea uno de demo en el plan gratuito disponible). Confirma preset **Vite**, build **npm run build**, salida **dist**, sin variables de entorno. No uses `--prod`. El CLI imprimirá una dirección HTTPS de Preview; abre esa dirección en Safari del iPhone. Si la cuenta tiene protección de previews, accede con la cuenta autorizada o usa el enlace compartido permitido por su configuración; no hace falta desactivar protecciones globales.

Si ya estás autenticado, el único comando pendiente dentro del checkout es `npx vercel deploy`. No deben habilitarse servicios de pago. Las credenciales se configuran en la cuenta/herramienta de Vercel, nunca en chat ni en el repositorio.

Para automatizar desde este entorno harían falta acceso permitido a los endpoints de Vercel y una identidad/credencial autorizada, además de la asociación con el proyecto de prueba. La integración no está presente en las herramientas disponibles; no se inventó una URL ni se usó un túnel externo.

## Pruebas de navegador

```sh
npx playwright install chromium  # si no tienes un Chromium compatible
npm run test:e2e
```

El runner usa Chromium del sistema cuando existe `/usr/bin/chromium`; en otras máquinas utiliza el instalado por Playwright. También admite `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Se prueban móvil emulado, tablet y escritorio: anchos 320, 390, 768 y 1440 px, además de flujos, teclado, fallos de almacenamiento y análisis axe WCAG A/AA. Esto no reemplaza la prueba física de iPhone: comprobar Safari, teclado virtual, notch/safe areas, zoom y rotación con la URL HTTPS una vez desplegada. Tampoco constituye certificación completa de accesibilidad.

## Skills aplicadas

Impeccable: contexto ejecutado y detector mecánico manual; modo Operate. Taste: hoja `achromatic-ledger` y reglas app screens, con controles ampliados por la prioridad táctil y tipografía DM Sans local. Emil: interacción inmediata, foco, reduced-motion y recomendaciones mobile-native. No se habilitaron hooks ni se modificaron las Skills instaladas.
