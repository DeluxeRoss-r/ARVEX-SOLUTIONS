# Demo HTML autónoma

`arvex-demo.html` contiene la aplicación completa en un único archivo: React, código de ARVEX, estilos, fuentes y favicon. No necesita Vercel ni descarga recursos externos al ejecutarse.

Reproducir y verificar desde la raíz:

```sh
npm ci
npm run build:html
npm run test:html
```

La prueba abre el HTML en un contexto Chromium móvil y sirve el documento de forma local con una URL HTTPS interceptada por Playwright. Rechaza cualquier otra solicitud de red y verifica acceso, venta, ticket, stock, persistencia y ausencia de overflow. No es una prueba de un servidor público ni de Safari físico.

Para abrirlo desde iPhone conviene un enlace HTTPS que lo sirva como HTML. El visor Archivos/Quick Look de iOS no garantiza ejecutar JavaScript de un HTML descargado. GitHub Raw tampoco es una vista interactiva: puede entregar el archivo como texto o descarga.

Este repositorio ya es público (visibilidad verificada; no se modificó). Se puede usar el formato de vista HTML de GitHack con un commit que contenga el archivo:

`https://raw.githack.com/DeluxeRoss-r/ARVEX-SOLUTIONS/<COMMIT>/standalone/arvex-demo.html`

GitHack es un servicio externo para previsualización de archivos públicos. No se crearon cuentas, proyectos Vercel ni servicios de pago. El acceso a raw.githack.com está bloqueado por la política de red de este entorno (HTTP CONNECT 403), por lo que no se ha verificado la respuesta del enlace externo. Sí se verifica que el archivo esté publicado en GitHub y su funcionamiento aislado en el navegador.

Solo datos ficticios: no introducir información real. La vista usa un dominio de terceros y no es un despliegue de producción.
