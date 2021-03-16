import "regenerator-runtime/runtime";
import readline from "readline";
import Koa from "koa";
import serve from "koa-static";
import mount from "koa-mount";
import cors from "@koa/cors";
import bodyParser from "co-body";
import open from "bopen";
import ConfigManager from "./ConfigManager";
import WebSocket from "./WebSocket";
import Service from "./Service";
import Logger from "./Logger";
import { createServer } from "http";

const PORT = 8082;

readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const run = async () => {
	process.title = "Streamer Command Center";

	const config = new ConfigManager();
	Logger.log("Loading config...");
	await config.loadConfig();
	Logger.log("Config loaded");

	Logger.log("Starting server...");
	const app = new Koa();
	app.use(cors({ origin: "*" }));
	app.use(async (ctx, next) => {
		if (ctx.path.startsWith("/api/")) ctx.body = await bodyParser.json(ctx);
		return next();
	});

	const http = createServer(app.callback());
	const service = new Service(config);
	const ws = new WebSocket(config, http);

	// Api
	service.registerRoute();
	const api = new Koa().use(service.router.routes()).use(service.router.allowedMethods());
	app.use(mount("/api", api));

	// SPA
	const staticPath = process.env.NODE_ENV !== "production" ? `${__dirname}/static` : "./static";
	app.use(mount("/", new Koa().use(serve(staticPath))));
	app.use(async (ctx, next) => {
		return await serve(staticPath)(Object.assign(ctx, { path: "index.html" }), next);
	});
	Logger.log(`Serving static file from ${staticPath}`);

	ws.run();
	http.listen(PORT, () => {
		Logger.log("Server Started!");
		Logger.info(
			`Open http://localhost:${PORT} on your web browser to access the configuration menu`
		);
		if (process.env.NODE_ENV === "production") open(`http://localhost:${PORT}`);
	});
};

run();
