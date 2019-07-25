"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = require("https");
var Model;
(function (Model) {
    class Server extends https_1.Server {
        constructor(options, listener) {
            super(options, listener);
        }
        handleRequest(request, response) {
            console.log(request, response);
        }
    }
    Model.Server = Server;
})(Model || (Model = {}));
