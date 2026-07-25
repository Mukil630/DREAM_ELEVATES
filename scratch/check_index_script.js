import fs from "fs";

const indexHtml = fs.readFileSync("C:/Users/mukil/DREAM_BAKES/index.html", "utf8");
console.log("INDEX HAS loadMenu?:", indexHtml.includes("loadMenu"));
console.log("INDEX HAS api/products?:", indexHtml.includes("api/products"));
console.log("INDEX HAS api/menu-items?:", indexHtml.includes("api/menu-items"));
console.log("INDEX HAS menuGrid?:", indexHtml.includes("menuGrid"));
