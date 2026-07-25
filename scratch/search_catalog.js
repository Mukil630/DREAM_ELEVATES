import fs from "fs";
import path from "path";

function searchWord(dir, word) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== ".next" && file !== "scratch") {
        searchWord(fullPath, word);
      }
    } else if (file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.toLowerCase().includes(word.toLowerCase())) {
        console.log(`FOUND "${word}" IN:`, fullPath);
      }
    }
  }
}

searchWord("C:/Users/mukil/DREAM_BAKES", "catalog");
