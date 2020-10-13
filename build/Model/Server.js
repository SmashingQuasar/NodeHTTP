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
                this.dispatchRequest(request, response);
            });
        }
        start() {
            this.listen(9999);
        }
        async dispatchRequest(request, response) {
            const ROUTER = new Routing_1.Routing();
            await ROUTER.loadRoutingFile();
            const ROUTES = ROUTER.getRoutes();
            ROUTES.forEach(async (route) => {
                const MATCHES = request.getRequestedPath().match(route.regexp);
                if (MATCHES !== null) {
                    const QUERY = {};
                    const KEYS = Object.keys(route.variables);
                    KEYS.forEach((name) => {
                        const VARIABLE_REFERENCE = route.variables[name];
                        if (VARIABLE_REFERENCE.match(/^\$[0-9]+$/) === null) {
                        }
                        const INDEX = parseInt(VARIABLE_REFERENCE.substring(1));
                        if (MATCHES[INDEX] === undefined || MATCHES[INDEX] === null) {
                        }
                        QUERY[name] = MATCHES[INDEX];
                    });
                    request.setQuery(QUERY);
                    const CONTROLLER_NAME = `${route.controller}Controller`;
                    const ACTION_NAME = `${route.action}Action`;
                    try {
                        const FILE_STATS = await fs_1.promises.stat(`${__dirname}/../Controller/${CONTROLLER_NAME}.js`);
                        if (!FILE_STATS.isFile()) {
                            throw new Error("The requested controller is not a file.");
                        }
                        const REQUESTED_CONTROLLER_CLASS = require(`${__dirname}/../Controller/${CONTROLLER_NAME}.js`);
                        if (REQUESTED_CONTROLLER_CLASS.hasOwnProperty(CONTROLLER_NAME)) {
                            const REQUESTED_CONTROLLER = new REQUESTED_CONTROLLER_CLASS[CONTROLLER_NAME];
                            if (REQUESTED_CONTROLLER[ACTION_NAME] !== undefined && REQUESTED_CONTROLLER[ACTION_NAME] instanceof Function) {
                                await REQUESTED_CONTROLLER[ACTION_NAME](request, response);
                            }
                            else {
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
            });
        }
    }
    Model.Server = Server;
})(Model || (Model = {}));
module.exports = Model;
