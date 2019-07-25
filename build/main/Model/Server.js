"use strict";
const https_1 = require("https");
const Request_1 = require("./Request");
const Routing_1 = require("./Routing");
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
            this.listen(443);
        }
        async dispatchRequest(request, response) {
            console.log(request.getRequestedPath());
            const ROUTER = new Routing_1.Routing();
            await ROUTER.loadRoutingFile();
            console.log(ROUTER.getRoutes());
            response.setHeader("Content-Type", "application/json");
            response.write(JSON.stringify({ success: true, message: "Hello World!" }));
            response.end();
        }
    }
    Model.Server = Server;
})(Model || (Model = {}));
module.exports = Model;
