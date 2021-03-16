const { exec } = require("child_process");
const archiver = require("archiver");
const copyfiles = require("copyfiles");
const fs = require("fs");

const package = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const appName = `${package.name}_${package.version}`;
const targetFolder = `./build/${appName}`;

fs.rmdirSync("./build", { recursive: true });
fs.rmdirSync("./dist", { recursive: true });

const run = exec(
	`concurrently "npm:build:web" "npm:build:server -- -rn ${package.name} -rv ${package.version} -d ${targetFolder}"`
);
run.stdout.on("data", console.log);

run.on("close", () => {
	copyfiles(["./dist/static/**/*", "./dist/template/**/*", targetFolder], { up: 1 }, () => {
		const output = fs.createWriteStream(`./build/${appName}.zip`);
		const archive = archiver("zip");
		archive.pipe(output);
		archive.directory(`${targetFolder}`, appName);
		archive.finalize();
	});
});
