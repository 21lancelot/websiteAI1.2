import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import CleanCSS from "clean-css";
import { minify as terserMinify } from "terser";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const minifyCss = async () => {
  const inputPath = path.join(root, "assets/css/styles.css");
  const outputPath = path.join(root, "assets/css/styles.min.css");
  const source = await readFile(inputPath, "utf8");
  const result = new CleanCSS({
    level: 2
  }).minify(source);

  if (result.errors.length) {
    throw new Error(`CSS minification failed: ${result.errors.join("\n")}`);
  }

  await writeFile(outputPath, result.styles, "utf8");
};

const minifyJs = async () => {
  const files = [
    { input: "assets/js/roster.js", output: "assets/js/roster.min.js" },
    { input: "assets/js/main.js", output: "assets/js/main.min.js" }
  ];

  for (const file of files) {
    const inputPath = path.join(root, file.input);
    const outputPath = path.join(root, file.output);
    const code = await readFile(inputPath, "utf8");
    const result = await terserMinify(code, {
      module: true,
      compress: {
        passes: 2,
        unsafe_arrows: true
      },
      mangle: false,
      format: {
        comments: false
      }
    });

    if (!result.code) {
      throw new Error(`JS minification returned empty output for ${file.input}`);
    }

    await writeFile(outputPath, result.code, "utf8");
  }
};

const run = async () => {
  await minifyCss();
  await minifyJs();
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
