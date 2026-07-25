import fs from "fs";
import path from "path";

function replaceFramerAppLinks(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  const originalLength = content.length;
  
  content = content
    .replace(/https:\/\/polite-professionals-014489\.framer\.app\/menu/g, "/menu")
    .replace(/https:\/\/polite-professionals-014489\.framer\.app\/about-us/g, "/about-us")
    .replace(/https:\/\/polite-professionals-014489\.framer\.app\/contact/g, "/contact")
    .replace(/https:\/\/polite-professionals-014489\.framer\.app\/blog/g, "/blog")
    .replace(/https:\/\/polite-professionals-014489\.framer\.app\//g, "/")
    .replace(/https:\/\/polite-professionals-014489\.framer\.app/g, "/");

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Replaced links in ${path.basename(filePath)}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== ".next" && file !== "scratch") {
        processDirectory(fullPath);
      }
    } else if (file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".tsx") || file.endsWith(".ts")) {
      replaceFramerAppLinks(fullPath);
    }
  }
}

processDirectory("C:/Users/mukil/DREAM_BAKES");
console.log("REPLACEMENT_COMPLETE!");
