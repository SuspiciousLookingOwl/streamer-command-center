import "colors";

export default class Logger {
	static log(message: string): void {
		console.log(`[LOG] ${message}`);
	}

	static info(message: string): void {
		console.info(`[INFO] ${message}`.green);
	}

	static warn(message: string): void {
		console.info(`[WARN] ${message}`.yellow);
	}

	static error(message: string): void {
		console.error(`[ERR] ${message}`.red);
	}
}
