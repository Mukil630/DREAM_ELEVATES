import fs from "fs";

const indexHtml = fs.readFileSync("C:/Users/mukil/DREAM_BAKES/index.html", "utf8");
const menuHtml = fs.readFileSync("C:/Users/mukil/DREAM_BAKES/menu/index.html", "utf8");

console.log("index.html contains framer-1oq9ibc?:", indexHtml.includes("framer-1oq9ibc"));
console.log("menu/index.html contains framer-1oq9ibc?:", menuHtml.includes("framer-1oq9ibc"));

// Search all framer container classes in menu/index.html
const framerContainers = menuHtml.match(/class=["'][^"']*framer-[^"']*["']/g) || [];
console.log("Total Framer classes in menu/index.html:", framerContainers.length);

// Check links in menu/index.html
const framerAppLinksIndex = (indexHtml.match(/https:\/\/[^"' ]*framer\.app[^"' ]*/g) || []);
console.log("External Framer links in index.html:", [...new Set(framerAppLinksIndex)]);

const framerAppLinksMenu = (menuHtml.match(/https:\/\/[^"' ]*framer\.app[^"' ]*/g) || []);
console.log("External Framer links in menu/index.html:", [...new Set(framerAppLinksMenu)]);
