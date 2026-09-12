import fs from "node:fs";
const required=["index.html","app.js","extra-questions-v4966.js","extra-questions-high2-v4973.js","version.json","AGENTS.md"];
const missing=required.filter(f=>!fs.existsSync(f));
if(missing.length){console.error("Missing release files:",missing.join(", "));process.exit(1);}
const v=JSON.parse(fs.readFileSync("version.json","utf8"));
const html=fs.readFileSync("index.html","utf8");
const app=fs.readFileSync("app.js","utf8");
if(!html.includes(`V${v.version}`)){console.error("Version mismatch in index.html");process.exit(1);}
if(!html.includes("extra-questions-high2-v4973.js")){console.error("High2 module missing");process.exit(1);}
for(const id of ["school","term","exam","score","wrongN","doneN","bankTotalN"]){
 if(!html.includes(`id="${id}"`)){console.error(`Critical UI id missing: ${id}`);process.exit(1);}
}
for(const fn of ["connectDB","chooseSet","startMock"]){
 if(!app.includes(`function ${fn}`)&&!app.includes(`async function ${fn}`)){console.error(`Critical function missing: ${fn}`);process.exit(1);}
}
console.log(`Validation OK — V${v.version}`);
