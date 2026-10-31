import { build } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

// A real single-file application: IIFE code, styles, fonts and favicon are embedded.
// No CDN, module loader, web server, API or credentials are required by the file.
const result = await build({
  configFile: resolve("vite.config.js"),
  build: {
    write: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve("src/main.jsx"),
      output: { format: "iife", name: "ArvexDemo", inlineDynamicImports: true },
    },
  },
});
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (r) => r.output,
);
const scripts = output.filter((o) => o.type === "chunk");
const styles = output.filter(
  (o) => o.type === "asset" && o.fileName.endsWith(".css"),
);
const remainingAssets = output.filter(
  (o) => o.type === "asset" && !o.fileName.endsWith(".css"),
);
if (scripts.length !== 1 || styles.length !== 1 || remainingAssets.length) {
  throw new Error(
    "Standalone build must contain one script, one stylesheet and no external assets.",
  );
}
const js = scripts[0].code.replace(/<\/script/gi, "<\\/script");
const css = String(styles[0].source).replace(/<\/style/gi, "<\\/style");
const icon = Buffer.from(await readFile("public/favicon.svg")).toString(
  "base64",
);
const fontLicense = (
  await readFile("node_modules/@fontsource/dm-sans/LICENSE", "utf8")
).replace(/--/g, "- -");
const html = `<!doctype html>
<!-- Bundled font license: DM Sans
${fontLicense}
-->
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f2f4f7">
<meta name="description" content="ARVEX: demo administrativa interactiva. Solo datos ficticios, sin cobros reales.">
<meta name="robots" content="noindex,nofollow">
<title>ARVEX · Demo administrativa</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${icon}">
<style>${css}</style>
</head>
<body><div id="root"></div><noscript>Activa JavaScript para explorar la demo interactiva de ARVEX.</noscript><script>${js}</script></body>
</html>
`;
await mkdir("standalone", { recursive: true });
await writeFile("standalone/arvex-demo.html", html);
console.log(
  `Standalone: ${Buffer.byteLength(html)} bytes, one HTML file, no external assets.`,
);
