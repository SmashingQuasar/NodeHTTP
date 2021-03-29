import { Server as HTTPSServer } from "https";
import { Request } from "./Request.js";
import { Routing } from "./Routing.js";
import { promises as FileSystem } from "fs";
import { type as OSType } from "os";
class Server extends HTTPSServer {
    constructor(options, listener) {
        super(options, listener);
        this.port = 443;
    }
    handleRequest(message, response) {
        let request = new Request(message);
        let body = "";
        message.addListener("data", (chunk) => {
            body += chunk.toString("binary");
        });
        message.addListener("end", async () => {
            await request.setRawBody(body);
            try {
                await this.dispatchRequest(request, response);
            }
            catch (e) {
                console.log("Custom error:", e);
                response.statusCode = 404;
                response.end("404 - Not found.");
            }
        });
    }
    async start() {
        let dirname = "";
        if (OSType() === "Linux") {
            dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
        }
        else {
            dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        }
        const __DIRNAME__ = dirname;
        const CONFIGURATION_FILE = await FileSystem.readFile(`${__DIRNAME__}/../../../private/Resources/configuration/server.json`);
        if (CONFIGURATION_FILE instanceof Buffer) {
        }
        else {
            const CONFIGURATION = JSON.parse(CONFIGURATION_FILE);
            if (CONFIGURATION.port !== undefined) {
                this.port = CONFIGURATION.port;
            }
        }
        this.listen(this.port);
        console.log("Server started.");
    }
    async dispatchRequest(request, response) {
        let dirname = "";
        if (OSType() === "Linux") {
            dirname = import.meta.url.replace(/^file:\/\/\/(.*)\/[^\/]+$/, "/$1");
        }
        else {
            dirname = import.meta.url.replace(/^file:\/\/\/[A-Z]\:(.*)\/[^\/]+$/, "$1");
        }
        const __DIRNAME__ = dirname;
        const ROUTER = new Routing();
        await ROUTER.loadRoutingFile();
        const ROUTES = ROUTER.getRoutes();
        let controller_name;
        let action_name;
        await Promise.all(ROUTES.map(async (route) => {
            const MATCHES = request.getRequestedPath().match(route.regexp);
            if (MATCHES !== null) {
                const QUERY = {};
                const KEYS = Object.keys(route.variables);
                await Promise.all(KEYS.map((name) => {
                    const VARIABLE_REFERENCE = route.variables[name];
                    if (VARIABLE_REFERENCE.match(/^\$[0-9]+$/) === null) {
                    }
                    const INDEX = parseInt(VARIABLE_REFERENCE.substring(1));
                    if (MATCHES[INDEX] === undefined || MATCHES[INDEX] === null) {
                    }
                    QUERY[name] = MATCHES[INDEX];
                }));
                request.setQuery(QUERY);
                controller_name = `${route.controller}Controller`;
                action_name = `${route.action}Action`;
            }
        }));
        if (controller_name === undefined || action_name === undefined) {
            const PUBLIC_PATH = `${__DIRNAME__}/../../../www`;
            try {
                const POSSIBLE_FILE = await FileSystem.stat(`${PUBLIC_PATH}/${request.getRequestedPath()}`);
                if (!POSSIBLE_FILE.isFile()) {
                    throw new Error("Requested file does not exist");
                }
                const FILE = await FileSystem.readFile(`${PUBLIC_PATH}/${request.getRequestedPath()}`);
                response.write(FILE);
                response.end();
            }
            catch (e) {
                throw new Error("Requested file does not exist");
            }
        }
        else {
            try {
                const CLASS_PATH = `${__DIRNAME__}/../Controller/${controller_name}.js`;
                const FILE_STATS = await FileSystem.stat(CLASS_PATH);
                if (!FILE_STATS.isFile()) {
                    throw new Error("The requested controller is not a file.");
                }
                const REQUESTED_CONTROLLER_CLASS = await import(CLASS_PATH);
                const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[controller_name];
                if (REQUESTED_CONTROLLER[action_name] !== undefined && REQUESTED_CONTROLLER[action_name] instanceof Function) {
                    await REQUESTED_CONTROLLER[action_name](request, response);
                }
                else {
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}
export { Server };
