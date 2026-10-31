# Skills de ARVEX: instalación y verificación

Instalación exclusivamente de proyecto; no se desarrolló la aplicación. Se conservó README.md y no se reemplazaron archivos preexistentes. Las Skills son copias reales versionadas, sin enlaces a /tmp ni instalaciones globales. No hay hooks de Codex o Git añadidos.

## Fuentes oficiales consultadas

- https://github.com/pbakaus/impeccable#readme — instalación Codex, alcance proyecto y alternativa Manual copy.
- https://github.com/pbakaus/impeccable/blob/main/docs/CLI-CONTRACT.md — opción `--no-hooks` y comportamiento del instalador.
- https://github.com/Leonxlnx/taste-skill#readme — Skill actual `design-taste-frontend`, Node 22+ y navegador.
- https://github.com/emilkowalski/skills#readme — colección de 16 Skills.
- https://github.com/vercel-labs/skills#readme — alcance de proyecto por defecto y desactivación de telemetría.

Los commits exactos están en skills-sources.json. skills-lock.json es el registro producido por el CLI para Taste y Emil; la instalación manual de Impeccable se registra por separado en skills-sources.json. No atribuirle cobertura del lockfile de ese CLI.

## Entorno y comandos ejecutados

Node v24.19.0, npm 11.9.0, Chromium 154.0.8037.57 y Codex CLI 0.163.0. Acceso comprobado a GitHub y registry.npmjs.org mediante el proxy existente, con TLS e integridad de npm conservados. La ejecución con red necesitó el permiso del ejecutor; no se cambió la política de red.

Desde la raíz de ARVEX-SOLUTIONS se ejecutaron:

```sh
npm_config_ignore_scripts=true npx --yes impeccable@4.8.0 install --providers=codex --scope=project --no-hooks
DISABLE_TELEMETRY=1 npm_config_ignore_scripts=true npx --yes skills@1.7.4 add Leonxlnx/taste-skill -a codex -y
DISABLE_TELEMETRY=1 npm_config_ignore_scripts=true npx --yes skills@1.7.4 add emilkowalski/skills -a codex -y
```

El primer comando falló al descargar `https://impeccable.style/api/download/bundle/universal`: el proxy no pudo conectar y el CLI indicó que no instaló nada. Se completó mediante la alternativa oficial: copiar `.agents/skills/impeccable` del repositorio oficial revisado a la misma ruta del proyecto, solo tras comprobar que el destino no existía. No fue necesario habilitar ese dominio para obtener la Skill. Para usar esa vía de instalación en el futuro, habilitar `impeccable.style` en los destinos de red del entorno y comprobar también los destinos de sus redirecciones; no desactivar TLS ni el proxy.

No repetir los comandos sobre carpetas existentes sin revisar diferencias: los instaladores pueden reemplazar Skills. Para una nueva copia del proyecto, `git clone` restaura todos los archivos de las Skills; no hace falta ejecutar npx de nuevo.

## Revisión de scripts y permisos

- Impeccable: revisados package.json, shim npm, contrato/código de instalación y launcher shell de la distribución Codex. No se usó `--force`. El launcher puede descargar un motor fijado desde releases de GitHub, verificar SHA-256 y ejecutar el binario; conserva los checksums oficiales. No se ejecutaron context, init ni el detector: esta fase no debe generar contexto de producto ni desarrollar UI. La disponibilidad del motor en una sesión futura no está validada por la carga del SKILL.md.
- CLI skills: revisados documentación, package.json y rutas de instalación/copia. Alcance proyecto por defecto; no se pasó `-g`. `npm_config_ignore_scripts=true` evita scripts de ciclo de vida npm; no bloquea la ejecución explícita del CLI. Telemetría y solicitudes de auditoría remota del CLI se desactivaron con DISABLE_TELEMETRY.
- Taste: scripts Node sin dependencias de terceros; pueden escribir archivos/capturas, abrir un navegador por CDP y consultar/descargar recursos de archivos de imágenes. draw guarda historial de usuario por defecto: definir TASTE_SKILL_HISTORY temporal/local al usarlo. No se ejecutó el flujo creativo ni se descargaron imágenes.
- Emil: las 16 Skills contienen Markdown, no scripts ejecutables. Sus recomendaciones pueden proponer instalaciones o cambios posteriores; requieren una tarea autorizada y revisión contextual.
- No se añadieron hooks, permisos persistentes, credenciales ni configuraciones globales. Las Skills ejecutan herramientas con los permisos del agente: la instalación no les concede autoridad adicional.

## Comprobaciones realizadas

- `skills/list` del app-server de Codex, con `forceReload: true` y cwd de este proyecto: **18 Skills habilitadas, scope repo, cero errores**. Se usó CODEX_HOME temporal para que el servidor no escribiera en el directorio global de Codex de solo lectura. No se ejecutó un modelo ni se inició una tarea de desarrollo. Resumen en skills-verification.json.
- Las 18 carpetas coinciden archivo por archivo con los commits oficiales revisados.
- 126 archivos comprobados con SHA-256: `sha256sum --check docs/skills-sha256.txt` desde la raíz.
- Sintaxis shell del launcher y sintaxis Node de todos los scripts .mjs de Taste verificadas.
- No hay enlaces simbólicos ni manifiestos de hooks instalados. No se verificó una UI porque aún no hay aplicación.

Abrir una sesión nueva de Codex desde ARVEX-SOLUTIONS para que el cliente actualice su catálogo. Probar la selección de `$impeccable`, `$design-taste-frontend` o `$mobile-native` sin pedir implementación. Los subcomandos audit/polish/adapt pertenecen a impeccable; no son Skills separadas. Para otras carpetas del equipo, estas Skills no se instalan globalmente.

El uso futuro de búsqueda de imágenes de Taste puede requerir destinos de red adicionales (por ejemplo api.openverse.org, commons.wikimedia.org o images-api.nasa.gov según el proveedor elegido). No se amplió la lista de red para funciones no usadas. Conservar licencias y créditos antes de incorporar recursos al producto.

Nota de formato: `git diff --cached --check` detecta espacios finales y CRLF heredados de los archivos oficiales de Impeccable y un salto final en write-swift. Se preservan las copias upstream sin alterarlas; la comprobación de los archivos propios de configuración no presenta errores.
