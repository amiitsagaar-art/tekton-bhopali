const fs = require("fs");
const file = "src/components/TektonApp.tsx";
const content = fs.readFileSync(file, "utf8");
content.split("\n").forEach((line, index) => {
  if (line.includes("isAdmin")) {
    console.log(index + 1, ": ", line.trim());
  }
});
