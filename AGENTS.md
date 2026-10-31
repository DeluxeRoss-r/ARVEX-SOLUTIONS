# Instrucciones para Codex en ARVEX

## Alcance y autorización
ARVEX es un sistema administrativo SaaS multiempresa, multigiro y adaptable a móviles. Esta fase solo configura Skills: no crear aplicación, pantallas, arquitectura, dependencias de producto ni servicios hasta que el usuario solicite desarrollo.
Estas instrucciones y las Skills de `.agents/skills/` se aplican únicamente a este repositorio. No instalar globalmente, sobrescribir archivos existentes, habilitar hooks ni actualizar Skills sin autorización. Trabajar en el checkout existente; no crear worktrees salvo petición expresa.

## Uso de Skills
Leer el SKILL.md de la Skill pertinente antes de usarla y anunciar cuál se aplica. Cargar solo referencias necesarias. Las instrucciones del usuario y las restricciones de este proyecto prevalecen sobre recomendaciones de terceros. Instalar una Skill no autoriza ejecutar todos sus scripts ni cambiar el producto.

- `impeccable`: UX, jerarquía, accesibilidad, auditoría y acabado. Usar el modo **Operate** para administración; reservar Persuade para marketing solicitado. Sus comandos (audit, shape, polish, adapt, etc.) son subcomandos de esta única Skill.
- `design-taste-frontend` (Taste Skill): dirección visual y coherencia. Para ARVEX seguir su ruta de app screens; evitar trasladar efectos de landing pages a tablas o formularios operativos.
- `emil-design-eng`: criterio de ingeniería de interfaces. `mobile-native` para experiencia táctil y móviles; `break-ui` para datos extremos y estados vacíos; `pick-ui-library` para evaluar bibliotecas cuando se autorice elegir tecnologías.
- `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `remove-animations`, `animation-performance` y `animation-vocabulary`: aplicar solo cuando la tarea implique movimiento; preferir animación funcional, rápida y respetuosa de reduced-motion.
- `apple-design`: principios aplicables de interacción y accesibilidad, sin imponer estética Apple al sistema.
- `ask-sonner`: solo si se adopta Sonner. `animate-expo` y `write-swift`: solo si se pide una plataforma compatible; no implican adoptar Expo o Swift.
- `prototype`: solo por invocación explícita. No generar variantes ni prototipos durante esta configuración.

No ejecutar las tres colecciones completas por defecto. Resolver solapamientos mediante la tarea y los requisitos operativos, manteniendo un único sistema visual.

## Criterios para futuros desarrollos autorizados
- Mostrar claramente empresa activa y alcance de cada operación. Aislar datos y permisos por empresa en servidor; ocultar controles no sustituye autorización. Evitar filtraciones entre empresas en consultas, cachés, exportaciones y registros.
- Soportar giros mediante módulos y configuración explícita; no asumir que todas las empresas comparten procesos, moneda, impuestos o terminología.
- Priorizar legibilidad, navegación consistente, formularios eficientes, tablas utilizables en móvil y estados de carga, vacío, error y falta de permisos. Confirmar acciones destructivas y proteger cambios sin guardar.
- Diseñar para teclado y tacto, etiquetas y foco visibles, contraste WCAG AA y preferencias de movimiento reducido. Validar anchos móviles y escritorio cuando exista UI.
- No elegir stack ni instalar bibliotecas por recomendación de una Skill sin una tarea de desarrollo que lo requiera.

## Scripts y red
No hay hooks automáticos autorizados. No ejecutar `impeccable hooks on`, aprobar hooks en `/hooks`, instalar plugins globales ni añadir hooks de Git.
Revisar comandos antes de ejecutarlos. Mantener TLS y checksums. Impeccable puede descargar su motor desde GitHub y escribir caché al invocarse; usar caché local ignorada o temporal. Taste puede abrir Chromium por CDP, guardar capturas y descargar imágenes: usar solo páginas de prueba sin sesiones sensibles; conservar créditos/licencias. Si se usa draw, definir `TASTE_SKILL_HISTORY` en una ubicación temporal o local ignorada para evitar historial global.
No enviar información de empresas, usuarios, secretos ni capturas sensibles a servicios externos. No desactivar políticas de red para sortear bloqueos.

## Verificación
Las 18 Skills están versionadas como archivos reales bajo `.agents/skills/`. Consultar `docs/skills-setup.md` y `docs/skills-sources.json` para procedencia, límites y verificación. Abrir una sesión nueva de Codex desde este repositorio para refrescar el catálogo; invocar por su nombre, por ejemplo `$impeccable`, `$design-taste-frontend` o `$mobile-native`.
