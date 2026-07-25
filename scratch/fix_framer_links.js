import fs from "fs";
import path from "path";

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== ".next") {
        scanDirectory(fullPath);
      }
    } else if (file.endsWith(".html") || file.endsWith(".js") || file.endsWith(".tsx") || file.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("framer.app")) {
        console.log("FOUND framer.app LINK IN:", fullPath);
      }
    }
  }
}

scanDirectory("C:/Users/mukil/DREAM_BAKES");
