"use strict";
const https_1 = require("https");
const Request_1 = require("./Request");
const Routing_1 = require("./Routing");
const fs_1 = require("fs");
var Model;
(function (Model) {
    class Server extends https_1.Server {
        constructor(options, listener) {
            super(options, listener);
        }
        handleRequest(message, response) {
            let request = new Request_1.Request(message);
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
        start() {
            this.listen(443);
        }
        async dispatchRequest(request, response) {
            const ROUTER = new Routing_1.Routing();
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
                const PUBLIC_PATH = `${__dirname}/../../www`;
                try {
                    const POSSIBLE_FILE = await fs_1.promises.stat(`${PUBLIC_PATH}/${request.getRequestedPath()}`);
                    if (!POSSIBLE_FILE.isFile()) {
                        throw new Error("Requested file does not exist");
                    }
                    const FILE = await fs_1.promises.readFile(`${PUBLIC_PATH}/${request.getRequestedPath()}`);
                    response.write(FILE);
                    response.end();
                }
                catch (e) {
                    throw new Error("Requested file does not exist");
                }
            }
            else {
                try {
                    const FILE_STATS = await fs_1.promises.stat(`${__dirname}/../Controller/${controller_name}.js`);
                    if (!FILE_STATS.isFile()) {
                        throw new Error("The requested controller is not a file.");
                    }
                    const REQUESTED_CONTROLLER_CLASS = require(`${__dirname}/../Controller/${controller_name}.js`);
                    if (REQUESTED_CONTROLLER_CLASS.hasOwnProperty(controller_name)) {
                        const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[controller_name];
                        if (REQUESTED_CONTROLLER[action_name] !== undefined && REQUESTED_CONTROLLER[action_name] instanceof Function) {
                            await REQUESTED_CONTROLLER[action_name](request, response);
                        }
                        else {
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    Model.Server = Server;
})(Model || (Model = {}));
module.exports = Model;
