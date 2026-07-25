import fs from "fs";
import path from "path";

function findMenuLinks(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const regex = /href=["']([^"']*menu[^"']*)["']/gi;
  let match;
  console.log(`=== LINKS IN ${path.basename(filePath)} ===`);
  while ((match = regex.exec(content)) !== null) {
    console.log("Matched href:", match[1]);
  }
}

findMenuLinks("C:/Users/mukil/DREAM_BAKES/index.html");
findMenuLinks("C:/Users/mukil/DREAM_BAKES/menu/index.html");
