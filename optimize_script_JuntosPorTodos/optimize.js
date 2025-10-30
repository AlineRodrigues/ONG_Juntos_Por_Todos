
/**
 * Otimização e Acessibilidade Automática - JuntosPorTodos
 * Requisitos: Node.js 18+
 */

import fs from "fs";
import path from "path";
import CleanCSS from "clean-css";
import htmlMinifier from "html-minifier-terser";
import terser from "terser";
import sharp from "sharp";

const srcDir = "./";
const distDir = "./dist";

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

const walk = (dir) => {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else results.push(file);
  });
  return results;
};

async function optimize() {
  const files = walk(srcDir);

  for (const file of files) {
    const ext = path.extname(file);
    const relPath = path.relative(srcDir, file);
    const outPath = path.join(distDir, relPath);
    const outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    if (ext === ".html") {
      let content = fs.readFileSync(file, "utf8");
      content = content
        .replace(/<html(.*?)>/, `<html$1 lang="pt-BR">`)
        .replace(/<body(.*?)>/, `<body$1 tabindex="0">`)
        .replace(/<\/body>/, `<button id="toggle-theme" aria-label="Alternar modo escuro/claro">🌓</button>\n</body>`);

      const minified = await htmlMinifier.minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      });

      fs.writeFileSync(outPath, minified);
    }

    else if (ext === ".css") {
      let css = fs.readFileSync(file, "utf8");

      if (!css.includes(":root[data-theme='dark']")) {
        css += `
:root[data-theme='dark'] {
  --bg-color: #111;
  --text-color: #fff;
  --link-color: #4da3ff;
}
body[data-theme='dark'] {
  background-color: var(--bg-color);
  color: var(--text-color);
}
`;
      }

      const minified = new CleanCSS().minify(css).styles;
      fs.writeFileSync(outPath, minified);
    }

    else if (ext === ".js") {
      const js = fs.readFileSync(file, "utf8");
      const minified = await terser.minify(js);
      fs.writeFileSync(outPath, minified.code);
    }

    else if ([".jpg", ".jpeg", ".png"].includes(ext)) {
      await sharp(file).resize({ width: 1200 }).toFile(outPath);
    }

    else fs.copyFileSync(file, outPath);
  }

  const scriptDarkMode = `
  <script>
  document.getElementById('toggle-theme').addEventListener('click', () => {
    const theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });
  const saved = localStorage.getItem('theme');
  if (saved) document.body.dataset.theme = saved;
  </script>`;
  fs.appendFileSync(path.join(distDir, "index.html"), scriptDarkMode);

  console.log("✅ Projeto otimizado e acessível gerado em /dist");
}

optimize();
